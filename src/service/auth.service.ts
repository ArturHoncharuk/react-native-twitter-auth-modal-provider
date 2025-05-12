import { TWITTER_API_URLS } from '../constants/links';
import { getAppDeepLink } from '../@utils/linking';
import { parseQueryString } from '../@utils/query';
import OAuth from 'oauth-1.0a';
import { pipe } from 'ramda';
import CryptoJS from 'crypto-js';

export interface OAuthParams extends OAuth.Authorization {
  oauth_callback?: string;
}

export class TwitterAuthApi {
  private oauth: OAuth;

  constructor(
    private readonly consumerKey: string,
    private readonly consumerSecret: string
  ) {
    this.oauth = new OAuth({
      consumer: { key: this.consumerKey, secret: this.consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return CryptoJS.HmacSHA1(base_string, key).toString(
          CryptoJS.enc.Base64
        );
      },
    });
  }

  async getTwitterRequestToken(): Promise<Record<string, string>> {
    const callbackUrl = getAppDeepLink();

    const executeSessionParams = () => {
      const params = this.oauth.authorize({
        url: TWITTER_API_URLS.xRequestTokenUrl,
        method: 'POST',
        data: { oauth_callback: callbackUrl },
      });
      return { ...params, oauth_callback: callbackUrl } as OAuthParams;
    };

    const createHeaders = (params: OAuthParams) => this.oauth.toHeader(params);

    const headers = pipe(executeSessionParams, createHeaders)();

    // Convert OAuth header to a standard headers object
    const headerObj = Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, value.toString()])
    );

    try {
      const response = await fetch(TWITTER_API_URLS.xRequestTokenUrl, {
        method: 'POST',
        headers: headerObj,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.text();

      // Check if data exists and is a string
      if (!data || typeof data !== 'string') {
        throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
      }

      return parseQueryString(data);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getAccessToken(
    oauth_token: string,
    oauth_token_secret: string,
    oauth_verifier: string
  ): Promise<Record<string, string>> {
    const token = {
      key: oauth_token,
      secret: oauth_token_secret,
    };

    const createRequestData = () => ({
      url: TWITTER_API_URLS.xAccessTokenUrl,
      method: 'POST',
      data: { oauth_token, oauth_verifier },
    });

    const authorizeRequest = (req: ReturnType<typeof createRequestData>) =>
      this.oauth.authorize(req, token);

    const buildHeaders = (session: OAuth.Authorization) => ({
      ...this.oauth.toHeader(session),
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const headers = pipe(createRequestData, authorizeRequest, buildHeaders)();

    // Convert OAuth header to a standard headers object
    const headerObj = Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, value.toString()])
    );

    try {
      const response = await fetch(TWITTER_API_URLS.xAccessTokenUrl, {
        method: 'POST',
        headers: headerObj,
        body: `oauth_verifier=${encodeURIComponent(oauth_verifier)}`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.text();

      return parseQueryString(data);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}
