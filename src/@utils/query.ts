import queryString from 'query-string';

/**
 * The function `parseQueryString` takes a URL string and returns an object representing the key-value
 * pairs of the query parameters.
 * @param {string} url - The `url` parameter in the `parseQueryString` function is a string that
 * represents a URL containing query parameters.
 */
export const parseQueryString = (url: string): Record<string, string> =>
  queryString.parse(url) as Record<string, string>;
