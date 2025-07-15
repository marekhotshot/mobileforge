import React, { useEffect, useRef } from 'react';
import { 
  DockviewReact, 
  DockviewReadyEvent, 
  DockviewApi 
} from 'dockview';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import ManagementPanel from './ManagementPanel';
import 'dockview/dist/styles/dockview.css';

// Panel components mapping
const panelComponents = {
  'chat': ChatPanel,
  'preview': PreviewPanel,
  'management': ManagementPanel,
  'code': () => (
    <div className="flex items-center justify-center h-full bg-card text-muted-foreground">
      <div className="text-center">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-semibold mb-2">Code Editor</h3>
        <p className="text-sm">Generated code will appear here</p>
      </div>
    </div>
  ),
  'marketing': () => (
    <div className="flex items-center justify-center h-full bg-card text-muted-foreground">
      <div className="text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-lg font-semibold mb-2">AI Marketing</h3>
        <p className="text-sm">Marketing tools and content generation</p>
      </div>
    </div>
  )
};

export default function DockviewWorkspace() {
  const dockviewRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    const onReady = (event) => {
      apiRef.current = event.api;
      
      // Create initial layout
      setupInitialLayout(event.api);
    };

    const currentRef = dockviewRef.current;
    if (currentRef) {
      currentRef.addEventListener(DockviewReadyEvent.TYPE, onReady);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener(DockviewReadyEvent.TYPE, onReady);
      }
    };
  }, []);

  const setupInitialLayout = (api) => {
    // Add Chat panel (left side)
    const chatPanel = api.addPanel({
      id: 'chat-panel',
      component: 'chat',
      title: 'AI Chat',
      position: { direction: 'left' }
    });

    // Add Preview panel (center)
    const previewPanel = api.addPanel({
      id: 'preview-panel',
      component: 'preview',
      title: 'Live Preview',
      position: { direction: 'right', referencePanel: chatPanel }
    });

    // Add Management panel (right side, tabbed with preview)
    api.addPanel({
      id: 'management-panel',
      component: 'management',
      title: 'Management',
      position: { direction: 'right', referencePanel: previewPanel }
    });

    // Add Code panel (bottom of preview)
    api.addPanel({
      id: 'code-panel',
      component: 'code',
      title: 'Generated Code',
      position: { direction: 'below', referencePanel: previewPanel }
    });

    // Add Marketing panel (bottom of management)
    api.addPanel({
      id: 'marketing-panel',
      component: 'marketing',
      title: 'AI Marketing',
      position: { direction: 'below', referencePanel: 'management-panel' }
    });

    // Set initial sizes
    chatPanel.api.setSize({ width: 400 });
    previewPanel.api.setSize({ width: 600 });
  };

  const components = {
    chat: ChatPanel,
    preview: PreviewPanel,
    management: ManagementPanel,
    code: panelComponents.code,
    marketing: panelComponents.marketing
  };

  return (
    <div className="h-screen w-full bg-background">
      <DockviewReact
        ref={dockviewRef}
        components={components}
        className="dockview-theme-dark"
        watermarkComponent={() => (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-4">🏗️</div>
              <h1 className="text-2xl font-bold mb-2">MobileForge</h1>
              <p className="text-lg">AI-Powered Mobile App Creator</p>
              <p className="text-sm mt-2">Start by opening a panel or drag to create your workspace</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}

