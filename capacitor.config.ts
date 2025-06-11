import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'deckstorm.ch',
  appName: 'Deckstorm',
  webDir: 'dist',
  server: {
    url: "http://192.168.56.1:3333",
    cleartext: true
  }

};

export default config;
