import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Button } from '@/components/ui/button.jsx';
import { 
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
  PlayIcon,
  ArrowPathIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const deviceTypes = [
  {
    id: 'mobile',
    name: 'Mobile',
    icon: DevicePhoneMobileIcon,
    width: '375px',
    height: '667px',
    scale: 0.8
  },
  {
    id: 'tablet',
    name: 'Tablet',
    icon: DeviceTabletIcon,
    width: '768px',
    height: '1024px',
    scale: 0.6
  },
  {
    id: 'desktop',
    name: 'Desktop',
    icon: ComputerDesktopIcon,
    width: '100%',
    height: '100%',
    scale: 1
  }
];

const frameworks = [
  { id: 'react-native', name: 'React Native', color: 'text-blue-500' },
  { id: 'flutter', name: 'Flutter', color: 'text-cyan-500' },
  { id: 'pwa', name: 'PWA', color: 'text-purple-500' }
];

function DeviceFrame({ device, children }) {
  if (device.id === 'desktop') {
    return (
      <div className="w-full h-full bg-background border rounded-lg overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div 
        className="bg-gray-800 rounded-[2rem] p-2 shadow-2xl"
        style={{
          width: `calc(${device.width} * ${device.scale} + 16px)`,
          height: `calc(${device.height} * ${device.scale} + 16px)`
        }}
      >
        <div 
          className="bg-background rounded-[1.5rem] overflow-hidden relative"
          style={{
            width: `calc(${device.width} * ${device.scale})`,
            height: `calc(${device.height} * ${device.scale})`
          }}
        >
          {/* Status bar for mobile */}
          {device.id === 'mobile' && (
            <div className="bg-gray-900 text-white text-xs px-4 py-1 flex justify-between items-center">
              <span>9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2 bg-white rounded-sm"></div>
                <div className="w-1 h-2 bg-white rounded-sm"></div>
              </div>
            </div>
          )}
          
          <div className="h-full overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function AppPreview({ framework }) {
  const sampleApps = {
    'react-native': {
      title: 'React Native App',
      content: (
        <div className="p-4 h-full bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h1 className="text-xl font-bold text-gray-800 mb-2">Welcome to Your App</h1>
            <p className="text-gray-600 text-sm">Built with React Native</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Feature 1</div>
                  <div className="text-xs text-gray-500">Native performance</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Feature 2</div>
                  <div className="text-xs text-gray-500">Cross-platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    'flutter': {
      title: 'Flutter App',
      content: (
        <div className="p-4 h-full bg-gradient-to-br from-cyan-50 to-teal-100">
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h1 className="text-xl font-bold text-gray-800 mb-2">Flutter Application</h1>
            <p className="text-gray-600 text-sm">Beautiful native interfaces</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="w-12 h-12 bg-cyan-500 rounded-full mx-auto mb-2"></div>
              <div className="text-xs font-medium">Widget 1</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="w-12 h-12 bg-teal-500 rounded-full mx-auto mb-2"></div>
              <div className="text-xs font-medium">Widget 2</div>
            </div>
          </div>
        </div>
      )
    },
    'pwa': {
      title: 'Progressive Web App',
      content: (
        <div className="p-4 h-full bg-gradient-to-br from-purple-50 to-pink-100">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h1 className="text-xl font-bold text-gray-800 mb-2">PWA Dashboard</h1>
            <p className="text-gray-600 text-sm">Web-based mobile experience</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Analytics</span>
              <span className="text-xs text-green-600">+12%</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Users</span>
                <span>1,234</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const app = sampleApps[framework] || sampleApps['react-native'];
  
  return app.content;
}

export default function PreviewPanel() {
  const [selectedDevice, setSelectedDevice] = useState(0);
  const [selectedFramework, setSelectedFramework] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-card-foreground">Live Preview</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm">
              <PlayIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ShareIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Framework Selection */}
        <div className="mb-3">
          <Tab.Group selectedIndex={selectedFramework} onChange={setSelectedFramework}>
            <Tab.List className="flex space-x-1 rounded-lg bg-muted p-1">
              {frameworks.map((framework, index) => (
                <Tab
                  key={framework.id}
                  className={({ selected }) =>
                    `flex-1 rounded-md py-2 px-3 text-xs font-medium leading-5 transition-all
                     ${selected 
                       ? 'bg-background text-foreground shadow' 
                       : 'text-muted-foreground hover:bg-background/50'
                     }`
                  }
                >
                  <span className={framework.color}>{framework.name}</span>
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>
        </div>

        {/* Device Selection */}
        <Tab.Group selectedIndex={selectedDevice} onChange={setSelectedDevice}>
          <Tab.List className="flex space-x-1 rounded-lg bg-muted p-1">
            {deviceTypes.map((device, index) => (
              <Tab
                key={device.id}
                className={({ selected }) =>
                  `flex-1 rounded-md py-2 px-3 text-xs font-medium leading-5 transition-all
                   ${selected 
                     ? 'bg-background text-foreground shadow' 
                     : 'text-muted-foreground hover:bg-background/50'
                   }`
                }
              >
                <div className="flex items-center justify-center gap-1">
                  <device.icon className="h-3 w-3" />
                  <span>{device.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden bg-muted/20">
        <DeviceFrame device={deviceTypes[selectedDevice]}>
          <AppPreview framework={frameworks[selectedFramework].id} />
        </DeviceFrame>
      </div>

      {/* Status Bar */}
      <div className="border-t p-3 bg-muted/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Framework: {frameworks[selectedFramework].name}</span>
          <span>Device: {deviceTypes[selectedDevice].name}</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Live
          </span>
        </div>
      </div>
    </div>
  );
}

