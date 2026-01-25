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
      launchShowDuration: 0,        // Disable the timer
      launchAutoHide: false,       // IMPORTANT: Don't hide until we say so
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#4CAF50"
    }
  }
};

export default config;