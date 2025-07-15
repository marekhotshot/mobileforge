import React, { useState, useEffect, useRef } from 'react';
import { containerApi } from '../services/containerApi';
import SimpleCodeTab from './SimpleCodeTab';
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
  RocketLaunchIcon,
  ArrowLeftIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const RorkStyleDevEnvironment = ({ appId, appDescription, onBack }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [isContainerRunning, setIsContainerRunning] = useState(false);
  const [containerStatus, setContainerStatus] = useState('initializing');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [devUrl, setDevUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [containerError, setContainerError] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize container on mount
  useEffect(() => {
    initializeContainer();
    
    // Cleanup on unmount
    return () => {
      // Optionally delete container on unmount
      // containerApi.deleteContainer(appId);
    };
  }, [appId]);

  const initializeContainer = async () => {
    try {
      setContainerStatus('creating');
      setContainerError(null);
      
      // Create the container
      const createResult = await containerApi.createContainer(
        appId, 
        appDescription, 
        'react-native'
      );
      
      if (createResult.success) {
        setPreviewUrl(createResult.preview_url);
        setDevUrl(createResult.dev_url);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(createResult.preview_url)}`);
        
        setContainerStatus('starting');
        
        // Wait for container to be ready
        const statusResult = await containerApi.waitForContainer(appId);
        
        if (statusResult.success) {
          setContainerStatus('ready');
          setIsContainerRunning(true);
          
          // Add initial planning message
          setMessages([{
            id: 1,
            type: 'assistant',
            content: `🚀 **Container Created Successfully!**

I've spun up a dedicated development environment for your app:
- **App ID**: ${appId}
- **Preview URL**: ${createResult.preview_url}
- **Dev URL**: ${createResult.dev_url}

I'll create a beautiful AI camera app that enhances photos using AI. The app will have these key features:

1. Camera interface to take photos
2. AI enhancement capabilities using the AI endpoints provided
3. Gallery to view enhanced photos
4. Settings for customization

Let's plan the architecture:

- Main tabs: Camera, Gallery, Settings
- Camera screen: Take photos, apply AI enhancements
- Gallery: View and manage enhanced photos
- Settings: Customize enhancement preferences

For the design, I'll use a dark theme with pastel accents (teal and purple) for a modern, sleek look inspired by iOS and Instagram.

The development container is now running and ready for commands! 🎉`,
            timestamp: new Date()
          }]);
        }
      } else {
        throw new Error(createResult.error || 'Failed to create container');
      }
      
    } catch (error) {
      console.error('Failed to initialize container:', error);
      setContainerStatus('error');
      setContainerError(error.message);
      
      // Add error message
      setMessages([{
        id: 1,
        type: 'assistant',
        content: `❌ **Container Creation Failed**

There was an error creating your development environment:
${error.message}

This might be due to:
- Kubernetes cluster connectivity issues
- Resource limitations
- Network configuration problems

Please try again or contact support if the issue persists.`,
        timestamp: new Date()
      }]);
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
    const currentInput = inputMessage;
    setInputMessage('');
    setIsStreaming(true);

    // Create assistant message
    const assistantMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // If container is running, execute the command
      if (isContainerRunning) {
        const commandResult = await containerApi.executeCommand(appId, currentInput);
        
        if (commandResult.success) {
          const response = `✅ **Command Executed Successfully**

\`\`\`bash
$ ${commandResult.command}
${commandResult.output}
\`\`\`

The changes have been applied to your development environment. Check the preview to see the updates!`;

          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: response }
              : msg
          ));
        } else {
          throw new Error(commandResult.error || 'Command execution failed');
        }
      } else {
        // Simulate response if container not ready
        const responses = [
          "I understand you want to implement that feature...",
          "\n\nLet me work on that for you:",
          "\n\n```jsx\n// Enhanced camera interface\nconst CameraScreen = () => {\n  const [photo, setPhoto] = useState(null);\n  const [isProcessing, setIsProcessing] = useState(false);\n  \n  const enhancePhoto = async (imageData) => {\n    setIsProcessing(true);\n    // AI enhancement logic\n    const enhanced = await aiEnhance(imageData);\n    setPhoto(enhanced);\n    setIsProcessing(false);\n  };\n  \n  return (\n    <div className=\"camera-interface\">\n      {/* Camera UI */}\n    </div>\n  );\n};\n```",
          "\n\n⚠️ **Note**: Container is still starting up. Once ready, I'll be able to execute real commands in your development environment."
        ];

        for (let i = 0; i < responses.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 800));
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: msg.content + responses[i] }
              : msg
          ));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: `❌ **Error**: ${error.message}` }
          : msg
      ));
    }

    setIsStreaming(false);
  };

  const refreshContainerStatus = async () => {
    try {
      const status = await containerApi.getContainerStatus(appId);
      if (status.success) {
        setContainerStatus(status.pod_status.toLowerCase());
        setIsContainerRunning(status.pod_status === 'Running');
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'initializing': return 'text-yellow-400';
      case 'creating': return 'text-blue-400';
      case 'starting': return 'text-cyan-400';
      case 'ready': 
      case 'running': return 'text-green-400';
      case 'error': 
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'initializing': return 'Initializing';
      case 'creating': return 'Creating';
      case 'starting': return 'Starting';
      case 'ready': 
      case 'running': return 'Ready';
      case 'error': 
      case 'failed': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-xs">📷</span>
              </div>
              <span className="font-medium">AI Photo Enhancer</span>
              <span className="text-gray-400">📱</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeTab === 'code'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isContainerRunning ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
              <span className={`text-sm ${getStatusColor(containerStatus)}`}>{getStatusText(containerStatus)}</span>
              <span className="text-yellow-400">●</span>
              <button 
                onClick={refreshContainerStatus}
                className="text-gray-400 hover:text-white transition-colors"
                title="Refresh container status"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>

            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">
              Upgrade
            </button>

            <button className="text-gray-400 hover:text-white transition-colors">
              <CogIcon className="w-5 h-5" />
            </button>

            <button className="text-gray-400 hover:text-white transition-colors">
              Integrations
            </button>

            <button className="text-gray-400 hover:text-white transition-colors">
              <ArrowPathIcon className="w-5 h-5" />
            </button>

            <button className="text-gray-400 hover:text-white transition-colors">
              <GlobeAltIcon className="w-5 h-5" />
            </button>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm transition-colors">
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'code' ? (
          <SimpleCodeTab 
            appId={appId}
            containerStatus={containerStatus}
            isContainerRunning={isContainerRunning}
          />
        ) : (
          <div className="flex h-full">
            {/* Left Panel - Chat */}
            <div className="w-1/3 border-r border-gray-800 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="font-medium">Rork</span>
            </div>
            <div className="text-sm text-gray-400 mb-3">
              {appDescription}
            </div>
            
            {/* Expandable Thoughts Section */}
            <div className="bg-gray-900 rounded-lg">
              <button className="w-full flex items-center justify-between p-3 text-left">
                <span className="text-sm font-medium">▼ Thoughts</span>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {message.type === 'assistant' && (
                  <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                )}
                {message.type === 'user' && (
                  <div className="bg-blue-600 text-white p-3 rounded-lg ml-8">
                    {message.content}
                  </div>
                )}
              </div>
            ))}
            {isStreaming && (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Describe the mobile app you want to build..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                disabled={!isContainerRunning || isStreaming}
              />
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <span>📎</span>
                <span>💡</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>5 free messages left today.</span>
                <button className="text-blue-400 hover:text-blue-300">Upgrade</button>
                <span>⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Mobile Preview */}
        <div className="flex-1 flex items-center justify-center bg-gray-900/30 p-8">
          <div className="relative">
            {/* iPhone Frame */}
            <div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl border-4 border-gray-800">
              <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 text-white text-sm z-10">
                  <span>9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <span>📶</span>
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* App Content */}
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-white rounded-full mx-auto mb-4 animate-spin"></div>
                    <div className="text-white text-sm">Starting...</div>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Testing & QR Code */}
        <div className="w-80 border-l border-gray-800 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Test on your phone</h3>
              
              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg mb-4 flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <QrCodeIcon className="w-16 h-16 text-gray-400" />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Scan QR code to test</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>To test on your device:</p>
                  <p>1. Open Camera app</p>
                  <p>2. Scan the QR code above</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-400">
                  <p className="font-medium text-white mb-1">Browser preview lacks native functions & looks different.</p>
                  <p>Test on device for the best results.</p>
                </div>
              </div>
            </div>

            {/* Additional Tools */}
            <div className="space-y-3">
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2">
                <CodeBracketIcon className="w-4 h-4" />
                <span>View Source Code</span>
              </button>
              
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2">
                <CloudIcon className="w-4 h-4" />
                <span>Deploy to Store</span>
              </button>
              
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2">
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span>Share Preview</span>
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default RorkStyleDevEnvironment;

