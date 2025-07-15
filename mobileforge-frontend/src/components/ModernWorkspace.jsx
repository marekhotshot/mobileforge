import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import ManagementPanel from './ManagementPanel';
import { 
  ChatBubbleLeftRightIcon,
  EyeIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const tabs = [
  {
    id: 'chat',
    name: 'AI Chat',
    icon: ChatBubbleLeftRightIcon,
    component: ChatPanel,
    color: 'bg-cyan-500 hover:bg-cyan-600',
    activeColor: 'bg-cyan-500 text-white',
    inactiveColor: 'text-cyan-400 hover:text-cyan-300'
  },
  {
    id: 'preview',
    name: 'Live Preview',
    icon: EyeIcon,
    component: PreviewPanel,
    color: 'bg-blue-500 hover:bg-blue-600',
    activeColor: 'bg-blue-500 text-white',
    inactiveColor: 'text-blue-400 hover:text-blue-300'
  },
  {
    id: 'code',
    name: 'Code',
    icon: CodeBracketIcon,
    component: () => <div className="p-6 text-center text-gray-400">Code editor coming soon...</div>,
    color: 'bg-purple-500 hover:bg-purple-600',
    activeColor: 'bg-purple-500 text-white',
    inactiveColor: 'text-purple-400 hover:text-purple-300'
  },
  {
    id: 'management',
    name: 'Management',
    icon: Cog6ToothIcon,
    component: ManagementPanel,
    color: 'bg-orange-500 hover:bg-orange-600',
    activeColor: 'bg-orange-500 text-white',
    inactiveColor: 'text-orange-400 hover:text-orange-300'
  },
  {
    id: 'marketing',
    name: 'AI Marketing',
    icon: SparklesIcon,
    component: () => <div className="p-6 text-center text-gray-400">AI Marketing tools coming soon...</div>,
    color: 'bg-pink-500 hover:bg-pink-600',
    activeColor: 'bg-pink-500 text-white',
    inactiveColor: 'text-pink-400 hover:text-pink-300'
  }
];

export default function ModernWorkspace() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              MobileForge
            </h1>
          </div>
          <span className="text-sm text-gray-400">AI Mobile App Creator</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Ready</span>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">U</span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 py-3">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                    selected
                      ? tab.activeColor + ' shadow-lg'
                      : tab.inactiveColor + ' hover:bg-gray-700'
                  }`
                }
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.Panels className="h-full">
            {tabs.map((tab, index) => (
              <Tab.Panel key={tab.id} className="h-full">
                <div className="h-full bg-gray-900">
                  <tab.component />
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-2 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <span>MobileForge v1.0.0</span>
          <span>•</span>
          <span>React Native Ready</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Backend: Connected</span>
          <span>•</span>
          <span>AI Models: 4 Available</span>
        </div>
      </div>
    </div>
  );
}

