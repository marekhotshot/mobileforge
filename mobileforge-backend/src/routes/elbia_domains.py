"""
Elbia.sk Domain Registration API
Handles domain registration, management, and DNS configuration through elbia.sk
"""

from flask import Blueprint, request, jsonify
import requests
import os
from typing import Dict, List, Optional
import xml.etree.ElementTree as ET

elbia_bp = Blueprint('elbia', __name__)

# Elbia.sk API configuration
ELBIA_API_BASE = "https://www.elbia.sk/api"
ELBIA_USERNAME = os.getenv('ELBIA_USERNAME', '')
ELBIA_PASSWORD = os.getenv('ELBIA_PASSWORD', '')

def get_auth_params():
    """Get authentication parameters for elbia.sk API"""
    return {
        'username': ELBIA_USERNAME,
        'password': ELBIA_PASSWORD
    }

def make_elbia_request(endpoint: str, params: Dict = None, method: str = 'GET') -> Dict:
    """Make authenticated request to elbia.sk API"""
    if params is None:
        params = {}
    
    # Add authentication
    params.update(get_auth_params())
    
    url = f"{ELBIA_API_BASE}/{endpoint}"
    
    try:
        if method.upper() == 'POST':
            response = requests.post(url, data=params)
        else:
            response = requests.get(url, params=params)
        
        # elbia.sk typically returns XML responses
        if response.headers.get('content-type', '').startswith('text/xml'):
            root = ET.fromstring(response.text)
            return parse_xml_response(root)
        else:
            # Try to parse as JSON if not XML
            try:
                return response.json()
            except:
                return {'raw_response': response.text, 'status_code': response.status_code}
                
    except Exception as e:
        return {'error': str(e), 'success': False}

def parse_xml_response(root: ET.Element) -> Dict:
    """Parse XML response from elbia.sk API"""
    result = {}
    
    # Check for error
    error_elem = root.find('.//error')
    if error_elem is not None:
        return {
            'success': False,
            'error': error_elem.text or 'Unknown error'
        }
    
    # Check for success
    success_elem = root.find('.//success')
    if success_elem is not None:
        result['success'] = True
        result['message'] = success_elem.text
    
    # Parse domain information
    domain_elem = root.find('.//domain')
    if domain_elem is not None:
        domain_info = {}
        for child in domain_elem:
            domain_info[child.tag] = child.text
        result['domain'] = domain_info
    
    # Parse domain list
    domains_elem = root.find('.//domains')
    if domains_elem is not None:
        domains = []
        for domain in domains_elem.findall('domain'):
            domain_data = {}
            for child in domain:
                domain_data[child.tag] = child.text
            domains.append(domain_data)
        result['domains'] = domains
    
    return result

