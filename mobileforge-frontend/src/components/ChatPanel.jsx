import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Button } from '@/components/ui/button.jsx';
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  CpuChipIcon,
  LightBulbIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import ApiService from '../services/api';

const llmProviders = [
  {
    id: 'grok4',
    name: 'Grok-4',
    icon: SparklesIcon,
    description: 'Advanced reasoning for complex apps',
    color: 'text-purple-500'
  },
  {
    id: 'claude',
    name: 'Claude-3.5',
    icon: LightBulbIcon,
    description: 'Creative UI/UX design',
    color: 'text-orange-500'
  },
  {
    id: 'gpt4',
    name: 'GPT-4',
    icon: CpuChipIcon,
    description: 'Reliable code generation',
    color: 'text-green-500'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek-V3',
    icon: CodeBracketIcon,
    description: 'Specialized mobile development',
    color: 'text-blue-500'
  }
];

function ChatMessage({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}

function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe your mobile app idea..."
        className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled || !message.trim()}>
        <PaperAirplaneIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default function ChatPanel() {
  const [selectedProvider, setSelectedProvider] = useState(0);
  const [conversations, setConversations] = useState(
    llmProviders.map(() => [])
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  const handleSendMessage = async (message) => {
    setIsGenerating(true);
    setStreamingMessage('');
    
    const provider = llmProviders[selectedProvider];
    
    // Add user message
    const newConversations = [...conversations];
    newConversations[selectedProvider] = [
      ...newConversations[selectedProvider],
      { text: message, isUser: true }
    ];
    setConversations(newConversations);

    let fullResponse = '';

    try {
      // Use streaming API
      await ApiService.streamChatMessage(
        message,
        provider.id,
        // onChunk
        (chunk) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        },
        // onComplete
        () => {
          // Add the complete AI response
          const finalConversations = [...newConversations];
          finalConversations[selectedProvider] = [
            ...finalConversations[selectedProvider],
            { text: fullResponse, isUser: false }
          ];
          setConversations(finalConversations);
          setStreamingMessage('');
          setIsGenerating(false);
        },
        // onError
        (error) => {
          console.error('Chat error:', error);
          const errorConversations = [...newConversations];
          errorConversations[selectedProvider] = [
            ...errorConversations[selectedProvider],
            { text: `Error: ${error}`, isUser: false }
          ];
          setConversations(errorConversations);
          setStreamingMessage('');
          setIsGenerating(false);
        }
      );
    } catch (error) {
      console.error('Chat request failed:', error);
      setIsGenerating(false);
      setStreamingMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">AI Chat</h2>
        <Tab.Group selectedIndex={selectedProvider} onChange={setSelectedProvider}>
          <Tab.List className="flex space-x-1 rounded-lg bg-muted p-1">
            {llmProviders.map((provider, index) => (
              <Tab
                key={provider.id}
                className={({ selected }) =>
                  `w-full rounded-md py-2 px-3 text-xs font-medium leading-5 transition-all
                   ${selected 
                     ? 'bg-background text-foreground shadow' 
                     : 'text-muted-foreground hover:bg-background/50'
                   }`
                }
              >
                <div className="flex items-center justify-center gap-1">
                  <provider.icon className={`h-3 w-3 ${provider.color}`} />
                  <span>{provider.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tab.Group selectedIndex={selectedProvider} onChange={setSelectedProvider}>
          <Tab.Panels className="h-full">
            {llmProviders.map((provider, index) => (
              <Tab.Panel key={provider.id} className="h-full flex flex-col">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <provider.icon className={`h-4 w-4 ${provider.color}`} />
                    <span className="font-medium text-sm">{provider.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{provider.description}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {conversations[index].length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <provider.icon className={`h-12 w-12 mx-auto mb-3 ${provider.color}`} />
                        <p className="text-muted-foreground text-sm">
                          Start a conversation with {provider.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    conversations[index].map((msg, msgIndex) => (
                      <ChatMessage 
                        key={msgIndex} 
                        message={msg.text} 
                        isUser={msg.isUser} 
                      />
                    ))
                  )}
                  
                  {/* Show streaming message */}
                  {isGenerating && selectedProvider === index && streamingMessage && (
                    <div className="flex justify-start mb-4">
                      <div className="max-w-[80%] bg-muted text-muted-foreground rounded-lg px-4 py-2">
                        <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Show loading indicator */}
                  {isGenerating && selectedProvider === index && !streamingMessage && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
                          <span className="text-sm">Generating response...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isGenerating} />
    </div>
  );
}

