import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'deckstorm.ch',
  appName: 'Deckstorm',
  webDir: 'dist',
  server: {
    url: "http://192.168.0.100:3333", // Altere para o IP do seu backend AdonisJS
    cleartext: true
  }

};

export default config;
