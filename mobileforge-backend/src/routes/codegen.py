from flask import Blueprint, request, jsonify, Response
import json
import time
import os
import tempfile
import zipfile
from typing import Dict, List, Any

codegen_bp = Blueprint('codegen', __name__)

# Mobile app templates and code generators
class MobileAppGenerator:
    def __init__(self):
        self.templates = {
            'react-native': {
                'name': 'React Native',
                'description': 'Cross-platform mobile app with React Native',
                'files': self._get_react_native_template(),
                'dependencies': {
                    'react': '^18.2.0',
                    'react-native': '^0.72.0',
                    '@react-navigation/native': '^6.1.0',
                    '@react-navigation/stack': '^6.3.0',
                    'react-native-vector-icons': '^10.0.0'
                }
            },
            'flutter': {
                'name': 'Flutter',
                'description': 'Cross-platform mobile app with Flutter',
                'files': self._get_flutter_template(),
                'dependencies': {
                    'flutter': 'sdk: flutter',
                    'cupertino_icons': '^1.0.2',
                    'http': '^0.13.5',
                    'provider': '^6.0.5'
                }
            },
            'pwa': {
                'name': 'Progressive Web App',
                'description': 'Web-based mobile app with PWA features',
                'files': self._get_pwa_template(),
                'dependencies': {
                    'react': '^18.2.0',
                    'react-dom': '^18.2.0',
                    'workbox-webpack-plugin': '^6.5.4',
                    '@types/react': '^18.0.0'
                }
            }
        }
    
    def _get_react_native_template(self) -> Dict[str, str]:
        return {
            'App.js': '''import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>{{APP_NAME}}</Text>
          <Text style={styles.subtitle}>{{APP_DESCRIPTION}}</Text>
        </View>
        
        <View style={styles.content}>
          {{MAIN_CONTENT}}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
});

export default App;''',
            
            'package.json': '''{
  "name": "{{APP_PACKAGE_NAME}}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {{DEPENDENCIES}},
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "babel-jest": "^29.2.1",
    "eslint": "^8.19.0",
    "jest": "^29.2.1",
    "metro-react-native-babel-preset": "0.73.9"
  },
  "jest": {
    "preset": "react-native"
  }
}''',
            
            'android/app/src/main/AndroidManifest.xml': '''<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    
    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>''',
            
            'ios/Info.plist': '''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>{{APP_NAME}}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSExceptionDomains</key>
        <dict>
            <key>localhost</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <true/>
            </dict>
        </dict>
    </dict>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>'''
        }
    
    def _get_flutter_template(self) -> Dict[str, str]:
        return {
            'lib/main.dart': '''import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '{{APP_NAME}}',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: MyHomePage(title: '{{APP_NAME}}'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key? key, required this.title}) : super(key: key);
  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Colors.blue,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              '{{APP_DESCRIPTION}}',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 20),
            {{MAIN_CONTENT}}
          ],
        ),
      ),
    );
  }
}''',
            
            'pubspec.yaml': '''name: {{APP_PACKAGE_NAME}}
description: {{APP_DESCRIPTION}}
version: 1.0.0+1

environment:
  sdk: ">=2.17.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  {{DEPENDENCIES}}

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true''',
            
            'android/app/src/main/AndroidManifest.xml': '''<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:label="{{APP_NAME}}"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>'''
        }
    
    def _get_pwa_template(self) -> Dict[str, str]:
        return {
            'src/App.js': '''import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>{{APP_NAME}}</h1>
        <p>{{APP_DESCRIPTION}}</p>
      </header>
      <main className="App-main">
        {{MAIN_CONTENT}}
      </main>
    </div>
  );
}

export default App;''',
            
            'src/App.css': '''.App {
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
}

.App-main {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
}

.App h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
}

.App p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.8;
}''',
            
            'public/manifest.json': '''{
  "short_name": "{{APP_NAME}}",
  "name": "{{APP_NAME}} - {{APP_DESCRIPTION}}",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}''',
            
            'package.json': '''{
  "name": "{{APP_PACKAGE_NAME}}",
  "version": "1.0.0",
  "private": true,
  "dependencies": {{DEPENDENCIES}},
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}'''
        }
    
    def generate_app_content(self, app_type: str, description: str) -> str:
        """Generate specific content based on app type and description"""
        content_generators = {
            'fitness': self._generate_fitness_content,
            'social': self._generate_social_content,
            'ecommerce': self._generate_ecommerce_content,
            'productivity': self._generate_productivity_content,
            'default': self._generate_default_content
        }
        
        # Detect app type from description
        detected_type = 'default'
        for app_type_key in content_generators.keys():
            if app_type_key in description.lower():
                detected_type = app_type_key
                break
        
        return content_generators[detected_type](description)
    
    def _generate_fitness_content(self, description: str) -> str:
        return '''<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Start Workout</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Track Progress</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>View Statistics</Text>
</TouchableOpacity>'''
    
    def _generate_social_content(self, description: str) -> str:
        return '''<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Create Post</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>View Feed</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Messages</Text>
</TouchableOpacity>'''
    
    def _generate_ecommerce_content(self, description: str) -> str:
        return '''<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Browse Products</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Shopping Cart</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>My Orders</Text>
</TouchableOpacity>'''
    
    def _generate_productivity_content(self, description: str) -> str:
        return '''<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Add Task</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>View Projects</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Time Tracker</Text>
</TouchableOpacity>'''
    
    def _generate_default_content(self, description: str) -> str:
        return '''<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Get Started</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Explore Features</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Settings</Text>
</TouchableOpacity>'''
    
    def generate_app(self, framework: str, app_name: str, description: str, package_name: str = None) -> Dict[str, Any]:
        """Generate a complete mobile app with all files"""
        if framework not in self.templates:
            raise ValueError(f"Unsupported framework: {framework}")
        
        template = self.templates[framework]
        
        # Generate package name if not provided
        if not package_name:
            package_name = app_name.lower().replace(' ', '').replace('-', '')
        
        # Generate main content based on description
        main_content = self.generate_app_content('default', description)
        
        # Process template files
        generated_files = {}
        for file_path, file_content in template['files'].items():
            processed_content = file_content.replace('{{APP_NAME}}', app_name)
            processed_content = processed_content.replace('{{APP_DESCRIPTION}}', description)
            processed_content = processed_content.replace('{{APP_PACKAGE_NAME}}', package_name)
            processed_content = processed_content.replace('{{MAIN_CONTENT}}', main_content)
            processed_content = processed_content.replace('{{DEPENDENCIES}}', json.dumps(template['dependencies'], indent=2))
            
            generated_files[file_path] = processed_content
        
        return {
            'framework': framework,
            'app_name': app_name,
            'description': description,
            'package_name': package_name,
            'files': generated_files,
            'dependencies': template['dependencies'],
            'build_commands': self._get_build_commands(framework),
            'deployment_info': self._get_deployment_info(framework)
        }
    
    def _get_build_commands(self, framework: str) -> List[str]:
        commands = {
            'react-native': [
                'npm install',
                'npx react-native run-android',
                'npx react-native run-ios'
            ],
            'flutter': [
                'flutter pub get',
                'flutter build apk',
                'flutter build ios'
            ],
            'pwa': [
                'npm install',
                'npm run build',
                'npm run start'
            ]
        }
        return commands.get(framework, [])
    
    def _get_deployment_info(self, framework: str) -> Dict[str, Any]:
        deployment_info = {
            'react-native': {
                'platforms': ['Android', 'iOS'],
                'stores': ['Google Play Store', 'Apple App Store'],
                'build_outputs': ['app-release.apk', 'app.ipa']
            },
            'flutter': {
                'platforms': ['Android', 'iOS', 'Web'],
                'stores': ['Google Play Store', 'Apple App Store', 'Web'],
                'build_outputs': ['app-release.apk', 'Runner.app', 'web/']
            },
            'pwa': {
                'platforms': ['Web', 'Mobile Web'],
                'stores': ['Web', 'PWA Stores'],
                'build_outputs': ['build/']
            }
        }
        return deployment_info.get(framework, {})

