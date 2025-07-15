import React, { useState } from 'react';
import { 
  PlusIcon,
  SparklesIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const suggestionButtons = [
  { icon: DevicePhoneMobileIcon, text: "Mobile App", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { icon: GlobeAltIcon, text: "Web App", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { icon: RocketLaunchIcon, text: "Landing Page", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { icon: SparklesIcon, text: "Surprise Me", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" }
];

const recentTasks = [
  { id: "MF-ef0069", task: "Create a fitness tracking app with workout plans and social features" },
  { id: "MF-a65286", task: "Build a modern e-commerce platform with AI recommendations" },
  { id: "MF-5510ae", task: "Design a productivity app with task management and analytics" },
  { id: "MF-30ac7b", task: "Develop a social media app with real-time messaging" },
  { id: "MF-9b0c5f", task: "Create a food delivery app with location tracking" },
  { id: "MF-dd2614", task: "Build a learning management system with video streaming" },
  { id: "MF-053dd5", task: "Design a financial dashboard with investment tracking" }
];

const deployedApps = [
  { id: "APP-001", name: "FitTracker Pro", status: "Live", users: "2.3k" },
  { id: "APP-002", name: "ShopSmart", status: "Live", users: "1.8k" },
  { id: "APP-003", name: "TaskMaster", status: "Building", users: "-" }
];

export default function EmergentHomePage({ onStartProject }) {
  const [inputValue, setInputValue] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('MobileForge');
  const [selectedModel, setSelectedModel] = useState('E-11');

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onStartProject(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(`Build me a ${suggestion.text.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-medium">Home</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg">
            <span className="text-sm font-medium">10.00</span>
          </div>
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
            Buy Credits
          </button>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">M</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-300 mb-2">
            Welcome, Marek
          </h1>
          <h2 className="text-4xl font-light">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              What will you build today?
            </span>
          </h2>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <div className="relative bg-gray-900/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Build me a beautiful mobile app for..."
              className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none text-lg leading-relaxed min-h-[100px]"
              rows={4}
            />
            
            {/* Bottom Controls */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <PlusIcon className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-700 transition-colors">
                    <CodeBracketIcon className="w-4 h-4" />
                    <span>Select Repo</span>
                    <span className="text-gray-400">▼</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-700 transition-colors">
                    <SparklesIcon className="w-4 h-4" />
                    <span>E-11</span>
                    <span className="text-gray-400">▼</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <span className="text-sm">⚙️</span>
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {suggestionButtons.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all hover:scale-105 ${suggestion.color}`}
            >
              <suggestion.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{suggestion.text}</span>
            </button>
          ))}
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <span className="text-sm">🔄</span>
          </button>
        </div>

        {/* Tasks and Apps Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tasks */}
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <button className="flex items-center space-x-2 text-white font-medium">
                <ClipboardDocumentListIcon className="w-5 h-5" />
                <span>Recent Tasks</span>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <span>Deployed Apps</span>
              </button>
              <button className="ml-auto p-1 text-gray-400 hover:text-white transition-colors">
                <span className="text-sm">🔄</span>
              </button>
            </div>
            
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-800 text-sm text-gray-400">
                <span>ID</span>
                <span className="col-span-2">Task</span>
              </div>
              
              {recentTasks.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {recentTasks.map((task, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer">
                      <span className="text-sm text-gray-400 font-mono">{task.id}</span>
                      <span className="col-span-2 text-sm text-gray-300 truncate">{task.task}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-400 mb-2">No tasks yet</p>
                  <p className="text-sm text-gray-500">Click the plus button at the top to create your first task and start building</p>
                </div>
              )}
            </div>
          </div>

          {/* Deployed Apps */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-300 mb-4">Deployed Apps</h3>
            </div>
            
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800 text-sm text-gray-400">
                <span>ID</span>
                <span>Name</span>
                <span>Status</span>
                <span>Users</span>
              </div>
              
              {deployedApps.length > 0 ? (
                <div>
                  {deployedApps.map((app, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer">
                      <span className="text-sm text-gray-400 font-mono">{app.id}</span>
                      <span className="text-sm text-gray-300">{app.name}</span>
                      <span className={`text-sm ${app.status === 'Live' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {app.status}
                      </span>
                      <span className="text-sm text-gray-300">{app.users}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-400 mb-2">No apps deployed yet</p>
                  <p className="text-sm text-gray-500">Start building to see your deployed applications here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <span className="text-gray-500">• • • • • • •</span>
            <span className="text-gray-400 font-medium">From the Community</span>
            <span className="text-gray-500">• • • • • • •</span>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              <SparklesIcon className="w-5 h-5" />
              <span>AI Apps</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-800 border border-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors">
              <CodeBracketIcon className="w-5 h-5" />
              <span>Digital Sidekicks</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-800 border border-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors">
              <GlobeAltIcon className="w-5 h-5" />
              <span>Landing</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-800 border border-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors">
              <RocketLaunchIcon className="w-5 h-5" />
              <span>Hack & Play</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

