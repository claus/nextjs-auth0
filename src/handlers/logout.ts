import { IncomingMessage, ServerResponse } from 'http';

import IAuth0Settings from '../settings';
import { setCookies } from '../utils/cookies';
import CookieSessionStoreSettings from '../session/cookie-store/settings';

export interface AuthorizationParameters {
  redirect_uri?: string;
}

export type LogoutOptions = {
  authParams?: AuthorizationParameters;
};

function createLogoutUrl(settings: IAuth0Settings, postLogoutRedirectUri: string): string {
  return (
    `https://${settings.domain}/v2/logout?`
    + `client_id=${settings.clientId}`
    + `&returnTo=${encodeURIComponent(postLogoutRedirectUri)}`
  );
}

export default function logoutHandler(settings: IAuth0Settings, sessionSettings: CookieSessionStoreSettings) {
  return async (req: IncomingMessage, res: ServerResponse, options: LogoutOptions = {}): Promise<void> => {
    if (!res) {
      throw new Error('Response is not available');
    }

    const { redirect_uri = settings.postLogoutRedirectUri } = (options && options.authParams) || {};

    // Remove the cookies
    setCookies(req, res, [
      {
        name: 'a0:state',
        value: '',
        maxAge: -1
      },
      {
        name: sessionSettings.cookieName,
        value: '',
        maxAge: -1,
        path: sessionSettings.cookiePath
      }
    ]);

    // Redirect to the logout endpoint.
    res.writeHead(302, {
      Location: createLogoutUrl(settings, redirect_uri)
    });
    res.end();
  };
}
