from flask import Blueprint, request, jsonify, Response
import json
import time
import os
from typing import Generator

llm_bp = Blueprint('llm', __name__)

# Mock LLM providers configuration
LLM_PROVIDERS = {
    'grok4': {
        'name': 'Grok-4',
        'description': 'Advanced reasoning for complex apps',
        'api_key_env': 'XAI_API_KEY',
        'base_url': 'https://api.x.ai/v1',
        'model': 'grok-4'
    },
    'claude': {
        'name': 'Claude-3.5',
        'description': 'Creative UI/UX design',
        'api_key_env': 'ANTHROPIC_API_KEY',
        'base_url': 'https://api.anthropic.com/v1',
        'model': 'claude-3-5-sonnet-20241022'
    },
    'gpt4': {
        'name': 'GPT-4',
        'description': 'Reliable code generation',
        'api_key_env': 'OPENAI_API_KEY',
        'base_url': 'https://api.openai.com/v1',
        'model': 'gpt-4'
    },
    'deepseek': {
        'name': 'DeepSeek-V3',
        'description': 'Specialized mobile development',
        'api_key_env': 'DEEPSEEK_API_KEY',
        'base_url': 'https://api.deepseek.com/v1',
        'model': 'deepseek-chat'
    }
}

def simulate_streaming_response(provider_id: str, message: str) -> Generator[str, None, None]:
    """Simulate streaming response from LLM provider"""
    provider = LLM_PROVIDERS.get(provider_id, LLM_PROVIDERS['gpt4'])
    
    # Generate a realistic response based on the provider
    responses = {
        'grok4': f"I'll help you create that mobile app using {provider['name']}. Let me analyze your requirements with advanced reasoning...\n\nBased on your request for '{message}', I recommend:\n\n1. **Architecture**: React Native with TypeScript for cross-platform compatibility\n2. **State Management**: Redux Toolkit for complex app state\n3. **Backend**: Node.js with Express and MongoDB\n4. **Key Features**: User authentication, data synchronization, offline support\n\nLet me generate the initial code structure...",
        
        'claude': f"Perfect! I'll design a beautiful and intuitive mobile app for '{message}' using {provider['name']}'s creative capabilities.\n\n🎨 **Design Approach**:\n- Clean, modern UI with intuitive navigation\n- Consistent color scheme and typography\n- Accessibility-first design principles\n- Smooth animations and micro-interactions\n\n📱 **User Experience**:\n- Onboarding flow with progressive disclosure\n- Contextual help and tooltips\n- Responsive design for all screen sizes\n\nShall I proceed with the UI mockups and component library?",
        
        'gpt4': f"I'll create a robust mobile application for '{message}' using {provider['name']}'s reliable code generation.\n\n**Technical Stack**:\n```\nFrontend: React Native 0.72+\nState: Context API + useReducer\nNavigation: React Navigation 6\nStyling: Styled Components\nTesting: Jest + React Native Testing Library\n```\n\n**Project Structure**:\n```\nsrc/\n├── components/\n├── screens/\n├── navigation/\n├── services/\n├── utils/\n└── types/\n```\n\nGenerating initial components...",
        
        'deepseek': f"Analyzing your mobile app requirements for '{message}' using {provider['name']}'s specialized mobile development expertise.\n\n🔧 **Mobile-Optimized Approach**:\n- Native performance with React Native\n- Platform-specific optimizations (iOS/Android)\n- Efficient memory management\n- Battery-conscious background processing\n\n📊 **Performance Considerations**:\n- Lazy loading for large datasets\n- Image optimization and caching\n- Network request optimization\n- Bundle size minimization\n\nInitializing mobile-first architecture..."
    }
    
    response_text = responses.get(provider_id, responses['gpt4'])
    words = response_text.split()
    
    for i, word in enumerate(words):
        chunk = word + (' ' if i < len(words) - 1 else '')
        yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"
        time.sleep(0.05)  # Simulate typing delay
    
    yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"

@llm_bp.route('/providers', methods=['GET'])
def get_providers():
    """Get available LLM providers"""
    return jsonify({
        'providers': [
            {
                'id': provider_id,
                'name': config['name'],
                'description': config['description'],
                'available': os.getenv(config['api_key_env']) is not None
            }
            for provider_id, config in LLM_PROVIDERS.items()
        ]
    })

@llm_bp.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests with streaming response"""
    data = request.get_json()
    
    if not data or 'message' not in data or 'provider' not in data:
        return jsonify({'error': 'Missing message or provider'}), 400
    
    message = data['message']
    provider_id = data['provider']
    
    if provider_id not in LLM_PROVIDERS:
        return jsonify({'error': 'Invalid provider'}), 400
    
    def generate():
        yield "data: {\"status\": \"started\"}\n\n"
        
        try:
            for chunk in simulate_streaming_response(provider_id, message):
                yield chunk
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
        }
    )

@llm_bp.route('/generate-app', methods=['POST'])
def generate_app():
    """Generate mobile app code based on requirements"""
    data = request.get_json()
    
    if not data or 'description' not in data:
        return jsonify({'error': 'Missing app description'}), 400
    
    description = data['description']
    framework = data.get('framework', 'react-native')
    provider = data.get('provider', 'gpt4')
    
    # Mock app generation response
    generated_app = {
        'id': f"app_{int(time.time())}",
        'name': description.split()[0].capitalize() + 'App',
        'description': description,
        'framework': framework,
        'provider': provider,
        'files': [
            {
                'path': 'App.js',
                'content': f"""import React from 'react';
import {{ View, Text, StyleSheet }} from 'react-native';

export default function App() {{
  return (
    <View style={{styles.container}}>
      <Text style={{styles.title}}>Welcome to {description.split()[0].capitalize()}App</Text>
      <Text style={{styles.subtitle}}>Generated with {LLM_PROVIDERS[provider]['name']}</Text>
    </View>
  );
}}

const styles = StyleSheet.create({{
  container: {{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  }},
  title: {{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  }},
  subtitle: {{
    fontSize: 16,
    color: '#666',
  }},
}});"""
            },
            {
                'path': 'package.json',
                'content': json.dumps({
                    'name': description.split()[0].lower() + '-app',
                    'version': '1.0.0',
                    'main': 'App.js',
                    'dependencies': {
                        'react': '^18.0.0',
                        'react-native': '^0.72.0'
                    }
                }, indent=2)
            }
        ],
        'preview_url': f'/api/preview/{int(time.time())}',
        'created_at': time.time()
    }
    
    return jsonify(generated_app)

@llm_bp.route('/preview/<app_id>', methods=['GET'])
def preview_app(app_id):
    """Get app preview data"""
    return jsonify({
        'app_id': app_id,
        'preview_data': {
            'screenshots': [
                '/api/static/preview-mobile.png',
                '/api/static/preview-tablet.png'
            ],
            'features': [
                'Cross-platform compatibility',
                'Modern UI components',
                'Responsive design',
                'Performance optimized'
            ]
        }
    })

