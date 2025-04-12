# VS Industry Backend

## Configuration

The application uses a configuration file for sensitive data like API keys and endpoints. To set up:

1. Copy `src/config.template.ts` to `src/config.ts`
2. Update the values in `config.ts` with your EVE Online API credentials
3. Never commit `config.ts` to version control (it's gitignored)

Example config.ts:
```typescript
export const config = {
  eve: {
    clientId: 'your_client_id',
    secret: 'your_client_secret',
    callbackUri: 'http://localhost:5173/login/oauth2/code/eve'
  },
  server: {
    port: 3001
  }
};
```

## Development

```bash
npm install
npm run dev
``` 