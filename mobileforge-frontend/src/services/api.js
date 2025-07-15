// API service for MobileForge backend communication

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // LLM API methods
  async getLLMProviders() {
    return this.request('/llm/providers');
  }

  async sendChatMessage(message, provider) {
    return this.request('/llm/chat', {
      method: 'POST',
      body: JSON.stringify({ message, provider }),
    });
  }

  // Streaming chat method
  async streamChatMessage(message, provider, onChunk, onComplete, onError) {
    try {
      const response = await fetch(`${this.baseURL}/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, provider }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                onError?.(data.error);
                return;
              }
              
              if (data.done) {
                onComplete?.();
                return;
              }
              
              if (data.content) {
                onChunk?.(data.content);
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      }
    } catch (error) {
      onError?.(error.message);
    }
  }

  async generateApp(description, framework = 'react-native', provider = 'gpt4') {
    return this.request('/llm/generate-app', {
      method: 'POST',
      body: JSON.stringify({ description, framework, provider }),
    });
  }

  // Apps API methods
  async getApps() {
    return this.request('/apps/list');
  }

  async getApp(appId) {
    return this.request(`/apps/${appId}`);
  }

  async updateApp(appId, data) {
    return this.request(`/apps/${appId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteApp(appId) {
    return this.request(`/apps/${appId}`, {
      method: 'DELETE',
    });
  }

  async deployApp(appId, platform) {
    return this.request(`/apps/${appId}/deploy`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
  }

  async getAppAnalytics(appId) {
    return this.request(`/apps/${appId}/analytics`);
  }

  async buildApp(appId, platform, buildType = 'debug') {
    return this.request(`/apps/${appId}/build`, {
      method: 'POST',
      body: JSON.stringify({ platform, build_type: buildType }),
    });
  }

  async getTemplates() {
    return this.request('/apps/templates');
  }

  async createFromTemplate(templateId, name, framework) {
    return this.request('/apps/create-from-template', {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId, name, framework }),
    });
  }
}

export default new ApiService();

