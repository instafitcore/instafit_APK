import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.instafitcore.app',
  appName: 'InstaFitCore',
  webDir: 'out', // MUST be 'out' because Step 1 creates this folder
  server: {
    androidScheme: 'https'
  }
};

export default config;