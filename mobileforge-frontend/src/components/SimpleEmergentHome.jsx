import React, { useState } from 'react';
import CleanRorkEnvironment from './CleanRorkEnvironment';

export default function SimpleEmergentHome() {
  const [currentView, setCurrentView] = useState('home');
  const [currentApp, setCurrentApp] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const handleStartBuilding = (description) => {
    const appId = `app-${Date.now()}`;
    setCurrentApp({
      id: appId,
      description: description,
      createdAt: new Date()
    });
    setCurrentView('dev');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentApp(null);
  };

  const handleSubmitInput = () => {
    if (inputValue.trim()) {
      handleStartBuilding(inputValue);
    }
  };

  if (currentView === 'dev' && currentApp) {
    return (
      <CleanRorkEnvironment 
        appId={currentApp.id}
        appDescription={currentApp.description}
        onBack={handleBackToHome}
      />
    );
  }

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
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors">
            Buy Credits
          </button>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-300 mb-4">
            Welcome, Marek
          </h1>
          <h2 className="text-3xl md:text-4xl font-light bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            What mobile app will you build today?
          </h2>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-4xl mb-8">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Build me a beautiful mobile app for..."
              className="w-full h-32 bg-gray-900/50 border border-blue-500/50 rounded-2xl p-6 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmitInput();
                }
              }}
            />
            
            {/* Bottom Controls */}
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 bg-orange-600/80 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl transition-all backdrop-blur-sm">
                  <span>📎</span>
                  <span className="text-sm font-medium">Attach</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-purple-600/80 hover:bg-purple-600 text-white px-4 py-2.5 rounded-xl transition-all backdrop-blur-sm">
                  <span className="text-sm font-medium">Select Repo</span>
                  <span>▼</span>
                  <span className="bg-purple-800/60 text-xs px-2 py-1 rounded-lg">4</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-teal-600/80 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl transition-all backdrop-blur-sm">
                  <span className="text-sm font-medium">E-11</span>
                  <span>▼</span>
                  <span className="bg-teal-800/60 text-xs px-2 py-1 rounded-lg">5</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all">
                  <span className="text-lg">⚙️</span>
                </button>
                
                <button 
                  onClick={handleSubmitInput}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                  disabled={!inputValue.trim()}
                >
                  <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button 
            onClick={() => handleStartBuilding("Create a modern mobile fitness app with AI personal trainer, workout tracking, and social features")}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-8 py-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-green-500/25 backdrop-blur-sm"
          >
            📱 Mobile App
          </button>
          <button 
            onClick={() => handleStartBuilding("Build a responsive web application with modern UI/UX and real-time features")}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 backdrop-blur-sm"
          >
            🌐 Web App
          </button>
          <button 
            onClick={() => handleStartBuilding("Design a stunning landing page with animations and conversion optimization")}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-8 py-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25 backdrop-blur-sm"
          >
            🚀 Landing Page
          </button>
          <button 
            onClick={() => handleStartBuilding("Surprise me with an innovative app idea using cutting-edge technology")}
            className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white px-8 py-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-pink-500/25 backdrop-blur-sm"
          >
            ✨ Surprise Me
          </button>
        </div>

        {/* Bottom Section */}
        <div className="w-full max-w-6xl">
          {/* Tab Navigation */}
          <div className="flex items-center space-x-8 mb-6">
            <button className="flex items-center space-x-2 text-white border-b-2 border-white pb-2">
              <span>📋</span>
              <span>Recent Tasks</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <span>🚀</span>
              <span>Deployed Apps</span>
            </button>
            <button className="ml-auto text-gray-400 hover:text-white transition-colors">
              🔄
            </button>
          </div>

          {/* Tasks Table */}
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-800/50 text-gray-400 text-sm font-medium">
              <div>ID</div>
              <div>Task</div>
            </div>
            
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">No tasks yet</p>
              <p className="text-sm">Click the plus button at the top to create your first task and start building</p>
            </div>
          </div>

          {/* Community Section */}
          <div className="text-center mt-16 mb-8">
            <div className="flex items-center justify-center space-x-3 text-gray-400 mb-8">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              </div>
              <span className="text-white font-medium">From the Community</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-black px-8 py-4 rounded-2xl font-medium hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                🤖 AI Apps
              </button>
              <button className="bg-gray-800/50 text-white px-8 py-4 rounded-2xl hover:bg-gray-700/50 transition-all transform hover:scale-105 backdrop-blur-sm border border-gray-700/50">
                📱 Digital Sidekicks
              </button>
              <button className="bg-gray-800/50 text-white px-8 py-4 rounded-2xl hover:bg-gray-700/50 transition-all transform hover:scale-105 backdrop-blur-sm border border-gray-700/50">
                📄 Landing
              </button>
              <button className="bg-gray-800/50 text-white px-8 py-4 rounded-2xl hover:bg-gray-700/50 transition-all transform hover:scale-105 backdrop-blur-sm border border-gray-700/50">
                🎮 Hack & Play
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

