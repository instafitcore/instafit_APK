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
      launchShowDuration: 3000,    // Force hide after 3 seconds no matter what
      launchAutoHide: true,        // Set this back to true as a backup
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,           // This shows the user it is actually loading
      androidSpinnerStyle: "large",
      spinnerColor: "#4CAF50"
    }
  }
};

export default config;