from flask import Blueprint, request, jsonify
import json
import time
import os
from datetime import datetime, timedelta

apps_bp = Blueprint('apps', __name__)

# Mock database for apps
MOCK_APPS = {}

@apps_bp.route('/list', methods=['GET'])
def list_apps():
    """Get list of user's apps"""
    apps_list = []
    for app_id, app_data in MOCK_APPS.items():
        apps_list.append({
            'id': app_id,
            'name': app_data['name'],
            'description': app_data['description'],
            'framework': app_data['framework'],
            'status': app_data.get('status', 'draft'),
            'created_at': app_data['created_at'],
            'last_modified': app_data.get('last_modified', app_data['created_at'])
        })
    
    return jsonify({'apps': sorted(apps_list, key=lambda x: x['created_at'], reverse=True)})

@apps_bp.route('/<app_id>', methods=['GET'])
def get_app(app_id):
    """Get specific app details"""
    if app_id not in MOCK_APPS:
        return jsonify({'error': 'App not found'}), 404
    
    return jsonify(MOCK_APPS[app_id])

@apps_bp.route('/<app_id>', methods=['PUT'])
def update_app(app_id):
    """Update app details"""
    if app_id not in MOCK_APPS:
        return jsonify({'error': 'App not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Update app data
    app_data = MOCK_APPS[app_id]
    app_data.update(data)
    app_data['last_modified'] = time.time()
    
    return jsonify(app_data)

@apps_bp.route('/<app_id>', methods=['DELETE'])
def delete_app(app_id):
    """Delete an app"""
    if app_id not in MOCK_APPS:
        return jsonify({'error': 'App not found'}), 404
    
    del MOCK_APPS[app_id]
    return jsonify({'message': 'App deleted successfully'})

@apps_bp.route('/<app_id>/deploy', methods=['POST'])
def deploy_app(app_id):
    """Deploy app to specified platform"""
    if app_id not in MOCK_APPS:
        return jsonify({'error': 'App not found'}), 404
    
    data = request.get_json()
    platform = data.get('platform', 'web')
    
    # Mock deployment process
    deployment = {
        'id': f"deploy_{int(time.time())}",
        'app_id': app_id,
        'platform': platform,
        'status': 'deploying',
        'started_at': time.time(),
        'logs': [
            {'timestamp': time.time(), 'message': 'Starting deployment...'},
            {'timestamp': time.time() + 1, 'message': 'Building application...'},
            {'timestamp': time.time() + 2, 'message': 'Uploading to platform...'}
        ]
    }
    
    # Simulate deployment completion
    if platform == 'web':
        deployment['url'] = f"https://mobileforge-{app_id}.netlify.app"
        deployment['status'] = 'completed'
    elif platform == 'app-store':
        deployment['status'] = 'review'
        deployment['review_url'] = f"https://appstoreconnect.apple.com/apps/{app_id}"
    elif platform == 'play-store':
        deployment['status'] = 'review'
        deployment['review_url'] = f"https://play.google.com/console/apps/{app_id}"
    
    return jsonify(deployment)

@apps_bp.route('/<app_id>/analytics', methods=['GET'])
def get_app_analytics(app_id):
    """Get app analytics data"""
    if app_id not in MOCK_APPS:
        return jsonify({'error': 'App not found'}), 404
    
    # Generate mock analytics data
    now = datetime.now()
    analytics = {
        'app_id': app_id,
        'period': '30d',
        'metrics': {
            'downloads': 12400,
            'active_users': 8200,
            'retention_rate': 0.76,
            'rating': 4.8,
            'revenue': 2450.00
        },
        'trends': {
            'downloads': [
                {'date': (now - timedelta(days=i)).isoformat(), 'value': 400 + (i * 10)}
                for i in range(30, 0, -1)
            ],
            'active_users': [
                {'date': (now - timedelta(days=i)).isoformat(), 'value': 250 + (i * 5)}
                for i in range(30, 0, -1)
            ]
        },
        'top_countries': [
            {'country': 'United States', 'downloads': 3500, 'percentage': 28.2},
            {'country': 'United Kingdom', 'downloads': 1800, 'percentage': 14.5},
            {'country': 'Germany', 'downloads': 1200, 'percentage': 9.7},
            {'country': 'Canada', 'downloads': 950, 'percentage': 7.7},
            {'country': 'Australia', 'downloads': 800, 'percentage': 6.5}
        ],
        'device_types': [
            {'type': 'Mobile', 'percentage': 75.2},
            {'type': 'Tablet', 'percentage': 18.8},
            {'type': 'Desktop', 'percentage': 6.0}
        ]
    }
    
    return jsonify(analytics)

@apps_bp.route('/<app_id>/build', methods=['POST'])
def build_app(app_id):
    """Build app for specific platform"""
    if app_id not in MOCK_APPS:
        return jsonify({'error': 'App not found'}), 404
    
    data = request.get_json()
    platform = data.get('platform', 'android')
    build_type = data.get('build_type', 'debug')
    
    # Mock build process
    build = {
        'id': f"build_{int(time.time())}",
        'app_id': app_id,
        'platform': platform,
        'build_type': build_type,
        'status': 'building',
        'started_at': time.time(),
        'progress': 0,
        'logs': [
            {'timestamp': time.time(), 'level': 'info', 'message': 'Build started'},
            {'timestamp': time.time() + 1, 'level': 'info', 'message': 'Resolving dependencies...'},
            {'timestamp': time.time() + 2, 'level': 'info', 'message': 'Compiling source code...'}
        ]
    }
    
    return jsonify(build)

@apps_bp.route('/templates', methods=['GET'])
def get_templates():
    """Get available app templates"""
    templates = [
        {
            'id': 'fitness-tracker',
            'name': 'Fitness Tracker',
            'description': 'Complete fitness tracking app with workouts and progress monitoring',
            'category': 'Health & Fitness',
            'features': ['Workout plans', 'Progress tracking', 'Social sharing', 'Analytics'],
            'preview_image': '/api/static/templates/fitness-tracker.png',
            'framework': 'react-native'
        },
        {
            'id': 'e-commerce',
            'name': 'E-Commerce Store',
            'description': 'Full-featured online store with payment integration',
            'category': 'Business',
            'features': ['Product catalog', 'Shopping cart', 'Payment gateway', 'Order tracking'],
            'preview_image': '/api/static/templates/e-commerce.png',
            'framework': 'flutter'
        },
        {
            'id': 'social-media',
            'name': 'Social Media App',
            'description': 'Social networking platform with posts, messaging, and feeds',
            'category': 'Social',
            'features': ['User profiles', 'News feed', 'Messaging', 'Photo sharing'],
            'preview_image': '/api/static/templates/social-media.png',
            'framework': 'react-native'
        },
        {
            'id': 'productivity',
            'name': 'Task Manager',
            'description': 'Productivity app for task and project management',
            'category': 'Productivity',
            'features': ['Task lists', 'Project boards', 'Team collaboration', 'Time tracking'],
            'preview_image': '/api/static/templates/productivity.png',
            'framework': 'pwa'
        }
    ]
    
    return jsonify({'templates': templates})

@apps_bp.route('/create-from-template', methods=['POST'])
def create_from_template():
    """Create new app from template"""
    data = request.get_json()
    
    if not data or 'template_id' not in data:
        return jsonify({'error': 'Missing template_id'}), 400
    
    template_id = data['template_id']
    app_name = data.get('name', f'My {template_id.replace("-", " ").title()} App')
    
    # Create new app from template
    app_id = f"app_{int(time.time())}"
    app_data = {
        'id': app_id,
        'name': app_name,
        'description': f'App created from {template_id} template',
        'template_id': template_id,
        'framework': data.get('framework', 'react-native'),
        'status': 'draft',
        'created_at': time.time(),
        'files': [
            {
                'path': 'App.js',
                'content': f'// {app_name} - Generated from {template_id} template\n// TODO: Implement app logic'
            }
        ]
    }
    
    MOCK_APPS[app_id] = app_data
    
    return jsonify(app_data), 201

