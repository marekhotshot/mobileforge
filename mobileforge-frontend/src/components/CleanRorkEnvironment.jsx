import React, { useState } from 'react';
import SimpleCodeTab from './SimpleCodeTab';
import CodeIDE from './CodeIDE';

const CleanRorkEnvironment = ({ appId, appDescription, onBack }) => {
  const [activeTab, setActiveTab] = useState('preview');

  if (activeTab === 'code') {
    return (
      <div className="h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">📷</span>
                </div>
                <span className="font-medium">AI Photo Enhancer</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-800 rounded-lg">
                <button 
                  onClick={() => setActiveTab('code')}
                  className="px-4 py-2 text-sm bg-gray-700 text-white rounded-l-lg"
                >
                  Code
                </button>
                <button 
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-r-lg"
                >
                  Preview
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-400">Live</span>
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                Publish
              </button>
            </div>
          </div>
        </div>

        {/* Code Interface */}
        <CodeIDE 
          appId={appId}
          appName="AI Photo Enhancer"
        />
      </div>
    );
  }

  // Preview Tab (original three-panel layout)
  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white">
              ←
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-black text-xs">📷</span>
              </div>
              <span className="font-medium">AI Photo Enhancer</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-800 rounded-lg">
              <button 
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 text-sm rounded-l-lg ${
                  activeTab === 'code' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Code
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 text-sm rounded-r-lg ${
                  activeTab === 'preview' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-400">Live</span>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Three Panel Layout */}
      <div className="flex-1 flex">
        {/* Left Panel - Chat */}
        <div className="w-1/3 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="font-medium">Rork</span>
            </div>
            <div className="text-sm text-gray-400 mb-3">
              {appDescription}
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="text-gray-300 text-sm">
              I'll create a beautiful AI camera app that enhances photos using AI. The app will have these key features:
              <br/><br/>
              1. Camera interface to take photos<br/>
              2. AI enhancement capabilities using the AI endpoints provided<br/>
              3. Gallery to view enhanced photos<br/>
              4. Settings for customization
            </div>
          </div>

          <div className="p-4 border-t border-gray-800">
            <input 
              type="text" 
              placeholder="Describe the mobile app you want to build..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Center Panel - Mobile Preview */}
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="relative">
            <div className="w-80 h-[600px] bg-black rounded-[3rem] border-8 border-gray-800 overflow-hidden">
              <div className="bg-black h-8 flex items-center justify-center">
                <div className="text-white text-sm">9:41</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-gray-600 rounded-full animate-spin mb-4 mx-auto"></div>
                  <div className="text-gray-400">Starting...</div>
                </div>
              </div>
              <div className="h-8 flex items-center justify-center">
                <div className="w-32 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - QR Code */}
        <div className="w-1/3 border-l border-gray-800 p-6">
          <h3 className="text-lg font-medium mb-4">Test on your phone</h3>
          
          <div className="bg-white p-4 rounded-lg mb-4">
            <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center mx-auto">
              <span className="text-gray-500 text-xs">QR Code</span>
            </div>
          </div>

          <div className="text-sm text-gray-400 mb-4">
            <div className="mb-2">Scan QR code to test</div>
            <div>To test on your device:</div>
            <div>1. Open Camera app</div>
            <div>2. Scan the QR code above</div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg text-sm text-gray-400 mb-4">
            ⚠️ Browser preview lacks native functions & looks different. Test on device for the best results.
          </div>

          <div className="space-y-2">
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg text-sm">
              View Source Code
            </button>
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg text-sm">
              Deploy to Store
            </button>
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg text-sm">
              Share Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanRorkEnvironment;

