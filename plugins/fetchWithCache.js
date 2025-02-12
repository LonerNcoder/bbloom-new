export default defineNuxtPlugin((nuxtApp) => {
  var HEADERS = {};
  const CACHETIME = 60000;

  /**
   * Normalize cache key by including query parameters and endpoint.
   *
   * @param {string} endpoint - The API endpoint.
   * @param {object} params - Query parameters.
   * @returns {string} - A normalized cache key.
   */
  const normalizeCacheKey = (endpoint, params = {}) => {
    const paramString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    return paramString ? `${endpoint}?${paramString}` : endpoint;
  };

  const fetchWithCache = async (
    endpoint,
    options = {},
    cacheTime = CACHETIME,
    isMounted = true,
    dependency = null
  ) => {
    HEADERS = await nuxtApp.$store.getNormalHeaders();

    const {
      method = 'GET',
      headers = HEADERS,
      params = {},
      body = null,
    } = options;

    // Generate a unique cache key including query parameters
    const cacheKey = normalizeCacheKey(endpoint, params);

    if (isMounted) {
      const cachedData = await getCachedData(cacheKey, cacheTime);
      console.log(cachedData)
      if (cachedData) return cachedData;

      try {
        console.log("fetch is calling")
        const response = await $fetch(endpoint, {
          method,
          headers,
          params,
          body,
        });
        response.fetchedAt = new Date();

        // Manually cache the data after fetching
        cacheData(cacheKey, response, cacheTime);
        return response;
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
      }
    } else {
      const { data, error } = await useAsyncData(
        cacheKey,
        async () => {
          return await $fetch(endpoint, {
            method,
            headers,
            params,
            body,
          });
        },
        {
          transform: (payload) => {
            return {
              ...payload,
              fetchedAt: new Date(),
            };
          },
          getCachedData: (key) => {
            const cachedData = nuxtApp.isHydrating
              ? nuxtApp.payload.data[key]
              : nuxtApp.static.data[key];

            if (!cachedData) return null;

            const expiration = new Date(cachedData.fetchedAt);
            expiration.setTime(expiration.getTime() + cacheTime);

            const isExpired = expiration.getTime() < Date.now();
            return isExpired ? null : cachedData;
          },
          watch: dependency ? [dependency] : false,
        }
      );

      if (error.value) {
        console.error(`Error fetching ${endpoint}:`, error.value);
        throw error.value;
      }

      return data.value;
    }
  };

  const cacheData = (key, data) => {
    const expiration = new Date();
    nuxtApp.$store.setCache(key, {
      data,
      fetchedAt: new Date(),
    });
  };

  const getCachedData = async (key, cacheTime) => {
    const cachedData = await nuxtApp.$store.getCache(key);
    if (!cachedData) return null;

    const expiration = new Date(cachedData.fetchedAt);
    expiration.setTime(expiration.getTime() + cacheTime);

    const isExpired = expiration.getTime() < Date.now();
    return isExpired ? null : cachedData.data;
  };


  return {
    provide: {
      fetchWithCache,
    },
  };
});
