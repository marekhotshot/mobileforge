import React, { useState, useEffect } from 'react';
import { 
  FolderIcon, 
  FolderOpenIcon,
  DocumentIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  CommandLineIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const CodeTabInterface = ({ appId, containerStatus, isContainerRunning }) => {
  const [selectedFile, setSelectedFile] = useState('components/EnhancementSlider.tsx');
  const [expandedFolders, setExpandedFolders] = useState({
    'app': true,
    'components': true,
    'assets': false,
    'constants': false,
    'store': false,
    'types': false,
    'utils': false
  });
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'info', text: '/home/user/rork-app$', timestamp: new Date() },
    { type: 'success', text: 'Container initialized successfully', timestamp: new Date() },
    { type: 'info', text: 'Ready for commands...', timestamp: new Date() }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [errors, setErrors] = useState([
    {
      id: 1,
      file: 'components/EnhancementSlider.tsx',
      line: 234,
      type: 'error',
      code: 'TS2305',
      message: 'Module "react-native" has no exported member \'PanGestureHandler\'.',
      severity: 'critical'
    },
    {
      id: 2,
      file: 'components/EnhancementSlider.tsx',
      line: 253,
      type: 'error', 
      code: 'TS2305',
      message: 'Module "react-native" has no exported member \'PanGestureHandlerGestureEvent\'.',
      severity: 'critical'
    }
  ]);

  const fileStructure = {
    'app': {
      type: 'folder',
      children: {
        '(tabs)': {
          type: 'folder',
          children: {
            'index.tsx': { type: 'file', icon: '📱' },
            'camera.tsx': { type: 'file', icon: '📷' },
            'gallery.tsx': { type: 'file', icon: '🖼️' },
            'settings.tsx': { type: 'file', icon: '⚙️' }
          }
        },
        '_layout.tsx': { type: 'file', icon: '📄' }
      }
    },
    'assets': {
      type: 'folder',
      children: {
        'images': {
          type: 'folder',
          children: {
            'icon.png': { type: 'file', icon: '🖼️' },
            'splash.png': { type: 'file', icon: '🖼️' }
          }
        },
        'fonts': {
          type: 'folder',
          children: {
            'Inter-Regular.ttf': { type: 'file', icon: '🔤' }
          }
        }
      }
    },
    'components': {
      type: 'folder',
      children: {
        'EnhancementSlider.tsx': { type: 'file', icon: '⚛️', hasError: true },
        'CameraView.tsx': { type: 'file', icon: '⚛️' },
        'PhotoGallery.tsx': { type: 'file', icon: '⚛️' },
        'SettingsPanel.tsx': { type: 'file', icon: '⚛️' }
      }
    },
    'constants': {
      type: 'folder',
      children: {
        'Colors.ts': { type: 'file', icon: '🎨' },
        'Layout.ts': { type: 'file', icon: '📐' }
      }
    },
    'store': {
      type: 'folder',
      children: {
        'photoStore.ts': { type: 'file', icon: '🗄️' },
        'settingsStore.ts': { type: 'file', icon: '🗄️' }
      }
    },
    'types': {
      type: 'folder',
      children: {
        'Photo.ts': { type: 'file', icon: '📝' },
        'Settings.ts': { type: 'file', icon: '📝' }
      }
    },
    'utils': {
      type: 'folder',
      children: {
        'imageProcessor.ts': { type: 'file', icon: '🔧' },
        'apiClient.ts': { type: 'file', icon: '🔧' }
      }
    },
    '.gitignore': { type: 'file', icon: '📄' },
    'app.json': { type: 'file', icon: '📄' },
    'bun.lock': { type: 'file', icon: '🔒' },
    'package.json': { type: 'file', icon: '📦' },
    'tsconfig.json': { type: 'file', icon: '📄' }
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const selectFile = (filePath) => {
    setSelectedFile(filePath);
  };

  const executeTerminalCommand = () => {
    if (!terminalInput.trim()) return;

    const newOutput = {
      type: 'command',
      text: `$ ${terminalInput}`,
      timestamp: new Date()
    };

    setTerminalOutput(prev => [...prev, newOutput]);

    // Simulate command execution
    setTimeout(() => {
      let response;
      if (terminalInput.includes('npm install')) {
        response = { type: 'success', text: 'Dependencies installed successfully', timestamp: new Date() };
      } else if (terminalInput.includes('expo start')) {
        response = { type: 'info', text: 'Starting development server...', timestamp: new Date() };
      } else if (terminalInput.includes('fix')) {
        response = { type: 'success', text: 'Import statements updated', timestamp: new Date() };
      } else {
        response = { type: 'info', text: 'Command executed', timestamp: new Date() };
      }
      
      setTerminalOutput(prev => [...prev, response]);
    }, 1000);

    setTerminalInput('');
  };

  const renderFileTree = (structure, path = '', level = 0) => {
    return Object.entries(structure).map(([name, item]) => {
      const fullPath = path ? `${path}/${name}` : name;
      const isExpanded = expandedFolders[name];
      const isSelected = selectedFile === fullPath;
      
      if (item.type === 'folder') {
        return (
          <div key={fullPath}>
            <div 
              className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-gray-600' : ''}`}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => toggleFolder(name)}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 mr-1 text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 mr-1 text-gray-400" />
              )}
              {isExpanded ? (
                <FolderOpenIcon className="w-4 h-4 mr-2 text-blue-400" />
              ) : (
                <FolderIcon className="w-4 h-4 mr-2 text-blue-400" />
              )}
              <span className="text-sm text-gray-200">{name}</span>
            </div>
            {isExpanded && item.children && (
              <div>
                {renderFileTree(item.children, fullPath, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div 
            key={fullPath}
            className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-gray-600' : ''}`}
            style={{ paddingLeft: `${level * 16 + 24}px` }}
            onClick={() => selectFile(fullPath)}
          >
            <span className="mr-2">{item.icon}</span>
            <span className={`text-sm ${item.hasError ? 'text-red-400' : 'text-gray-200'}`}>
              {name}
            </span>
            {item.hasError && (
              <ExclamationTriangleIcon className="w-4 h-4 ml-2 text-red-400" />
            )}
          </div>
        );
      }
    });
  };

  const getFileContent = (filePath) => {
    if (filePath === 'components/EnhancementSlider.tsx') {
      return `import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native';

interface EnhancementSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const EnhancementSlider: React.FC<EnhancementSliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleGesture = (event: PanGestureHandlerGestureEvent) => {
    // Gesture handling logic
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enhancement Level</Text>
      <PanGestureHandler onGestureEvent={handleGesture}>
        <View style={styles.slider}>
          <View style={[styles.track, { width: \`\${value}%\` }]} />
          <View style={[styles.thumb, { left: \`\${value}%\` }]} />
        </View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  slider: {
    height: 40,
    backgroundColor: '#333',
    borderRadius: 20,
    position: 'relative',
  },
  track: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    position: 'absolute',
    top: 10,
    marginLeft: -10,
  },
});`;
    }
    return `// ${filePath}\n// File content will be loaded here...`;
  };

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* File Explorer */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-200">Files</h3>
            <button className="text-gray-400 hover:text-white text-sm">
              Select a file
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {renderFileTree(fileStructure)}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Error Panel */}
        {errors.length > 0 && (
          <div className="bg-red-900/20 border-b border-red-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-400 font-medium">{errors.length} critical errors</span>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-white text-sm">Details</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                  Fix all
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-300 mb-3">
              Please fix the following errors:
            </div>
            
            {errors.map((error) => (
              <div key={error.id} className="text-sm text-gray-300 mb-1">
                {error.file}({error.line}): error {error.code}: {error.message}
              </div>
            ))}
          </div>
        )}

        {/* AI Assistant Panel */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="font-medium text-white">Rork</span>
                <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded">Free Fix</span>
              </div>
              
              <div className="text-sm text-gray-300 mb-3">
                <div className="font-medium mb-1">▼ Thoughts</div>
                <p>The user is getting TypeScript errors because `PanGestureHandler` and `PanGestureHandlerGestureEvent` are not exported from "react-native" - they should be imported from "react-native-gesture-handler". I need to fix the import statement in the EnhancementSlider component.</p>
                
                <p className="mt-2">Looking at the current code, I can see that the EnhancementSlider is trying to import these from "react-native" but they should come from "react-native-gesture-handler".</p>
                
                <p className="mt-2">I need to update the import statement to fix this error.</p>
              </div>
              
              <div className="bg-gray-700 rounded p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fix EnhancementSlider import errors</span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  ● Created components/EnhancementSlider.tsx
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">🔄 Restore</button>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">⚡ Code</button>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">📤 Share</button>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">📋 Copy</button>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">🔄 Redo</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex">
          <div className="flex-1 bg-gray-900">
            <div className="border-b border-gray-700 p-2">
              <span className="text-sm text-gray-400">{selectedFile}</span>
            </div>
            <div className="p-4 font-mono text-sm">
              <pre className="text-gray-300 whitespace-pre-wrap">
                {getFileContent(selectedFile)}
              </pre>
            </div>
          </div>

          {/* Terminal Panel */}
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="flex border-b border-gray-700">
              <button className="px-4 py-2 text-sm bg-gray-700 text-white border-r border-gray-600">
                App Preview
              </button>
              <button className="px-4 py-2 text-sm text-gray-400 hover:text-white">
                📺 Terminal
              </button>
              <button className="px-4 py-2 text-sm text-gray-400 hover:text-white">
                + New Terminal
              </button>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto">
              <div className="text-xs text-green-400 mb-2">/home/user/rork-app$</div>
              {terminalOutput.map((output, index) => (
                <div key={index} className={`text-xs mb-1 ${
                  output.type === 'error' ? 'text-red-400' :
                  output.type === 'success' ? 'text-green-400' :
                  output.type === 'command' ? 'text-blue-400' :
                  'text-gray-300'
                }`}>
                  {output.text}
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-700 p-2">
              <div className="flex">
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && executeTerminalCommand()}
                  placeholder="Enter command..."
                  className="flex-1 bg-gray-700 text-white text-sm px-2 py-1 rounded-l border-none outline-none"
                />
                <button
                  onClick={executeTerminalCommand}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-r"
                >
                  <PlayIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeTabInterface;