# Initialize the generator
app_generator = MobileAppGenerator()

@codegen_bp.route('/frameworks', methods=['GET'])
def get_frameworks():
    """Get available mobile app frameworks"""
    frameworks = []
    for framework_id, template in app_generator.templates.items():
        frameworks.append({
            'id': framework_id,
            'name': template['name'],
            'description': template['description'],
            'platforms': app_generator._get_deployment_info(framework_id).get('platforms', [])
        })
    
    return jsonify({'frameworks': frameworks})

@codegen_bp.route('/generate', methods=['POST'])
def generate_mobile_app():
    """Generate a complete mobile app"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['framework', 'app_name', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        generated_app = app_generator.generate_app(
            framework=data['framework'],
            app_name=data['app_name'],
            description=data['description'],
            package_name=data.get('package_name')
        )
        
        # Add metadata
        generated_app['id'] = f"app_{int(time.time())}"
        generated_app['created_at'] = time.time()
        generated_app['status'] = 'generated'
        
        return jsonify(generated_app)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Generation failed: {str(e)}'}), 500

@codegen_bp.route('/download/<app_id>', methods=['GET'])
def download_app_code(app_id):
    """Download generated app code as ZIP file"""
    # In a real implementation, you would retrieve the app data from database
    # For now, return a mock response
    return jsonify({
        'download_url': f'/api/codegen/files/{app_id}.zip',
        'expires_at': time.time() + 3600  # 1 hour
    })

@codegen_bp.route('/preview/<app_id>', methods=['GET'])
def preview_app(app_id):
    """Get app preview information"""
    # Mock preview data
    preview_data = {
        'app_id': app_id,
        'screenshots': [
            f'/api/static/previews/{app_id}_mobile.png',
            f'/api/static/previews/{app_id}_tablet.png'
        ],
        'features': [
            'Cross-platform compatibility',
            'Modern UI components',
            'Responsive design',
            'Performance optimized',
            'Native device features'
        ],
        'technical_specs': {
            'min_android_version': '6.0',
            'min_ios_version': '12.0',
            'bundle_size': '15.2 MB',
            'performance_score': 92
        }
    }
    
    return jsonify(preview_data)

