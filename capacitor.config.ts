import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.instafitcore.app',
  appName: 'InstaFitCore',
  webDir: 'out',
  server: {
    url: 'https://www.instafitcore.com',
    allowNavigation: ['www.instafitcore.com', 'instafitcore.com'],
    androidScheme: 'https',
    hostname: 'www.instafitcore.com'
  },
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // Show for 3 seconds
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#4CAF50" // Matching your green logo
    }
  }
};

export default config;