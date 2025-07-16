"""
Kubernetes Pod Orchestration API
Handles dynamic pod creation, management, and resource allocation for development environments
"""

from flask import Blueprint, request, jsonify
from kubernetes import client, config
from kubernetes.client.rest import ApiException
import yaml
import os
import uuid
import time
from typing import Dict, List, Optional

k8s_bp = Blueprint('k8s', __name__)

# Initialize Kubernetes client
try:
    # Try to load in-cluster config first (when running in K8s)
    config.load_incluster_config()
except:
    # Fall back to kubeconfig file
    kubeconfig_path = os.getenv('KUBECONFIG', '/home/ubuntu/mobileforge-kubeconfig.yaml')
    if os.path.exists(kubeconfig_path):
        config.load_kube_config(config_file=kubeconfig_path)
    else:
        config.load_kube_config()

v1 = client.CoreV1Api()
apps_v1 = client.AppsV1Api()

# Default namespace for development pods
DEV_NAMESPACE = "mobileforge-dev"

def ensure_namespace():
    """Ensure the development namespace exists"""
    try:
        v1.read_namespace(name=DEV_NAMESPACE)
    except ApiException as e:
        if e.status == 404:
            # Create namespace if it doesn't exist
            namespace = client.V1Namespace(
                metadata=client.V1ObjectMeta(name=DEV_NAMESPACE)
            )
            v1.create_namespace(body=namespace)

def generate_pod_name(user_id: str, project_id: str) -> str:
    """Generate unique pod name"""
    unique_id = str(uuid.uuid4())[:8]
    return f"dev-{user_id}-{project_id}-{unique_id}".lower().replace('_', '-')

def create_development_pod_spec(pod_name: str, user_id: str, project_id: str, 
                               image: str = "node:18-alpine", 
                               resources: Dict = None) -> client.V1Pod:
    """Create a development pod specification"""
    
    if resources is None:
        resources = {
            "requests": {"cpu": "100m", "memory": "256Mi"},
            "limits": {"cpu": "500m", "memory": "512Mi"}
        }
    
    # Container specification
    container = client.V1Container(
        name="dev-container",
        image=image,
        command=["/bin/sh"],
        args=["-c", "while true; do sleep 30; done"],  # Keep container running
        resources=client.V1ResourceRequirements(
            requests=resources.get("requests", {}),
            limits=resources.get("limits", {})
        ),
        env=[
            client.V1EnvVar(name="USER_ID", value=user_id),
            client.V1EnvVar(name="PROJECT_ID", value=project_id),
            client.V1EnvVar(name="NODE_ENV", value="development")
        ],
        ports=[
            client.V1ContainerPort(container_port=3000, name="dev-server"),
            client.V1ContainerPort(container_port=8080, name="preview")
        ],
        volume_mounts=[
            client.V1VolumeMount(
                name="workspace",
                mount_path="/workspace"
            )
        ]
    )
    
    # Pod specification
    pod_spec = client.V1PodSpec(
        containers=[container],
        restart_policy="Always",
        volumes=[
            client.V1Volume(
                name="workspace",
                empty_dir=client.V1EmptyDirVolumeSource()
            )
        ]
    )
    
    # Pod metadata
    metadata = client.V1ObjectMeta(
        name=pod_name,
        namespace=DEV_NAMESPACE,
        labels={
            "app": "mobileforge-dev",
            "user-id": user_id,
            "project-id": project_id,
            "type": "development-environment"
        },
        annotations={
            "mobileforge.io/created-at": str(int(time.time())),
            "mobileforge.io/user-id": user_id,
            "mobileforge.io/project-id": project_id
        }
    )
    
    return client.V1Pod(
        api_version="v1",
        kind="Pod",
        metadata=metadata,
        spec=pod_spec
    )

