import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.instafitcore.app',
  appName: 'InstaFitCore',
  webDir: 'out',
  server: {
    url: 'https://www.instafitcore.com',
    allowNavigation: ['www.instafitcore.com', 'instafitcore.com'],
    androidScheme: 'https',
    hostname: 'www.instafitcore.com' // Force the internal browser to match the site
  },
  // This shows a white screen instead of black while the site loads
  android: {
    backgroundColor: "#ffffff"
  }
};

export default config;