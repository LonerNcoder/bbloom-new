import { useNuxtApp } from '#app';

/** @type {Map<string, { data: any, timestamp: number }>} */
const cache = new Map();

/**
 * Simplified fetch for plugin usage with caching
 * @param {string} request - API endpoint URL
 * @param {{
 *  enableCache?: boolean,
 *  cacheKey?: string,
 *  cacheTime?: number,
 *  ssr?: boolean,
 *  method?: string,
 *  body?: any,
 *  headers?: Record<string, string>,
 *  params?: Record<string, any>
 * }} [options={}]
 * @returns {Promise<any>}
 */
export const usePluginFetch = async (request, options = {}) => {
  const nuxtApp = useNuxtApp();
  const {
    enableCache = true,
    cacheKey,
    cacheTime = 300000,
    ssr: ssrOption,
    method = 'GET',
    body,
    headers,
    params,
    ...fetchOptions
  } = options;

  const ssr = ssrOption ?? !!nuxtApp.ssrContext;
  const key = cacheKey || [
    request,
    method,
    JSON.stringify({
      ...(method !== 'GET' && { body }),
      headers,
      params
    })
  ].join('_');

  // Cache check
  if (enableCache) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp <= cacheTime) {
      return cached.data;
    }
  }

  // Prepare fetch options
  const fetchOpts = {
    method,
    ...fetchOptions,
    headers: { ...headers },
    ...(params && { params }),
    ...(method !== 'GET' && body && { body: JSON.stringify(body) })
  };

  try {
    const data = await $fetch(request, fetchOpts);

    if (enableCache) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
    }

    return data;
  } catch (error) {
    if (enableCache) cache.delete(key);
    throw error;
  }
};