@k8s_bp.route('/pods', methods=['POST'])
def create_development_pod():
    """Create a new development pod"""
    try:
        ensure_namespace()
        
        data = request.get_json()
        user_id = data.get('user_id', 'default')
        project_id = data.get('project_id', str(uuid.uuid4())[:8])
        image = data.get('image', 'node:18-alpine')
        resources = data.get('resources')
        
        pod_name = generate_pod_name(user_id, project_id)
        pod_spec = create_development_pod_spec(pod_name, user_id, project_id, image, resources)
        
        # Create the pod
        pod = v1.create_namespaced_pod(namespace=DEV_NAMESPACE, body=pod_spec)
        
        # Create service for the pod
        service_spec = client.V1Service(
            api_version="v1",
            kind="Service",
            metadata=client.V1ObjectMeta(
                name=f"{pod_name}-service",
                namespace=DEV_NAMESPACE,
                labels={"app": "mobileforge-dev", "pod": pod_name}
            ),
            spec=client.V1ServiceSpec(
                selector={"app": "mobileforge-dev", "user-id": user_id, "project-id": project_id},
                ports=[
                    client.V1ServicePort(name="dev-server", port=3000, target_port=3000),
                    client.V1ServicePort(name="preview", port=8080, target_port=8080)
                ],
                type="ClusterIP"
            )
        )
        
        service = v1.create_namespaced_service(namespace=DEV_NAMESPACE, body=service_spec)
        
        return jsonify({
            'success': True,
            'pod': {
                'name': pod.metadata.name,
                'namespace': pod.metadata.namespace,
                'status': pod.status.phase,
                'user_id': user_id,
                'project_id': project_id,
                'created_at': pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None
            },
            'service': {
                'name': service.metadata.name,
                'cluster_ip': service.spec.cluster_ip,
                'ports': [{'name': p.name, 'port': p.port} for p in service.spec.ports]
            }
        })
        
    except ApiException as e:
        return jsonify({'success': False, 'error': f'Kubernetes API error: {e.reason}'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@k8s_bp.route('/pods', methods=['GET'])
def list_development_pods():
    """List all development pods"""
    try:
        ensure_namespace()
        
        # Get query parameters
        user_id = request.args.get('user_id')
        project_id = request.args.get('project_id')
        
        # Build label selector
        label_selector = "app=mobileforge-dev"
        if user_id:
            label_selector += f",user-id={user_id}"
        if project_id:
            label_selector += f",project-id={project_id}"
        
        pods = v1.list_namespaced_pod(
            namespace=DEV_NAMESPACE,
            label_selector=label_selector
        )
        
        pod_list = []
        for pod in pods.items:
            pod_info = {
                'name': pod.metadata.name,
                'namespace': pod.metadata.namespace,
                'status': pod.status.phase,
                'user_id': pod.metadata.labels.get('user-id'),
                'project_id': pod.metadata.labels.get('project-id'),
                'created_at': pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None,
                'node_name': pod.spec.node_name,
                'pod_ip': pod.status.pod_ip
            }
            
            # Get container statuses
            if pod.status.container_statuses:
                container_status = pod.status.container_statuses[0]
                pod_info['container'] = {
                    'ready': container_status.ready,
                    'restart_count': container_status.restart_count,
                    'image': container_status.image
                }
            
            pod_list.append(pod_info)
        
        return jsonify({'success': True, 'pods': pod_list})
        
    except ApiException as e:
        return jsonify({'success': False, 'error': f'Kubernetes API error: {e.reason}'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@k8s_bp.route('/pods/<pod_name>', methods=['GET'])
def get_pod_details(pod_name: str):
    """Get detailed information about a specific pod"""
    try:
        ensure_namespace()
        
        pod = v1.read_namespaced_pod(name=pod_name, namespace=DEV_NAMESPACE)
        
        pod_details = {
            'name': pod.metadata.name,
            'namespace': pod.metadata.namespace,
            'status': pod.status.phase,
            'user_id': pod.metadata.labels.get('user-id'),
            'project_id': pod.metadata.labels.get('project-id'),
            'created_at': pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None,
            'node_name': pod.spec.node_name,
            'pod_ip': pod.status.pod_ip,
            'labels': pod.metadata.labels,
            'annotations': pod.metadata.annotations
        }
        
        # Get container details
        if pod.status.container_statuses:
            container_status = pod.status.container_statuses[0]
            pod_details['container'] = {
                'ready': container_status.ready,
                'restart_count': container_status.restart_count,
                'image': container_status.image,
                'state': {}
            }
            
            # Container state details
            if container_status.state.running:
                pod_details['container']['state'] = {
                    'status': 'running',
                    'started_at': container_status.state.running.started_at.isoformat()
                }
            elif container_status.state.waiting:
                pod_details['container']['state'] = {
                    'status': 'waiting',
                    'reason': container_status.state.waiting.reason,
                    'message': container_status.state.waiting.message
                }
            elif container_status.state.terminated:
                pod_details['container']['state'] = {
                    'status': 'terminated',
                    'reason': container_status.state.terminated.reason,
                    'exit_code': container_status.state.terminated.exit_code
                }
        
        return jsonify({'success': True, 'pod': pod_details})
        
    except ApiException as e:
        if e.status == 404:
            return jsonify({'success': False, 'error': 'Pod not found'}), 404
        return jsonify({'success': False, 'error': f'Kubernetes API error: {e.reason}'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@k8s_bp.route('/pods/<pod_name>', methods=['DELETE'])
def delete_development_pod(pod_name: str):
    """Delete a development pod and its associated service"""
    try:
        ensure_namespace()
        
        # Delete the pod
        v1.delete_namespaced_pod(name=pod_name, namespace=DEV_NAMESPACE)
        
        # Delete associated service
        service_name = f"{pod_name}-service"
        try:
            v1.delete_namespaced_service(name=service_name, namespace=DEV_NAMESPACE)
        except ApiException as e:
            if e.status != 404:  # Ignore if service doesn't exist
                raise
        
        return jsonify({'success': True, 'message': f'Pod {pod_name} and associated service deleted'})
        
    except ApiException as e:
        if e.status == 404:
            return jsonify({'success': False, 'error': 'Pod not found'}), 404
        return jsonify({'success': False, 'error': f'Kubernetes API error: {e.reason}'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@k8s_bp.route('/pods/<pod_name>/logs', methods=['GET'])
def get_pod_logs(pod_name: str):
    """Get logs from a development pod"""
    try:
        ensure_namespace()
        
        # Get query parameters
        tail_lines = request.args.get('tail_lines', 100, type=int)
        follow = request.args.get('follow', False, type=bool)
        
        logs = v1.read_namespaced_pod_log(
            name=pod_name,
            namespace=DEV_NAMESPACE,
            tail_lines=tail_lines,
            follow=follow
        )
        
        return jsonify({'success': True, 'logs': logs})
        
    except ApiException as e:
        if e.status == 404:
            return jsonify({'success': False, 'error': 'Pod not found'}), 404
        return jsonify({'success': False, 'error': f'Kubernetes API error: {e.reason}'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@k8s_bp.route('/pods/<pod_name>/exec', methods=['POST'])
def execute_command_in_pod(pod_name: str):
    """Execute a command in a development pod"""
    try:
        ensure_namespace()
        
        data = request.get_json()
        command = data.get('command', ['/bin/sh'])
        
        if isinstance(command, str):
            command = ['/bin/sh', '-c', command]
        
        # Note: This is a simplified version. For production, you'd want to use
        # the Kubernetes exec API with proper streaming support
        return jsonify({
            'success': True, 
            'message': 'Command execution endpoint ready',
            'note': 'Use WebSocket connection for real-time command execution'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@k8s_bp.route('/pods/<pod_name>/port-forward', methods=['POST'])
def create_port_forward(pod_name: str):
    """Create port forwarding for a development pod"""
    try:
        ensure_namespace()
        
        data = request.get_json()
        local_port = data.get('local_port', 8080)
        remote_port = data.get('remote_port', 3000)
        
        # Note: This would typically require setting up actual port forwarding
        # For now, return the service information
        service_name = f"{pod_name}-service"
        
        try:
            service = v1.read_namespaced_service(name=service_name, namespace=DEV_NAMESPACE)
            return jsonify({
                'success': True,
                'port_forward': {
                    'pod_name': pod_name,
                    'local_port': local_port,
                    'remote_port': remote_port,
                    'service_ip': service.spec.cluster_ip,
                    'access_url': f"http://{service.spec.cluster_ip}:{remote_port}"
                }
            })
        except ApiException as e:
            if e.status == 404:
                return jsonify({'success': False, 'error': 'Service not found'}), 404
            raise
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@k8s_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for Kubernetes API connectivity"""
    try:
        # Test connection by listing nodes
        nodes = v1.list_node()
        node_count = len(nodes.items)
        
        return jsonify({
            'success': True,
            'message': 'Kubernetes API connection healthy',
            'cluster_info': {
                'node_count': node_count,
                'namespace': DEV_NAMESPACE
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@k8s_bp.route('/cleanup', methods=['POST'])
def cleanup_old_pods():
    """Clean up old development pods"""
    try:
        ensure_namespace()
        
        data = request.get_json()
        max_age_hours = data.get('max_age_hours', 24)
        
        # Calculate cutoff time
        cutoff_time = time.time() - (max_age_hours * 3600)
        
        pods = v1.list_namespaced_pod(
            namespace=DEV_NAMESPACE,
            label_selector="app=mobileforge-dev"
        )
        
        deleted_pods = []
        for pod in pods.items:
            created_at = pod.metadata.annotations.get('mobileforge.io/created-at')
            if created_at and int(created_at) < cutoff_time:
                # Delete old pod
                v1.delete_namespaced_pod(name=pod.metadata.name, namespace=DEV_NAMESPACE)
                
                # Delete associated service
                service_name = f"{pod.metadata.name}-service"
                try:
                    v1.delete_namespaced_service(name=service_name, namespace=DEV_NAMESPACE)
                except ApiException as e:
                    if e.status != 404:
                        raise
                
                deleted_pods.append(pod.metadata.name)
        
        return jsonify({
            'success': True,
            'message': f'Cleaned up {len(deleted_pods)} old pods',
            'deleted_pods': deleted_pods
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

