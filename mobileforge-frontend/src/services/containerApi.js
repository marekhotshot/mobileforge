// Container orchestration API service

const API_BASE = 'http://localhost:5000';

export const containerApi = {
  // Create a new development container
  async createContainer(appId, appDescription, framework = 'react-native') {
    try {
      const response = await fetch(`${API_BASE}/api/containers/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: appId,
          app_description: appDescription,
          framework: framework
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating container:', error);
      throw error;
    }
  },

  // Get container status
  async getContainerStatus(appId) {
    try {
      const response = await fetch(`${API_BASE}/api/containers/${appId}/status`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Container not found' };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting container status:', error);
      throw error;
    }
  },

  // Get container logs
  async getContainerLogs(appId) {
    try {
      const response = await fetch(`${API_BASE}/api/containers/${appId}/logs`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting container logs:', error);
      throw error;
    }
  },

  // Execute command in container
  async executeCommand(appId, command) {
    try {
      const response = await fetch(`${API_BASE}/api/containers/${appId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  },

  // Delete container
  async deleteContainer(appId) {
    try {
      const response = await fetch(`${API_BASE}/api/containers/${appId}/delete`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting container:', error);
      throw error;
    }
  },

  // List all containers
  async listContainers() {
    try {
      const response = await fetch(`${API_BASE}/api/containers/list`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing containers:', error);
      throw error;
    }
  },

  // Poll container status until ready
  async waitForContainer(appId, maxAttempts = 30, interval = 2000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.getContainerStatus(appId);
        
        if (status.success && status.pod_status === 'Running') {
          return status;
        }
        
        if (status.success && status.pod_status === 'Failed') {
          throw new Error('Container failed to start');
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        // Continue polling on error (container might not exist yet)
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error('Container did not become ready within timeout');
  }
};

