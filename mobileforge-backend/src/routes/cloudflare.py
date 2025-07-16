"""
Cloudflare DNS and SSL Management API
Handles domain management, DNS records, and SSL certificates
"""

from flask import Blueprint, request, jsonify
import requests
import os
from typing import Dict, List, Optional

cloudflare_bp = Blueprint('cloudflare', __name__)

# Cloudflare API configuration
CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4"
CLOUDFLARE_API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN', '')

def get_headers():
    """Get Cloudflare API headers"""
    return {
        'Authorization': f'Bearer {CLOUDFLARE_API_TOKEN}',
        'Content-Type': 'application/json'
    }

@cloudflare_bp.route('/zones', methods=['GET'])
def list_zones():
    """List all Cloudflare zones (domains)"""
    try:
        response = requests.get(
            f"{CLOUDFLARE_API_BASE}/zones",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            zones = []
            for zone in data.get('result', []):
                zones.append({
                    'id': zone['id'],
                    'name': zone['name'],
                    'status': zone['status'],
                    'name_servers': zone.get('name_servers', []),
                    'created_on': zone['created_on']
                })
            return jsonify({'success': True, 'zones': zones})
        else:
            return jsonify({'success': False, 'error': 'Failed to fetch zones'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cloudflare_bp.route('/zones/<zone_id>/dns_records', methods=['GET'])
def list_dns_records(zone_id: str):
    """List DNS records for a zone"""
    try:
        response = requests.get(
            f"{CLOUDFLARE_API_BASE}/zones/{zone_id}/dns_records",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            records = []
            for record in data.get('result', []):
                records.append({
                    'id': record['id'],
                    'type': record['type'],
                    'name': record['name'],
                    'content': record['content'],
                    'ttl': record['ttl'],
                    'proxied': record.get('proxied', False)
                })
            return jsonify({'success': True, 'records': records})
        else:
            return jsonify({'success': False, 'error': 'Failed to fetch DNS records'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cloudflare_bp.route('/zones/<zone_id>/dns_records', methods=['POST'])
def create_dns_record(zone_id: str):
    """Create a new DNS record"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['type', 'name', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        # Prepare DNS record data
        dns_record = {
            'type': data['type'],
            'name': data['name'],
            'content': data['content'],
            'ttl': data.get('ttl', 1),  # 1 = automatic
            'proxied': data.get('proxied', False)
        }
        
        response = requests.post(
            f"{CLOUDFLARE_API_BASE}/zones/{zone_id}/dns_records",
            headers=get_headers(),
            json=dns_record
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({'success': True, 'record': result['result']})
        else:
            error_data = response.json()
            return jsonify({'success': False, 'error': error_data.get('errors', 'Failed to create DNS record')}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cloudflare_bp.route('/zones/<zone_id>/dns_records/<record_id>', methods=['DELETE'])
def delete_dns_record(zone_id: str, record_id: str):
    """Delete a DNS record"""
    try:
        response = requests.delete(
            f"{CLOUDFLARE_API_BASE}/zones/{zone_id}/dns_records/{record_id}",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            return jsonify({'success': True, 'message': 'DNS record deleted successfully'})
        else:
            return jsonify({'success': False, 'error': 'Failed to delete DNS record'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cloudflare_bp.route('/zones/<zone_id>/ssl/certificate_packs', methods=['GET'])
def list_ssl_certificates(zone_id: str):
    """List SSL certificates for a zone"""
    try:
        response = requests.get(
            f"{CLOUDFLARE_API_BASE}/zones/{zone_id}/ssl/certificate_packs",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            certificates = []
            for cert in data.get('result', []):
                certificates.append({
                    'id': cert['id'],
                    'type': cert['type'],
                    'status': cert['status'],
                    'validation_method': cert.get('validation_method'),
                    'validity_days': cert.get('validity_days'),
                    'certificate_authority': cert.get('certificate_authority'),
                    'hosts': cert.get('hosts', [])
                })
            return jsonify({'success': True, 'certificates': certificates})
        else:
            return jsonify({'success': False, 'error': 'Failed to fetch SSL certificates'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cloudflare_bp.route('/zones/<zone_id>/ssl/universal/settings', methods=['PATCH'])
def update_ssl_settings(zone_id: str):
    """Update SSL settings for a zone"""
    try:
        data = request.get_json()
        
        response = requests.patch(
            f"{CLOUDFLARE_API_BASE}/zones/{zone_id}/ssl/universal/settings",
            headers=get_headers(),
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({'success': True, 'settings': result['result']})
        else:
            return jsonify({'success': False, 'error': 'Failed to update SSL settings'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cloudflare_bp.route('/zones/<zone_id>/settings/ssl', methods=['PATCH'])
def update_ssl_mode(zone_id: str):
    """Update SSL mode for a zone (Off, Flexible, Full, Full Strict)"""
    try:
        data = request.get_json()
        ssl_mode = data.get('value', 'flexible')
        
        ssl_data = {
            'value': ssl_mode
        }
        
        response = requests.patch(
            f"{CLOUDFLARE_API_BASE}/zones/{zone_id}/settings/ssl",
            headers=get_headers(),
            json=ssl_data
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({'success': True, 'ssl_mode': result['result']})
        else:
            return jsonify({'success': False, 'error': 'Failed to update SSL mode'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cloudflare_bp.route('/zones/<zone_id>/purge_cache', methods=['POST'])
def purge_cache(zone_id: str):
    """Purge Cloudflare cache for a zone"""
    try:
        data = request.get_json()
        
        # Default to purge everything if no specific files/tags provided
        purge_data = data if data else {'purge_everything': True}
        
        response = requests.post(
            f"{CLOUDFLARE_API_BASE}/zones/{zone_id}/purge_cache",
            headers=get_headers(),
            json=purge_data
        )
        
        if response.status_code == 200:
            return jsonify({'success': True, 'message': 'Cache purged successfully'})
        else:
            return jsonify({'success': False, 'error': 'Failed to purge cache'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cloudflare_bp.route('/zones/<zone_id>/analytics/dashboard', methods=['GET'])
def get_analytics(zone_id: str):
    """Get analytics data for a zone"""
    try:
        # Get query parameters
        since = request.args.get('since', '-1440')  # Last 24 hours by default
        until = request.args.get('until', 'now')
        
        response = requests.get(
            f"{CLOUDFLARE_API_BASE}/zones/{zone_id}/analytics/dashboard",
            headers=get_headers(),
            params={
                'since': since,
                'until': until
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({'success': True, 'analytics': data['result']})
        else:
            return jsonify({'success': False, 'error': 'Failed to fetch analytics'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cloudflare_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Cloudflare API"""
    try:
        if not CLOUDFLARE_API_TOKEN:
            return jsonify({
                'success': False, 
                'error': 'Cloudflare API token not configured'
            }), 500
        
        # Test API connectivity
        response = requests.get(
            f"{CLOUDFLARE_API_BASE}/user/tokens/verify",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            return jsonify({
                'success': True, 
                'message': 'Cloudflare API connection healthy'
            })
        else:
            return jsonify({
                'success': False, 
                'error': 'Cloudflare API token invalid'
            }), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

