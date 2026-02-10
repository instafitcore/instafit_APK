import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.instafitcore.app',
  appName: 'InstaFitCore',
  webDir: 'out',
  server: {
    url: 'https://www.instafitcore.com',
    allowNavigation: ['www.instafitcore.com', 'instafitcore.com'],
    androidScheme: 'https' // This fixes the black screen for many users
  }
};

export default config;