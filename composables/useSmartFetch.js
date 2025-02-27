// import { useNuxtApp, useAsyncData } from '#app';
import { ref, reactive, watch, isRef, onMounted, toValue } from 'vue';

/**
 * @typedef {Object} CacheEntry
 * @property {any} data - Cached response data
 * @property {number} timestamp - Cache timestamp in milliseconds
 */

/**
 * @typedef {Object} SmartFetchOptions
 * @property {boolean} [enableCache=true] - Enable client-side caching
 * @property {string} [cacheKey] - Custom cache key
 * @property {number} [cacheTime=300000] - Cache duration in milliseconds
 * @property {boolean} [ssr] - Enable server-side rendering
 * @property {Array<Ref>} [dependencies=[]] - Reactive dependencies
 * @property {string} [method='GET'] - HTTP method
 * @property {any} [body] - Request body
 * @property {Object} [headers] - Request headers
 * @property {Object} [params] - Query parameters
 */

const cache = reactive(/** @type {Map<string, CacheEntry>} */ (new Map()));

/**
 * Smart fetch composable with complete HTTP feature support
 * @param {string} request - API endpoint URL
 * @param {SmartFetchOptions} [options={}] - Fetch configuration
 * @returns {{
 *   data: Ref<any>,
 *   pending: Ref<boolean>,
 *   error: Ref<Error|null>,
 *   refresh: Function
 * }}
 */
export const useSmartFetch = (request, options = {}) => {
  const nuxtApp = useNuxtApp();
  const {
    enableCache = true,
    cacheKey,
    cacheTime = 3000,
    ssr: ssrOption,
    dependencies = [],
    method = 'GET',
    body,
    headers,
    params,
  } = options;

  const ssr = ssrOption ?? !!nuxtApp.ssrContext;

  const data = ref(null);
  const error = ref(null);
  const pending = ref(true);
  const isMounted = ref(false);

  /** Generate cache key from relevant parameters */
  const generateKey = () => {
    return cacheKey || [
      request,
      method,
      JSON.stringify({
        ...(method !== 'GET' && { body: toValue(body) }),
        headers: toValue(headers),
        params: toValue(params),
      }),
    ].join('_');
  };

  /** Execute the fetch request with proper HTTP handling */
  const execute = async () => {
    const key = generateKey(); // Recalculate key on every execution

    try {
      pending.value = true;
      error.value = null;

      // Build fetch options dynamically
      const fetchOpts = {
        method,
        ...(headers && { headers: toValue(headers) }),
        ...(params && { params: toValue(params) }),
        ...(method !== 'GET' && body && { body: toValue(body) }), // Omit body for GET
      };

      // Server-side handling
      if (process.server && ssr) {
        const { data: asyncData } = await useAsyncData(key, () =>
          $fetch(request, fetchOpts)
        );
        data.value = asyncData.value;
        return;
      }

      // Client-side handling
      if (process.client) {
        const now = Date.now();

        // Cache logic
        if (enableCache && cache.has(key)) {
          const entry = cache.get(key);
          if (now - entry.timestamp <= cacheTime) {
            data.value = entry.data;
            pending.value = false;
            return;
          }
          cache.delete(key);
        }

        // Fresh fetch
        const response = await $fetch(request, fetchOpts);
        data.value = response;

        if (enableCache) {
          cache.set(key, {
            data: response,
            timestamp: now,
          });
        }
      }
    } catch (err) {
      error.value = err;
      if (enableCache) cache.delete(key);
    } finally {
      pending.value = false;
    }
  };

  // Auto-execute handling
  if (process.server && ssr) {
    execute();
  } else if (process.client) {
    onMounted(async () => {
      isMounted.value = true;
      await execute();
    });
  }

  // Watch dependencies
  if (dependencies.length > 0) {
    watch(dependencies, () => {
      if (process.client && isMounted.value) execute();
    });
  }

  /** Refresh function to force a re-fetch */
  const refresh = async () => {
    if (process.client) {
      await execute(); // Trigger fetch again
    }
  };

  return {
    data,
    pending,
    error,
    refresh,
  };
};