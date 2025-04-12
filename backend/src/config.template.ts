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
    clientId: 'YOUR_CLIENT_ID',
    secret: 'YOUR_CLIENT_SECRET',
    callbackUri: 'http://localhost:5173/login/oauth2/code/eve'
  },
  server: {
    port: 3001
  }
}; 