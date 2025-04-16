import Koa from 'koa';
import Router from 'koa-router';
import { EveSso } from './eveSso';
import { Context } from 'koa';
import bodyParser from 'koa-bodyparser';
import { config } from './config';
import jwt from 'jsonwebtoken';

const app = new Koa();
const router = new Router();

// Initialize EVE SSO
const sso = new EveSso(config.eve.clientId, config.eve.secret, config.eve.callbackUri, {
  endpoint: 'https://login.eveonline.com',
  userAgent: 'vs-industry/1.0.0'
});

// Middleware
app.use(bodyParser());

interface JwtPayload {
  sub: string;
  name: string;
  [key: string]: any;
}

// Login route
router.get('/login', async (ctx: Context) => {
  const state = 'my-state'; // In production, use a secure random string
  const scopes = [
    'esi-wallet.read_corporation_wallet.v1',
    'esi-wallet.read_corporation_wallets.v1',
    'esi-industry.read_corporation_jobs.v1',
    'esi-markets.read_corporation_orders.v1',
    'esi-corporations.read_divisions.v1',
    'esi-contracts.read_corporation_contracts.v1'
  ];
  
  ctx.body = {
    loginUrl: sso.getRedirectUrl(state, scopes)
  };
});

// SSO Callback route
router.get('/login/oauth2/code/eve', async (ctx: Context) => {
  const code = ctx.query.code as string;
  
  // TODO: Validate state in production
  
  try {
    const info = await sso.getAccessToken(code);
    
    // Set cookies
    ctx.cookies.set('EVEJWT', info.access_token, {
      httpOnly: true,
      secure: false, // TODO: Change to true in production
      sameSite: 'lax',
      maxAge: info.expires_in * 1000 // Convert seconds to milliseconds
    });

    ctx.cookies.set('EVERefresh', info.refresh_token, {
      httpOnly: true,
      secure: false, // TODO: Change to true in production
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    ctx.cookies.set('EVETokenExpiry', new Date(Date.now() + info.expires_in * 1000).toISOString(), {
      httpOnly: false, // Allow frontend to read this
      secure: false, // TODO: Change to false in production
      sameSite: 'lax',
      maxAge: info.expires_in * 1000
    });

    // Redirect back to frontend
    ctx.redirect('/');
  } catch (error: unknown) {
    console.error('Error in callback:', error);
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
});

// Health check route
router.get('/health', (ctx: Context) => {
  ctx.body = { status: 'ok' };
});

router.post('/auth/refresh', async (ctx: Context) => {
  try {
    const refreshToken = ctx.cookies.get('EVERefresh');
    
    if (!refreshToken) {
      ctx.status = 401;
      ctx.body = { error: 'No refresh token found' };
      return;
    }

    const info = await sso.refreshToken(refreshToken);
    
    // Update cookies with new tokens
    ctx.cookies.set('EVEJWT', info.access_token, {
      httpOnly: true,
      secure: false, // TODO: Change to true in production
      sameSite: 'lax',
      maxAge: info.expires_in * 1000
    });

    // Don't update refresh token if we didn't get a new one
    if (info.refresh_token) {
      ctx.cookies.set('EVERefresh', info.refresh_token, {
        httpOnly: true,
        secure: false, // TODO: Change to true in production
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    ctx.cookies.set('EVETokenExpiry', new Date(Date.now() + info.expires_in * 1000).toISOString(), {
      httpOnly: false,
      secure: false, // TODO: Change to false in production
      sameSite: 'lax',
      maxAge: info.expires_in * 1000
    });

    ctx.body = { success: true };
  } catch (error) {
    console.error('Error refreshing token:', error);
    ctx.status = 401;
    ctx.body = { error: 'Failed to refresh token' };
    
    // Clear cookies on refresh failure
    ctx.cookies.set('EVEJWT', '', { maxAge: 0 });
    ctx.cookies.set('EVERefresh', '', { maxAge: 0 });
    ctx.cookies.set('EVETokenExpiry', '', { maxAge: 0 });
  }
});

// Logout route
router.post('/logout', async (ctx: Context) => {
  // Clear all authentication cookies
  ctx.cookies.set('EVEJWT', '', {
    httpOnly: true,
    secure: false, // TODO: Change to true in production
    sameSite: 'lax',
    maxAge: 0 // Expire immediately
  });

  ctx.cookies.set('EVERefresh', '', {
    httpOnly: true,
    secure: false, // TODO: Change to true in production
    sameSite: 'lax',
    maxAge: 0 // Expire immediately
  });

  ctx.cookies.set('EVETokenExpiry', '', {
    httpOnly: false,
    secure: false, // TODO: Change to true in production
    sameSite: 'lax',
    maxAge: 0 // Expire immediately
  });

  ctx.body = { success: true };
});

// Add the /me endpoint
router.get('/me', async (ctx: Context) => {
  try {
    const token = ctx.cookies.get('EVEJWT');
    if (!token) {
      ctx.status = 401;
      ctx.body = { error: 'No token provided' };
      return;
    }

    // Decode the JWT token without verification
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid token format' };
      return;
    }

    // Extract character ID from sub claim (format: "CHARACTER:EVE:123456789")
    const characterId = decoded.sub?.split(':')[2];
    const characterName = decoded.name;

    if (!characterId || !characterName) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid token claims' };
      return;
    }

    ctx.body = {
      characterId,
      characterName
    };
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    ctx.status = 401;
    ctx.body = { error: 'Invalid token' };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
}); 