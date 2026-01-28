// hooks/useInfiniteScroll.js
import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_RATE_LIMIT_MS = 800;

const useInfiniteScroll = ({
  fetchData,          // Function to fetch data (receives cursor/page info)
  hasMore,            // Boolean indicating if there's more data
  enabled = true,     // Master switch for the hook
  initialLoad = true, // Whether to load data on mount
  rootMargin = '200px', // IntersectionObserver margin
  rateLimitMs = DEFAULT_RATE_LIMIT_MS, // Prevent rapid successive calls
  onError,           // Error callback
  mode = 'cursor',   // 'cursor' or 'page' mode
  initialCursor = null, // For cursor mode
  initialPage = 1,   // For page mode
  scrollContainer = null, // Optional scroll container ref
  debug = false,     // Debug logging
  resetDeps = [],    // Dependencies that trigger reset
} = {}) => {
  const log = useCallback((...args) => {
    if (debug) console.log('[useInfiniteScroll]', ...args);
  }, [debug]);

  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState(null);
  
  // Mode-specific state
  const [page, setPage] = useState(initialPage);
  const cursorRef = useRef(initialCursor);
  
  // Refs
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  /* ---------------- Online / Offline Handling ---------------- */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setError(new Error('Network connection lost'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /* ---------------- Rate Limiting ---------------- */
  const canFetch = useCallback(() => {
    const now = Date.now();
    return now - lastFetchTimeRef.current >= rateLimitMs;
  }, [rateLimitMs]);

  /* ---------------- Core Fetch Logic ---------------- */
  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || isFetchingRef.current || !isOnline) {
      log('Fetch blocked', { enabled, hasMore, isFetching: isFetchingRef.current, isOnline });
      return;
    }

    if (!canFetch()) {
      log('Rate limited');
      return;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = Date.now();
    setError(null);

    try {
      log(`Fetching ${mode === 'cursor' ? 'with cursor:' : 'page:'}`, 
          mode === 'cursor' ? cursorRef.current : page);

      const result = await fetchData(
        mode === 'cursor' ? cursorRef.current : page
      );

      // Update cursor for next fetch if in cursor mode
      if (mode === 'cursor' && result?.nextCursor !== undefined) {
        cursorRef.current = result.nextCursor;
        log('Next cursor set:', cursorRef.current);
      } else if (mode === 'page') {
        setPage(prev => prev + 1);
      }

      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onError?.(errorObj);
      log('Fetch error:', errorObj);
      throw errorObj;
    } finally {
      isFetchingRef.current = false;
    }
  }, [enabled, hasMore, isOnline, canFetch, fetchData, mode, page, onError, log]);

  /* ---------------- Initial Load ---------------- */
  useEffect(() => {
    if (initialLoad && enabled && isOnline && !isFetchingRef.current) {
      log('Initial load triggered');
      loadMore();
    }
  }, [initialLoad, enabled, isOnline, loadMore, log]);

  /* ---------------- Reset Logic ---------------- */
  const reset = useCallback((options = {}) => {
    const { clearData = false } = options;
    
    log('Resetting infinite scroll');
    
    // Reset mode-specific state
    if (mode === 'cursor') {
      cursorRef.current = initialCursor;
    } else {
      setPage(initialPage);
    }
    
    // Reset common state
    setError(null);
    isFetchingRef.current = false;
    lastFetchTimeRef.current = 0;
    
    // Optionally clear any cached data
    if (clearData && fetchData.clearCache) {
      fetchData.clearCache();
    }
  }, [mode, initialCursor, initialPage, fetchData, log]);

  useEffect(() => {
    if (resetDeps.length > 0) {
      reset();
    }
  }, [...resetDeps, reset]);

  /* ---------------- Intersection Observer Setup ---------------- */
  useEffect(() => {
    if (!enabled || !hasMore || !sentinelRef.current) {
      observerRef.current?.disconnect();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          log('Sentinel intersected');
          loadMore();
        }
      },
      {
        root: scrollContainer?.current || null,
        rootMargin,
        threshold: 0.1,
      }
    );

    observerRef.current = observer;
    
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
      log('Observer attached to sentinel');
    }

    return () => {
      log('Cleaning up observer');
      observer.disconnect();
    };
  }, [loadMore, enabled, hasMore, rootMargin, scrollContainer, log]);

  /* ---------------- Manual Actions ---------------- */
  const retry = useCallback(async () => {
    if (isOnline && hasMore && !isFetchingRef.current) {
      log('Manual retry triggered');
      return loadMore();
    }
  }, [isOnline, hasMore, loadMore, log]);

  /* ---------------- Status Helpers ---------------- */
  const canLoadMore = 
    enabled && 
    hasMore && 
    !isFetchingRef.current && 
    isOnline;

  const isLoading = isFetchingRef.current;

  /* ---------------- Return Value ---------------- */
  return {
    // Refs
    sentinelRef,
    
    // State
    page: mode === 'page' ? page : undefined,
    cursor: mode === 'cursor' ? cursorRef.current : undefined,
    error,
    isOnline,
    isFetching: isLoading,
    canLoadMore,
    
    // Actions
    loadMore,
    retry,
    reset,
    
    // Status
    status: {
      isIdle: !isLoading && !error,
      isFetching: isLoading,
      isError: !!error,
      isSuccess: !isLoading && !error,
      hasMore,
      isOnline,
    },
  };
};

export default useInfiniteScroll;