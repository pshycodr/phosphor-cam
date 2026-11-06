import { Capacitor } from "@capacitor/core";

export const isNative = () => {
  return Capacitor.isNativePlatform();
};
