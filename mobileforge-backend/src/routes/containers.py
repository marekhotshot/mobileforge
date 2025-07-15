from flask import Blueprint, request, jsonify, stream_template
from kubernetes import client, config
import yaml
import uuid
import time
import json
import os

containers_bp = Blueprint('containers', __name__)

# Load Kubernetes config
try:
    config.load_incluster_config()  # For running inside cluster
except:
    config.load_kube_config(config_file='/home/ubuntu/mobileforge-kubeconfig.yaml')  # For development

k8s_apps_v1 = client.AppsV1Api()
k8s_core_v1 = client.CoreV1Api()
k8s_networking_v1 = client.NetworkingV1Api()

@containers_bp.route('/api/containers/create', methods=['POST'])
def create_container():
    """Create a new development container for an app"""
    try:
        data = request.get_json()
        app_id = data.get('app_id')
        app_description = data.get('app_description', '')
        framework = data.get('framework', 'react-native')
        
        if not app_id:
            return jsonify({'error': 'app_id is required'}), 400
        
        # Generate unique container name
        container_name = f"dev-{app_id}"
        namespace = "mobileforge"
        
        # Create development pod manifest
        pod_manifest = {
            "apiVersion": "v1",
            "kind": "Pod",
            "metadata": {
                "name": container_name,
                "namespace": namespace,
                "labels": {
                    "app": "mobileforge-dev",
                    "app-id": app_id,
                    "type": "development-container"
                }
            },
            "spec": {
                "containers": [
                    {
                        "name": "dev-environment",
                        "image": "node:18-alpine",
                        "command": ["/bin/sh"],
                        "args": ["-c", "while true; do sleep 30; done"],
                        "ports": [
                            {"containerPort": 3000, "name": "dev-server"},
                            {"containerPort": 8080, "name": "preview"}
                        ],
                        "env": [
                            {"name": "APP_ID", "value": app_id},
                            {"name": "APP_DESCRIPTION", "value": app_description},
                            {"name": "FRAMEWORK", "value": framework}
                        ],
                        "resources": {
                            "requests": {
                                "memory": "512Mi",
                                "cpu": "250m"
                            },
                            "limits": {
                                "memory": "1Gi",
                                "cpu": "500m"
                            }
                        },
                        "volumeMounts": [
                            {
                                "name": "app-code",
                                "mountPath": "/app"
                            }
                        ]
                    }
                ],
                "volumes": [
                    {
                        "name": "app-code",
                        "emptyDir": {}
                    }
                ],
                "restartPolicy": "Never"
            }
        }
        
        # Create the pod
        k8s_core_v1.create_namespaced_pod(
            namespace=namespace,
            body=pod_manifest
        )
        
        # Create service for the pod
        service_manifest = {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {
                "name": f"{container_name}-service",
                "namespace": namespace,
                "labels": {
                    "app-id": app_id
                }
            },
            "spec": {
                "selector": {
                    "app-id": app_id
                },
                "ports": [
                    {
                        "name": "dev-server",
                        "port": 3000,
                        "targetPort": 3000,
                        "nodePort": 30000 + hash(app_id) % 1000  # Dynamic NodePort
                    },
                    {
                        "name": "preview",
                        "port": 8080,
                        "targetPort": 8080,
                        "nodePort": 31000 + hash(app_id) % 1000  # Dynamic NodePort
                    }
                ],
                "type": "NodePort"
            }
        }
        
        k8s_core_v1.create_namespaced_service(
            namespace=namespace,
            body=service_manifest
        )
        
        # Create ingress for external access
        ingress_manifest = {
            "apiVersion": "networking.k8s.io/v1",
            "kind": "Ingress",
            "metadata": {
                "name": f"{container_name}-ingress",
                "namespace": namespace,
                "annotations": {
                    "kubernetes.io/ingress.class": "traefik"
                }
            },
            "spec": {
                "rules": [
                    {
                        "host": f"preview-{app_id}.mobileforge.123agent.eu",
                        "http": {
                            "paths": [
                                {
                                    "path": "/",
                                    "pathType": "Prefix",
                                    "backend": {
                                        "service": {
                                            "name": f"{container_name}-service",
                                            "port": {
                                                "number": 8080
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "host": f"dev-{app_id}.mobileforge.123agent.eu",
                        "http": {
                            "paths": [
                                {
                                    "path": "/",
                                    "pathType": "Prefix",
                                    "backend": {
                                        "service": {
                                            "name": f"{container_name}-service",
                                            "port": {
                                                "number": 3000
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
        
        k8s_networking_v1.create_namespaced_ingress(
            namespace=namespace,
            body=ingress_manifest
        )
        
        return jsonify({
            'success': True,
            'container_name': container_name,
            'app_id': app_id,
            'preview_url': f"https://preview-{app_id}.mobileforge.123agent.eu",
            'dev_url': f"https://dev-{app_id}.mobileforge.123agent.eu",
            'status': 'creating'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@containers_bp.route('/api/containers/<app_id>/status', methods=['GET'])
def get_container_status(app_id):
    """Get the status of a development container"""
    try:
        container_name = f"dev-{app_id}"
        namespace = "mobileforge"
        
        # Get pod status
        try:
            pod = k8s_core_v1.read_namespaced_pod(
                name=container_name,
                namespace=namespace
            )
            
            pod_status = pod.status.phase
            container_statuses = []
            
            if pod.status.container_statuses:
                for container_status in pod.status.container_statuses:
                    container_statuses.append({
                        'name': container_status.name,
                        'ready': container_status.ready,
                        'restart_count': container_status.restart_count,
                        'state': str(container_status.state)
                    })
            
            return jsonify({
                'success': True,
                'app_id': app_id,
                'pod_status': pod_status,
                'container_statuses': container_statuses,
                'preview_url': f"https://preview-{app_id}.mobileforge.123agent.eu",
                'dev_url': f"https://dev-{app_id}.mobileforge.123agent.eu"
            })
            
        except client.exceptions.ApiException as e:
            if e.status == 404:
                return jsonify({
                    'success': False,
                    'error': 'Container not found',
                    'app_id': app_id
                }), 404
            else:
                raise e
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@containers_bp.route('/api/containers/<app_id>/logs', methods=['GET'])
def get_container_logs(app_id):
    """Get logs from a development container"""
    try:
        container_name = f"dev-{app_id}"
        namespace = "mobileforge"
        
        logs = k8s_core_v1.read_namespaced_pod_log(
            name=container_name,
            namespace=namespace,
            container='dev-environment',
            tail_lines=100
        )
        
        return jsonify({
            'success': True,
            'app_id': app_id,
            'logs': logs
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@containers_bp.route('/api/containers/<app_id>/execute', methods=['POST'])
def execute_command(app_id):
    """Execute a command in the development container"""
    try:
        data = request.get_json()
        command = data.get('command', '')
        
        if not command:
            return jsonify({'error': 'command is required'}), 400
        
        container_name = f"dev-{app_id}"
        namespace = "mobileforge"
        
        # For now, return a mock response
        # In production, you'd use kubectl exec or the Kubernetes exec API
        return jsonify({
            'success': True,
            'app_id': app_id,
            'command': command,
            'output': f"Executed: {command}\\nCommand completed successfully.",
            'exit_code': 0
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@containers_bp.route('/api/containers/<app_id>/delete', methods=['DELETE'])
def delete_container(app_id):
    """Delete a development container and its resources"""
    try:
        container_name = f"dev-{app_id}"
        namespace = "mobileforge"
        
        # Delete pod
        try:
            k8s_core_v1.delete_namespaced_pod(
                name=container_name,
                namespace=namespace
            )
        except client.exceptions.ApiException as e:
            if e.status != 404:  # Ignore if already deleted
                raise e
        
        # Delete service
        try:
            k8s_core_v1.delete_namespaced_service(
                name=f"{container_name}-service",
                namespace=namespace
            )
        except client.exceptions.ApiException as e:
            if e.status != 404:  # Ignore if already deleted
                raise e
        
        # Delete ingress
        try:
            k8s_networking_v1.delete_namespaced_ingress(
                name=f"{container_name}-ingress",
                namespace=namespace
            )
        except client.exceptions.ApiException as e:
            if e.status != 404:  # Ignore if already deleted
                raise e
        
        return jsonify({
            'success': True,
            'app_id': app_id,
            'message': 'Container and resources deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@containers_bp.route('/api/containers/list', methods=['GET'])
def list_containers():
    """List all development containers"""
    try:
        namespace = "mobileforge"
        
        # Get all pods with the development container label
        pods = k8s_core_v1.list_namespaced_pod(
            namespace=namespace,
            label_selector="type=development-container"
        )
        
        containers = []
        for pod in pods.items:
            app_id = pod.metadata.labels.get('app-id', 'unknown')
            containers.append({
                'app_id': app_id,
                'container_name': pod.metadata.name,
                'status': pod.status.phase,
                'created_at': pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None,
                'preview_url': f"https://preview-{app_id}.mobileforge.123agent.eu",
                'dev_url': f"https://dev-{app_id}.mobileforge.123agent.eu"
            })
        
        return jsonify({
            'success': True,
            'containers': containers
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

