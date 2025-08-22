import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Import and apply CSS for web
if (Platform.OS === 'web') {
  // Inject CSS directly into the document head
  const style = document.createElement('style');
  style.textContent = `
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: visible;
    }
    
    /* Smooth scrolling for the entire page */
    html {
      scroll-behavior: smooth;
    }
    
    /* Smooth scrolling for custom scroll containers */
    .scroll-container {
      overflow-y: auto;
      overflow-x: hidden;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Custom scrollbar */
    .scroll-container::-webkit-scrollbar {
      width: 8px;
    }
    
    .scroll-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    .scroll-container::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    
    .scroll-container::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    /* Prevent React Native Web default behaviors */
    div[data-rnw="true"] {
      overflow: visible;
    }
  `;
  document.head.appendChild(style);
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
