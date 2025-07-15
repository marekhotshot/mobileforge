import React, { useState } from 'react';

const SimpleCodeTab = ({ appId, containerStatus, isContainerRunning }) => {
  const [selectedFile, setSelectedFile] = useState('App.jsx');
  const [terminalOutput, setTerminalOutput] = useState('Welcome to MobileForge Terminal\n$ ');

  const fileTree = [
    { name: 'app', type: 'folder', children: [
      { name: 'App.jsx', type: 'file' },
      { name: 'index.js', type: 'file' }
    ]},
    { name: 'assets', type: 'folder', children: [
      { name: 'images', type: 'folder' },
      { name: 'fonts', type: 'folder' }
    ]},
    { name: 'components', type: 'folder', children: [
      { name: 'Header.jsx', type: 'file' },
      { name: 'Footer.jsx', type: 'file' }
    ]},
    { name: 'constants', type: 'folder' },
    { name: 'store', type: 'folder' },
    { name: 'types', type: 'folder' },
    { name: 'utils', type: 'folder' },
    { name: '.gitignore', type: 'file' },
    { name: 'app.json', type: 'file' },
    { name: 'bun.lock', type: 'file' },
    { name: 'package.json', type: 'file' },
    { name: 'tsconfig.json', type: 'file' }
  ];

  const sampleCode = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Photo Enhancer</Text>
      <Text style={styles.subtitle}>Enhance your photos with AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
});`;

  const renderFileTree = (files, depth = 0) => {
    return files.map((file, index) => (
      <div key={index} style={{ marginLeft: depth * 16 }}>
        <div 
          className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm ${
            file.type === 'file' && selectedFile === file.name ? 'bg-gray-700' : ''
          }`}
          onClick={() => file.type === 'file' && setSelectedFile(file.name)}
        >
          <span className="mr-2">
            {file.type === 'folder' ? '📁' : '📄'}
          </span>
          <span className="text-gray-300">{file.name}</span>
        </div>
        {file.children && renderFileTree(file.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Left Panel - File Explorer */}
      <div className="w-80 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-medium mb-2">Files</h3>
          <button className="text-blue-400 text-sm hover:text-blue-300">
            Select a file
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {renderFileTree(fileTree)}
        </div>
      </div>

      {/* Center Panel - Code Editor */}
      <div className="flex-1 flex flex-col">
        {/* Error Banner */}
        <div className="bg-red-900 border-b border-red-700 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">⚠️ 2 critical errors</span>
            </div>
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-white text-sm">Details</button>
              <button className="text-gray-400 hover:text-white text-sm">Fix all</button>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 bg-gray-900 p-4">
          <div className="bg-gray-800 rounded-lg p-4 h-full">
            <div className="text-gray-400 text-sm mb-2">{selectedFile}</div>
            <pre className="text-gray-300 text-sm font-mono overflow-auto h-full">
              {sampleCode}
            </pre>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="h-64 border-t border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-white font-medium">Rork</span>
            <span className="text-green-400 text-sm">Free Fix</span>
          </div>
          <div className="text-gray-300 text-sm mb-3">
            The user is getting TypeScript errors because PanGestureHandler and 
            PanGestureHandlerGestureEvent are not exported from "react-native" - they should be 
            imported from "react-native-gesture-handler". I need to fix the import statement in the 
            EnhancementSlider component.
          </div>
          <div className="text-gray-400 text-sm">
            Looking at the current code, I can see that the EnhancementSlider is trying to import these from 
            "react-native" but they should come from "react-native-gesture-handler".
          </div>
        </div>
      </div>

      {/* Right Panel - Terminal */}
      <div className="w-80 border-l border-gray-700 flex flex-col bg-gray-900">
        <div className="p-3 border-b border-gray-700">
          <div className="text-gray-400 text-sm">Read Only. To use the code editor, 
            <button className="text-blue-400 hover:text-blue-300 ml-1">upgrade to a paid plan</button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="flex border-b border-gray-700">
            <button className="px-4 py-2 text-sm text-white bg-gray-800 border-r border-gray-700">
              App Preview
            </button>
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-white">
              Terminal
            </button>
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-white">
              + New Terminal
            </button>
          </div>
          
          <div className="flex-1 p-4 font-mono text-sm">
            <div className="text-green-400 mb-2">/home/user/rork-app$</div>
            <div className="text-gray-300">
              <pre>{terminalOutput}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCodeTab;