@elbia_bp.route('/check-availability', methods=['POST'])
def check_domain_availability():
    """Check if a domain is available for registration"""
    try:
        data = request.get_json()
        domain = data.get('domain')
        
        if not domain:
            return jsonify({'success': False, 'error': 'Domain name is required'}), 400
        
        # Remove protocol and www if present
        domain = domain.replace('http://', '').replace('https://', '').replace('www.', '')
        
        result = make_elbia_request('domain/check', {
            'domain': domain
        })
        
        if 'error' in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({
            'success': True,
            'domain': domain,
            'available': result.get('available', False),
            'price': result.get('price'),
            'currency': result.get('currency', 'EUR')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@elbia_bp.route('/register', methods=['POST'])
def register_domain():
    """Register a new domain"""
    try:
        data = request.get_json()
        
        required_fields = ['domain', 'registrant', 'admin', 'tech', 'billing']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        domain = data['domain']
        registrant = data['registrant']
        admin = data['admin']
        tech = data['tech']
        billing = data['billing']
        
        # Prepare registration parameters
        params = {
            'domain': domain,
            'period': data.get('period', 1),  # Registration period in years
            'registrant_name': registrant.get('name'),
            'registrant_email': registrant.get('email'),
            'registrant_phone': registrant.get('phone'),
            'registrant_address': registrant.get('address'),
            'registrant_city': registrant.get('city'),
            'registrant_postal_code': registrant.get('postal_code'),
            'registrant_country': registrant.get('country'),
            'admin_name': admin.get('name'),
            'admin_email': admin.get('email'),
            'admin_phone': admin.get('phone'),
            'tech_name': tech.get('name'),
            'tech_email': tech.get('email'),
            'tech_phone': tech.get('phone'),
            'billing_name': billing.get('name'),
            'billing_email': billing.get('email'),
            'billing_phone': billing.get('phone')
        }
        
        # Add nameservers if provided
        nameservers = data.get('nameservers', [])
        for i, ns in enumerate(nameservers[:4]):  # Max 4 nameservers
            params[f'ns{i+1}'] = ns
        
        result = make_elbia_request('domain/register', params, method='POST')
        
        if not result.get('success', False):
            return jsonify({'success': False, 'error': result.get('error', 'Registration failed')}), 400
        
        return jsonify({
            'success': True,
            'domain': domain,
            'message': 'Domain registered successfully',
            'registration_id': result.get('registration_id'),
            'expires_at': result.get('expires_at')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@elbia_bp.route('/domains', methods=['GET'])
def list_domains():
    """List all registered domains"""
    try:
        result = make_elbia_request('domain/list')
        
        if 'error' in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        domains = result.get('domains', [])
        
        # Format domain information
        formatted_domains = []
        for domain in domains:
            formatted_domains.append({
                'name': domain.get('name'),
                'status': domain.get('status'),
                'created_at': domain.get('created_at'),
                'expires_at': domain.get('expires_at'),
                'auto_renew': domain.get('auto_renew', False),
                'nameservers': domain.get('nameservers', [])
            })
        
        return jsonify({
            'success': True,
            'domains': formatted_domains
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@elbia_bp.route('/domains/<domain_name>', methods=['GET'])
def get_domain_info(domain_name: str):
    """Get detailed information about a specific domain"""
    try:
        result = make_elbia_request('domain/info', {
            'domain': domain_name
        })
        
        if 'error' in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        domain_info = result.get('domain', {})
        
        return jsonify({
            'success': True,
            'domain': {
                'name': domain_info.get('name'),
                'status': domain_info.get('status'),
                'created_at': domain_info.get('created_at'),
                'expires_at': domain_info.get('expires_at'),
                'updated_at': domain_info.get('updated_at'),
                'registrant': {
                    'name': domain_info.get('registrant_name'),
                    'email': domain_info.get('registrant_email'),
                    'phone': domain_info.get('registrant_phone')
                },
                'nameservers': domain_info.get('nameservers', []),
                'auto_renew': domain_info.get('auto_renew', False),
                'privacy_protection': domain_info.get('privacy_protection', False)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@elbia_bp.route('/domains/<domain_name>/nameservers', methods=['PUT'])
def update_nameservers(domain_name: str):
    """Update nameservers for a domain"""
    try:
        data = request.get_json()
        nameservers = data.get('nameservers', [])
        
        if not nameservers:
            return jsonify({'success': False, 'error': 'Nameservers are required'}), 400
        
        if len(nameservers) > 4:
            return jsonify({'success': False, 'error': 'Maximum 4 nameservers allowed'}), 400
        
        params = {'domain': domain_name}
        for i, ns in enumerate(nameservers):
            params[f'ns{i+1}'] = ns
        
        result = make_elbia_request('domain/update_nameservers', params, method='POST')
        
        if not result.get('success', False):
            return jsonify({'success': False, 'error': result.get('error', 'Failed to update nameservers')}), 400
        
        return jsonify({
            'success': True,
            'domain': domain_name,
            'nameservers': nameservers,
            'message': 'Nameservers updated successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@elbia_bp.route('/domains/<domain_name>/renew', methods=['POST'])
def renew_domain(domain_name: str):
    """Renew a domain registration"""
    try:
        data = request.get_json()
        period = data.get('period', 1)  # Renewal period in years
        
        result = make_elbia_request('domain/renew', {
            'domain': domain_name,
            'period': period
        }, method='POST')
        
        if not result.get('success', False):
            return jsonify({'success': False, 'error': result.get('error', 'Renewal failed')}), 400
        
        return jsonify({
            'success': True,
            'domain': domain_name,
            'period': period,
            'new_expiry': result.get('new_expiry'),
            'message': f'Domain renewed for {period} year(s)'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@elbia_bp.route('/domains/<domain_name>/transfer', methods=['POST'])
def transfer_domain(domain_name: str):
    """Transfer a domain to elbia.sk"""
    try:
        data = request.get_json()
        auth_code = data.get('auth_code')
        
        if not auth_code:
            return jsonify({'success': False, 'error': 'Authorization code is required'}), 400
        
        result = make_elbia_request('domain/transfer', {
            'domain': domain_name,
            'auth_code': auth_code
        }, method='POST')
        
        if not result.get('success', False):
            return jsonify({'success': False, 'error': result.get('error', 'Transfer failed')}), 400
        
        return jsonify({
            'success': True,
            'domain': domain_name,
            'transfer_id': result.get('transfer_id'),
            'message': 'Domain transfer initiated'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@elbia_bp.route('/domains/<domain_name>/privacy', methods=['PUT'])
def update_privacy_protection(domain_name: str):
    """Enable or disable privacy protection for a domain"""
    try:
        data = request.get_json()
        enable_privacy = data.get('enable', True)
        
        result = make_elbia_request('domain/privacy', {
            'domain': domain_name,
            'enable': '1' if enable_privacy else '0'
        }, method='POST')
        
        if not result.get('success', False):
            return jsonify({'success': False, 'error': result.get('error', 'Failed to update privacy protection')}), 400
        
        return jsonify({
            'success': True,
            'domain': domain_name,
            'privacy_protection': enable_privacy,
            'message': f'Privacy protection {"enabled" if enable_privacy else "disabled"}'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@elbia_bp.route('/pricing', methods=['GET'])
def get_pricing():
    """Get domain pricing information"""
    try:
        tld = request.args.get('tld', 'sk')
        
        result = make_elbia_request('domain/pricing', {
            'tld': tld
        })
        
        if 'error' in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({
            'success': True,
            'tld': tld,
            'pricing': {
                'registration': result.get('registration_price'),
                'renewal': result.get('renewal_price'),
                'transfer': result.get('transfer_price'),
                'currency': result.get('currency', 'EUR')
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@elbia_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for elbia.sk API connectivity"""
    try:
        if not ELBIA_USERNAME or not ELBIA_PASSWORD:
            return jsonify({
                'success': False,
                'error': 'Elbia.sk credentials not configured'
            }), 500
        
        # Test API connectivity with a simple request
        result = make_elbia_request('account/info')
        
        if 'error' in result:
            return jsonify({
                'success': False,
                'error': f'Elbia.sk API error: {result["error"]}'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Elbia.sk API connection healthy',
            'account': result.get('account', {})
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

