import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon,
  ArrowRightIcon,
  PlusIcon,
  CodeBracketIcon,
  EyeIcon,
  RocketLaunchIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

const tabs = [
  { id: 'code', name: 'Code', icon: CodeBracketIcon, color: 'bg-purple-500' },
  { id: 'preview', name: 'Preview', icon: EyeIcon, color: 'bg-blue-500' },
  { id: 'deploy', name: 'Deploy', icon: RocketLaunchIcon, color: 'bg-orange-500' }
];

export default function EmergentChatInterface({ initialPrompt, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const [currentProvider, setCurrentProvider] = useState('grok-4');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);

    try {
      const response = await apiService.streamChat(currentProvider, message);
      const reader = response.getReader();
      
      let assistantMessage = { 
        role: 'assistant', 
        content: '', 
        timestamp: new Date(),
        provider: currentProvider 
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content += data.content;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
        provider: currentProvider,
        error: true
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Close Tab"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg">
            <span className="text-sm font-medium">10.00</span>
          </div>
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
            Buy Credits
          </button>
        </div>
        
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium">M</span>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 px-4 py-2 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? `${tab.color} text-white`
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Chat Panel */}
        <div className="w-1/2 flex flex-col border-r border-gray-800">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-white text-black'
                      : message.error
                      ? 'bg-red-900/30 border border-red-500/30 text-red-300'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {message.role === 'assistant' && message.provider && (
                    <div className="text-xs text-gray-400 mb-2 font-mono">
                      {message.provider.toUpperCase()}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === 'assistant' && !message.error && (
                    <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-700">
                      <button className="text-xs text-gray-400 hover:text-white transition-colors">
                        Rollback
                      </button>
                      <button className="text-xs text-gray-400 hover:text-white transition-colors">
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-800">
            <div className="relative bg-gray-900 border border-gray-700 rounded-xl">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message MobileForge..."
                className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none p-4 pr-12 min-h-[60px] max-h-32"
                rows={2}
                disabled={isStreaming}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isStreaming}
                className="absolute bottom-3 right-3 p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-700 transition-colors">
                  <CodeBracketIcon className="w-4 h-4" />
                  <span>Save to GitHub</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-700 transition-colors">
                  <span>Fork</span>
                </button>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <span className="text-sm">⏸️</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Tab Content */}
          <div className="flex-1 p-6">
            {activeTab === 'code' && (
              <div className="h-full bg-gray-900 rounded-lg border border-gray-700 p-4">
                <div className="text-gray-400 text-sm mb-4">Generated Code</div>
                <div className="font-mono text-sm text-gray-300">
                  <div className="text-blue-400">// MobileForge Generated Code</div>
                  <div className="text-green-400">import React from 'react';</div>
                  <div className="text-yellow-400">import {'{ View, Text }'} from 'react-native';</div>
                  <div className="mt-4">
                    <div className="text-purple-400">export default function App() {'{'}</div>
                    <div className="ml-4 text-gray-300">return (</div>
                    <div className="ml-8 text-blue-400">{'<View>'}</div>
                    <div className="ml-12 text-gray-300">{'<Text>Your Mobile App</Text>'}</div>
                    <div className="ml-8 text-blue-400">{'</View>'}</div>
                    <div className="ml-4 text-gray-300">);</div>
                    <div className="text-purple-400">{'}'}</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'preview' && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                  <p className="text-gray-400">Loading preview...</p>
                </div>
              </div>
            )}
            
            {activeTab === 'deploy' && (
              <div className="h-full">
                <div className="text-gray-400 text-sm mb-4">Deployment Options</div>
                <div className="space-y-3">
                  <button className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-left hover:bg-gray-700 transition-colors">
                    <div className="font-medium">Deploy to App Store</div>
                    <div className="text-sm text-gray-400">iOS App Store deployment</div>
                  </button>
                  <button className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-left hover:bg-gray-700 transition-colors">
                    <div className="font-medium">Deploy to Play Store</div>
                    <div className="text-sm text-gray-400">Google Play Store deployment</div>
                  </button>
                  <button className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-left hover:bg-gray-700 transition-colors">
                    <div className="font-medium">Web Deployment</div>
                    <div className="text-sm text-gray-400">Deploy as Progressive Web App</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-700 transition-colors">
                  <ShareIcon className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

