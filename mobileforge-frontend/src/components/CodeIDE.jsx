import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderIcon, 
  DocumentIcon, 
  PlayIcon, 
  StopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  CommandLineIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const CodeIDE = ({ appId, appName = "AI Photo Enhancer" }) => {
  const [selectedFile, setSelectedFile] = useState('App.jsx');
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'info', text: '$ npm start' },
    { type: 'success', text: 'Development server starting...' },
    { type: 'info', text: 'Compiled successfully!' },
    { type: 'info', text: 'Local: http://localhost:3000' },
    { type: 'warning', text: 'Warning: React Hook useEffect has a missing dependency' },
    { type: 'error', text: 'Error: Cannot resolve module \'./components/PhotoEditor\'' }
  ]);
  const [isRunning, setIsRunning] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({
    'src': true,
    'components': true,
    'assets': false,
    'utils': false
  });

  const fileTree = {
    'package.json': { type: 'file', icon: DocumentIcon },
    'App.jsx': { type: 'file', icon: DocumentIcon },
    'index.js': { type: 'file', icon: DocumentIcon },
    'src': {
      type: 'folder',
      icon: FolderIcon,
      children: {
        'components': {
          type: 'folder',
          icon: FolderIcon,
          children: {
            'PhotoEditor.jsx': { type: 'file', icon: DocumentIcon },
            'FilterPanel.jsx': { type: 'file', icon: DocumentIcon },
            'ImageUpload.jsx': { type: 'file', icon: DocumentIcon },
            'PreviewCanvas.jsx': { type: 'file', icon: DocumentIcon }
          }
        },
        'utils': {
          type: 'folder',
          icon: FolderIcon,
          children: {
            'imageProcessing.js': { type: 'file', icon: DocumentIcon },
            'filters.js': { type: 'file', icon: DocumentIcon },
            'api.js': { type: 'file', icon: DocumentIcon }
          }
        },
        'styles': {
          type: 'folder',
          icon: FolderIcon,
          children: {
            'App.css': { type: 'file', icon: DocumentIcon },
            'components.css': { type: 'file', icon: DocumentIcon }
          }
        }
      }
    },
    'assets': {
      type: 'folder',
      icon: FolderIcon,
      children: {
        'images': {
          type: 'folder',
          icon: FolderIcon,
          children: {
            'logo.png': { type: 'file', icon: DocumentIcon },
            'placeholder.jpg': { type: 'file', icon: DocumentIcon }
          }
        }
      }
    }
  };

  const codeContent = {
    'App.jsx': `import React, { useState } from 'react';
import PhotoEditor from './components/PhotoEditor';
import FilterPanel from './components/FilterPanel';
import ImageUpload from './components/ImageUpload';
import './styles/App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState([]);

  const handleImageUpload = (image) => {
    setSelectedImage(image);
  };

  const handleFilterApply = (filter) => {
    setAppliedFilters([...appliedFilters, filter]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Photo Enhancer</h1>
      </header>
      
      <main className="app-main">
        {!selectedImage ? (
          <ImageUpload onImageUpload={handleImageUpload} />
        ) : (
          <div className="editor-container">
            <PhotoEditor 
              image={selectedImage}
              filters={appliedFilters}
            />
            <FilterPanel 
              onFilterApply={handleFilterApply}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;`,
    'PhotoEditor.jsx': `import React, { useRef, useEffect } from 'react';

const PhotoEditor = ({ image, filters }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Apply image and filters to canvas
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Apply filters
        filters.forEach(filter => {
          applyFilter(ctx, filter);
        });
      };
      img.src = image;
    }
  }, [image, filters]);

  const applyFilter = (ctx, filter) => {
    // Filter application logic
    switch(filter.type) {
      case 'brightness':
        ctx.filter = \`brightness(\${filter.value}%)\`;
        break;
      case 'contrast':
        ctx.filter = \`contrast(\${filter.value}%)\`;
        break;
      default:
        break;
    }
  };

  return (
    <div className="photo-editor">
      <canvas ref={canvasRef} className="editor-canvas" />
    </div>
  );
};

export default PhotoEditor;`
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const renderFileTree = (tree, level = 0) => {
    return Object.entries(tree).map(([name, item]) => {
      if (item.type === 'folder') {
        const isExpanded = expandedFolders[name];
        return (
          <div key={name}>
            <div 
              className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm`}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => toggleFolder(name)}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 mr-1 text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 mr-1 text-gray-400" />
              )}
              <FolderIcon className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-gray-300">{name}</span>
            </div>
            {isExpanded && item.children && (
              <div>
                {renderFileTree(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div 
            key={name}
            className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm ${
              selectedFile === name ? 'bg-gray-700 border-l-2 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 24}px` }}
            onClick={() => setSelectedFile(name)}
          >
            <DocumentIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-300">{name}</span>
          </div>
        );
      }
    });
  };

  const executeCommand = (command) => {
    setTerminalOutput(prev => [
      ...prev,
      { type: 'command', text: `$ ${command}` },
      { type: 'info', text: 'Executing command...' }
    ]);
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CodeBracketIcon className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">{appName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400">{isRunning ? 'Running' : 'Stopped'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className={`px-3 py-1 rounded text-sm ${
              isRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <>
                <StopIcon className="w-4 h-4 inline mr-1" />
                Stop
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4 inline mr-1" />
                Start
              </>
            )}
          </button>
          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
            Deploy
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="px-3 py-2 bg-gray-750 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 flex items-center">
              <FolderIcon className="w-4 h-4 mr-2" />
              Explorer
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderFileTree(fileTree)}
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          <div className="flex bg-gray-800 border-b border-gray-700">
            <div className="flex items-center px-4 py-2 bg-gray-700 border-r border-gray-600">
              <DocumentIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-300">{selectedFile}</span>
              <XMarkIcon className="w-4 h-4 ml-2 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Code Content */}
          <div className="flex-1 bg-gray-900 p-4 overflow-auto">
            <pre className="text-sm text-gray-300 font-mono leading-relaxed">
              <code>{codeContent[selectedFile] || '// Select a file to view its content'}</code>
            </pre>
          </div>

          {/* Problems Panel */}
          <div className="h-32 bg-gray-800 border-t border-gray-700">
            <div className="px-3 py-2 bg-gray-750 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-yellow-400" />
                Problems (2)
              </h3>
            </div>
            <div className="p-2 space-y-1 overflow-y-auto">
              <div className="flex items-start space-x-2 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-400 mt-0.5" />
                <div>
                  <span className="text-red-400">Error:</span>
                  <span className="text-gray-300 ml-1">Cannot resolve module './components/PhotoEditor'</span>
                  <div className="text-xs text-gray-500">App.jsx:2:24</div>
                </div>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <span className="text-yellow-400">Warning:</span>
                  <span className="text-gray-300 ml-1">React Hook useEffect has a missing dependency</span>
                  <div className="text-xs text-gray-500">PhotoEditor.jsx:15:6</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 flex items-center">
              <CommandLineIcon className="w-4 h-4 mr-2" />
              Terminal
            </h3>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto font-mono text-sm">
            {terminalOutput.map((line, index) => (
              <div key={index} className={`mb-1 ${
                line.type === 'error' ? 'text-red-400' :
                line.type === 'warning' ? 'text-yellow-400' :
                line.type === 'success' ? 'text-green-400' :
                line.type === 'command' ? 'text-blue-400' :
                'text-gray-300'
              }`}>
                {line.text}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">$</span>
              <input 
                type="text" 
                className="flex-1 bg-transparent text-gray-300 outline-none"
                placeholder="Enter command..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    executeCommand(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeIDE;

