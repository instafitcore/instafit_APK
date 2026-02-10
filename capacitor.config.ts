import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.instafitcore.app',
  appName: 'InstaFitCore',
  webDir: 'out', // Capacitor will now look in the 'out' folder
  server: {
    androidScheme: 'https'
  }
};

export default config;