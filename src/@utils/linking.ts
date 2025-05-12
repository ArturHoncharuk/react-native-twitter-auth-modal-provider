import { APP_SCHEME_SLUG } from '../constants/app';
import { Platform } from 'react-native';

/**
 * The function getAppDeepLink returns a deep link based on the platform being used.
 * @returns The function `getAppDeepLink` returns a deep link based on the platform. If the platform is
 * Android, it returns `://my-host/`, otherwise, it returns `://`.
 */
export const getAppDeepLink = () => {
  const scheme = APP_SCHEME_SLUG;
  return Platform.OS === 'android' ? `${scheme}://my-host/` : `${scheme}://`;
};
