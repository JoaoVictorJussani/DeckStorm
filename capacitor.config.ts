import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'deckstorm.ch',
  appName: 'Deckstorm',
  webDir: 'dist',
  server: {
    url: "http://10.0.2.2:3333",
    cleartext: true
  }

};

export default config;
