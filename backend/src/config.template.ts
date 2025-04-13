export interface Config {
  eve: {
    clientId: string;
    secret: string;
    callbackUri: string;
  };
  server: {
    port: number;
  };
}

export const config: Config = {
  eve: {
    clientId: process.env.EVE_CLIENT_ID || 'YOUR_CLIENT_ID',
    secret: process.env.EVE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
    callbackUri: process.env.EVE_CALLBACK_URI || 'http://localhost:5173/login/oauth2/code/eve'
  },
  server: {
    port: Number(process.env.SERVER_PORT) || 3001
  }
}; 