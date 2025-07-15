import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import ManagementPanel from './ManagementPanel';

const workspaceTabs = [
  { id: 'chat', name: 'AI Chat', component: ChatPanel },
  { id: 'preview', name: 'Live Preview', component: PreviewPanel },
  { id: 'management', name: 'Management', component: ManagementPanel },
  { 
    id: 'code', 
    name: 'Code', 
    component: () => (
      <div className="flex items-center justify-center h-full bg-card text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">Code Editor</h3>
          <p className="text-sm">Generated code will appear here</p>
        </div>
      </div>
    )
  },
  { 
    id: 'marketing', 
    name: 'AI Marketing', 
    component: () => (
      <div className="flex items-center justify-center h-full bg-card text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-semibold mb-2">AI Marketing</h3>
          <p className="text-sm">Marketing tools and content generation</p>
        </div>
      </div>
    )
  }
];

export default function SimpleWorkspace() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">🏗️ MobileForge</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Mobile App Creator</p>
          </div>
          <div className="text-xs text-muted-foreground">
            v1.0.0 • Development Mode
          </div>
        </div>

        {/* Tab Navigation */}
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-lg bg-muted p-1">
            {workspaceTabs.map((tab, index) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  `flex-1 rounded-md py-2 px-4 text-sm font-medium leading-5 transition-all
                   ${selected 
                     ? 'bg-background text-foreground shadow' 
                     : 'text-muted-foreground hover:bg-background/50'
                   }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.Panels className="h-full">
            {workspaceTabs.map((tab, index) => (
              <Tab.Panel key={tab.id} className="h-full">
                <tab.component />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

