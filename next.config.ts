import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.instafitcore.app',
  appName: 'InstaFitCore',
  webDir: 'out',
  server: {
    // This loads your site INSIDE the app
    url: 'https://www.instafitcore.com', 
    allowNavigation: ['www.instafitcore.com']
  }
};

export default config;