import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  CodeBracketIcon, 
  EyeIcon, 
  ChatBubbleLeftRightIcon,
  CogIcon,
  CloudIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  CommandLineIcon,
  GlobeAltIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const DevEnvironment = ({ appId, appDescription, onBack }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isContainerRunning, setIsContainerRunning] = useState(false);
  const [containerStatus, setContainerStatus] = useState('initializing');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [gitRepo, setGitRepo] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize container on mount
  useEffect(() => {
    initializeContainer();
  }, []);

  const initializeContainer = async () => {
    setContainerStatus('creating');
    
    try {
      // Simulate container creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setContainerStatus('starting');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setContainerStatus('ready');
      setIsContainerRunning(true);
      
      // Set initial URLs
      setPreviewUrl(`http://preview-${appId}.mobileforge.123agent.eu:30081`);
      setGitRepo(`https://github.com/marekhotshot/mobileforge-app-${appId}`);
      setDeploymentUrl(`https://${appId}.mobileforge.123agent.eu`);
      
      // Add welcome message
      setMessages([{
        id: 1,
        type: 'assistant',
        content: `🚀 Development environment ready! I've created a dedicated container for your "${appDescription}" app. Let's start building!`,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      setContainerStatus('error');
      console.error('Failed to initialize container:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);

    // Simulate AI response
    const assistantMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Simulate streaming response
    const responses = [
      "I'll help you build that feature! Let me start by creating the component structure...",
      "\n\n```jsx\n// Creating the main component\nimport React, { useState } from 'react';\n\nconst FitnessTracker = () => {\n  const [workouts, setWorkouts] = useState([]);\n  \n  return (\n    <div className=\"fitness-app\">\n      <h1>AI Fitness Trainer</h1>\n      {/* Component content */}\n    </div>\n  );\n};\n\nexport default FitnessTracker;\n```",
      "\n\nNow I'm updating the preview with your new component. You should see the changes in the Live Preview tab!"
    ];

    for (let i = 0; i < responses.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: msg.content + responses[i] }
          : msg
      ));
    }

    setIsStreaming(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const tabs = [
    { id: 'chat', name: 'AI Chat', icon: ChatBubbleLeftRightIcon, color: 'bg-cyan-500' },
    { id: 'preview', name: 'Live Preview', icon: EyeIcon, color: 'bg-blue-500' },
    { id: 'code', name: 'Code Editor', icon: CodeBracketIcon, color: 'bg-purple-500' },
    { id: 'files', name: 'File Manager', icon: FolderIcon, color: 'bg-green-500' },
    { id: 'terminal', name: 'Terminal', icon: CommandLineIcon, color: 'bg-orange-500' },
    { id: 'deploy', name: 'Deploy', icon: RocketLaunchIcon, color: 'bg-pink-500' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'initializing': return 'text-yellow-400';
      case 'creating': return 'text-blue-400';
      case 'starting': return 'text-cyan-400';
      case 'ready': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'initializing': return 'Initializing...';
      case 'creating': return 'Creating container...';
      case 'starting': return 'Starting services...';
      case 'ready': return 'Ready';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-semibold">Development Environment</h1>
              <p className="text-sm text-gray-400 truncate max-w-md">{appDescription}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isContainerRunning ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
              <span className={`text-sm ${getStatusColor(containerStatus)}`}>
                {getStatusText(containerStatus)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  isContainerRunning 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                onClick={() => setIsContainerRunning(!isContainerRunning)}
              >
                {isContainerRunning ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </button>
              
              <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                <CogIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? `${tab.color} text-white shadow-lg`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-800 h-[600px] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-800 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Describe what you want to build or modify..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    disabled={!isContainerRunning || isStreaming}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!isContainerRunning || isStreaming || !inputMessage.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Preview URL:</span>
                  <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400 text-sm">
                    {previewUrl}
                  </code>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg overflow-hidden" style={{ height: '500px' }}>
                <iframe
                  src="about:blank"
                  className="w-full h-full"
                  title="App Preview"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Code Editor</h3>
                <div className="flex items-center space-x-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                    Save
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                    Format
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm" style={{ height: '500px' }}>
                <div className="text-gray-400">// App.jsx</div>
                <div className="text-blue-400">import</div> <span className="text-white">React</span> <div className="text-blue-400">from</div> <span className="text-green-400">'react'</span>;
                <br />
                <br />
                <div className="text-blue-400">function</div> <span className="text-yellow-400">App</span>() {'{'}
                <br />
                <span className="ml-4 text-blue-400">return</span> (
                <br />
                <span className="ml-8 text-gray-400">&lt;</span><span className="text-red-400">div</span> <span className="text-cyan-400">className</span>=<span className="text-green-400">"app"</span><span className="text-gray-400">&gt;</span>
                <br />
                <span className="ml-12 text-gray-400">&lt;</span><span className="text-red-400">h1</span><span className="text-gray-400">&gt;</span>Fitness Tracker<span className="text-gray-400">&lt;/</span><span className="text-red-400">h1</span><span className="text-gray-400">&gt;</span>
                <br />
                <span className="ml-8 text-gray-400">&lt;/</span><span className="text-red-400">div</span><span className="text-gray-400">&gt;</span>
                <br />
                <span className="ml-4">);</span>
                <br />
                {'}'}
                <br />
                <br />
                <div className="text-blue-400">export default</div> <span className="text-white">App</span>;
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deploy' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-6">Deployment & Integration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Git Integration */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold">Git Repository</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Auto-synced with GitHub
                  </p>
                  <div className="bg-gray-900 rounded p-2 mb-3">
                    <code className="text-cyan-400 text-xs">{gitRepo}</code>
                  </div>
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded transition-colors">
                    Open Repository
                  </button>
                </div>

                {/* Cloudflare Deployment */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <CloudIcon className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold">Cloudflare Deploy</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Auto-deploy to global CDN
                  </p>
                  <div className="bg-gray-900 rounded p-2 mb-3">
                    <code className="text-cyan-400 text-xs">{deploymentUrl}</code>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors">
                    Deploy Now
                  </button>
                </div>

                {/* Container Status */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <CogIcon className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold">Container</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Kubernetes pod status
                  </p>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-400">Running</span>
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors">
                    View Logs
                  </button>
                </div>

                {/* Live URL */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <GlobeAltIcon className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold">Live Preview</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Real-time app preview
                  </p>
                  <div className="bg-gray-900 rounded p-2 mb-3">
                    <code className="text-cyan-400 text-xs">{previewUrl}</code>
                  </div>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition-colors">
                    Open Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content */}
        {(activeTab === 'files' || activeTab === 'terminal') && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-4">
                {activeTab === 'files' ? 'File Manager' : 'Terminal'}
              </h3>
              <div className="bg-gray-800 rounded-lg p-4 h-96 flex items-center justify-center">
                <p className="text-gray-400">
                  {activeTab === 'files' ? 'File browser coming soon...' : 'Terminal interface coming soon...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevEnvironment;

