import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Button } from '@/components/ui/button.jsx';
import { 
  RocketLaunchIcon,
  ChartBarIcon,
  CogIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const managementTabs = [
  {
    id: 'deploy',
    name: 'Deploy',
    icon: RocketLaunchIcon,
    color: 'text-green-500'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: ChartBarIcon,
    color: 'text-blue-500'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: CogIcon,
    color: 'text-gray-500'
  }
];

function DeploymentTab() {
  const [deploymentStatus, setDeploymentStatus] = useState('ready');
  
  const deploymentTargets = [
    { id: 'app-store', name: 'App Store', icon: CloudArrowUpIcon, status: 'ready' },
    { id: 'play-store', name: 'Play Store', icon: CloudArrowUpIcon, status: 'ready' },
    { id: 'web', name: 'Web Deploy', icon: GlobeAltIcon, status: 'deployed' },
    { id: 'testflight', name: 'TestFlight', icon: CloudArrowUpIcon, status: 'pending' }
  ];

  const handleDeploy = (target) => {
    setDeploymentStatus('deploying');
    setTimeout(() => setDeploymentStatus('deployed'), 3000);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Deployment Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deploymentTargets.map((target) => (
            <div key={target.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <target.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{target.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  target.status === 'deployed' ? 'bg-green-100 text-green-700' :
                  target.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {target.status}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleDeploy(target.id)}
                disabled={target.status === 'deployed'}
              >
                {target.status === 'deployed' ? 'Deployed' : 'Deploy'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Build Information</h3>
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Version:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Build:</span>
            <span>#42</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Deploy:</span>
            <span>2 hours ago</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-green-600">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const metrics = [
    { label: 'Downloads', value: '12.4K', change: '+15%', positive: true },
    { label: 'Active Users', value: '8.2K', change: '+8%', positive: true },
    { label: 'Retention', value: '76%', change: '-2%', positive: false },
    { label: 'Rating', value: '4.8', change: '+0.1', positive: true }
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">App Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-muted rounded-lg p-4">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              <div className={`text-xs ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Usage Trends</h3>
        <div className="bg-muted rounded-lg p-4 h-32 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Analytics chart would appear here</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'New user registration', time: '5 minutes ago' },
            { action: 'App updated to v1.0.1', time: '2 hours ago' },
            { action: 'Performance alert resolved', time: '1 day ago' }
          ].map((activity, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <span className="text-sm">{activity.action}</span>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [notifications, setNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">App Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Push Notifications</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudArrowUpIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Auto Updates</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoUpdate(!autoUpdate)}
            >
              {autoUpdate ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Security</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheckIcon className="h-4 w-4 text-green-500" />
            <span>SSL Certificate: Valid</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheckIcon className="h-4 w-4 text-green-500" />
            <span>API Keys: Secured</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheckIcon className="h-4 w-4 text-green-500" />
            <span>Data Encryption: Active</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Documentation</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            API Documentation
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            User Guide
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Troubleshooting
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ManagementPanel() {
  const [selectedTab, setSelectedTab] = useState(0);

  const renderTabContent = () => {
    switch (managementTabs[selectedTab].id) {
      case 'deploy':
        return <DeploymentTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DeploymentTab />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">App Management</h2>
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-lg bg-muted p-1">
            {managementTabs.map((tab, index) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  `flex-1 rounded-md py-2 px-3 text-xs font-medium leading-5 transition-all
                   ${selected 
                     ? 'bg-background text-foreground shadow' 
                     : 'text-muted-foreground hover:bg-background/50'
                   }`
                }
              >
                <div className="flex items-center justify-center gap-1">
                  <tab.icon className={`h-3 w-3 ${tab.color}`} />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}

