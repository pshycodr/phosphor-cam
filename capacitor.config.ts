import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "site.aroy.phosphorcam",
  appName: "Phosphor Cam",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#111318",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
