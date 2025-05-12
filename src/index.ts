import { TwitterAuthApi } from './service/auth.service';
import { pipe } from 'ramda';
import queryString from 'query-string';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import type {
  BrowserResult,
  RedirectResult,
} from 'react-native-inappbrowser-reborn';
import { getAppDeepLink } from './@utils/linking';

type TwitterAuthProviderProps = {
  clientId: string;
  clientSecret: string;
};

type TwitterAuthProviderStateKeys =
  | 'oauth_token'
  | 'oauth_token_secret'
  | 'oauth_verifier';

type TwitterAuthProviderState = {
  [key in TwitterAuthProviderStateKeys]: string | undefined;
};

export class TwitterAuthProvider {
  private twitterAuthApi: TwitterAuthApi;

  constructor({ clientId, clientSecret }: TwitterAuthProviderProps) {
    this.twitterAuthApi = new TwitterAuthApi(clientId, clientSecret);
  }

  async login(): Promise<TwitterAuthProviderState> {
    try {
      const { oauth_token, oauth_token_secret } =
        await this.twitterAuthApi.getTwitterRequestToken();

      const twitterLoginUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
      const callbackUrl = getAppDeepLink();

      const { type, url } = (await InAppBrowser.openAuth(
        twitterLoginUrl,
        callbackUrl,
        {
          showTitle: true,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
        }
      )) as (RedirectResult | BrowserResult) & { url: string };

      if (type === 'success' && url) {
        const extractQueryString = (qs: string): string =>
          qs.includes('?') ? (qs.split('?')[1] as string) : '';

        const parseQuery = (qs: string) =>
          queryString.parse(qs) as Record<string, string>;

        // eslint-disable-next-line @typescript-eslint/no-shadow
        const { oauth_token, oauth_verifier } = pipe(
          extractQueryString,
          parseQuery
        )(url) as { oauth_token: string; oauth_verifier: string };

        const accessData = await this.twitterAuthApi.getAccessToken(
          oauth_token,
          oauth_token_secret ?? '',
          oauth_verifier
        );

        return {
          oauth_token: accessData.oauth_token ?? undefined,
          oauth_token_secret: accessData.oauth_token_secret ?? undefined,
          oauth_verifier: accessData.oauth_verifier ?? undefined,
        };
      } else {
        throw new Error('Twitter login cancelled or error');
      }
    } catch (error) {
      throw error;
    }
  }
}
