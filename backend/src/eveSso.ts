import { URL, URLSearchParams } from 'url';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import fetch from 'node-fetch';

const ENDPOINT = 'https://login.eveonline.com';

export class EveSso {
  private authorization: string;
  private jwks: any;

  constructor(
    private clientId: string,
    secretKey: string,
    private callbackUri: string,
    private options: { endpoint?: string; userAgent?: string } = {}
  ) {
    this.authorization = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
    const endpoint = options.endpoint || ENDPOINT;
    
    this.jwks = jwksClient({
      jwksUri: `${endpoint}/oauth/jwks`,
      requestHeaders: {
        'User-Agent': options.userAgent || 'vs-industry/1.0.0'
      }
    });
  }

  getRedirectUrl(state: string, scopes?: string[] | string): string {
    const scope = Array.isArray(scopes) ? scopes.join(' ') : scopes || '';
    const endpoint = this.options.endpoint || ENDPOINT;

    const search = new URLSearchParams({
      response_type: 'code',
      redirect_uri: this.callbackUri,
      client_id: this.clientId,
      scope,
      state
    });

    return `${endpoint}/v2/oauth/authorize?${search.toString()}`;
  }

  async getAccessToken(code: string): Promise<any> {
    const endpoint = this.options.endpoint || ENDPOINT;
    const host = new URL(endpoint).hostname;

    try {
      const response = await fetch(`${endpoint}/v2/oauth/token`, {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code
        }).toString(),
        headers: {
          Host: host,
          Authorization: `Basic ${this.authorization}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.options.userAgent || 'vs-industry/1.0.0'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get access token: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data:any = await response.json();

      return new Promise((resolve, reject) => {
        jwt.verify(
          data.access_token,
          (header: any, callback: any) => {
            this.jwks.getSigningKey(header.kid, (err: any, key: any) => {
              if (err) return callback(err);
              callback(null, key.getPublicKey());
            });
          },
          {
            issuer: [endpoint, host]
          },
          (err: any, decoded: any) => {
            if (err) return reject(new Error(`JWT verification failed: ${err.message}`));
            data.decoded_access_token = decoded;
            resolve(data);
          }
        );
      });
    } catch (error) {
      throw new Error(`Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const endpoint = this.options.endpoint || ENDPOINT;
    const host = new URL(endpoint).hostname;

    const response = await fetch(`${endpoint}/v2/oauth/token`, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).toString(),
      headers: {
        Host: host,
        Authorization: `Basic ${this.authorization}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.options.userAgent || 'vs-industry/1.0.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Got status code ${response.status}`);
    }

    const data:any = await response.json();

    return new Promise((resolve, reject) => {
      jwt.verify(
        data.access_token,
        (header: any, callback: any) => {
          this.jwks.getSigningKey(header.kid, (err: any, key: any) => {
            if (err) return callback(err);
            callback(null, key.getPublicKey());
          });
        },
        {
          issuer: [endpoint, host]
        },
        (err: any, decoded: any) => {
          if (err) return reject(err);
          data.decoded_access_token = decoded;
          resolve(data);
        }
      );
    });
  }
} 