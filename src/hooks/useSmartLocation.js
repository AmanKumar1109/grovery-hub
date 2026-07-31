import { useState, useRef, useCallback } from 'react';

/**
 * Smart GPS location acquisition hook.
 * Collects multiple GPS readings over a short period and selects the most accurate one.
 * Handles all permission states gracefully.
 * 
 * @returns {{ requestLocation, location, accuracy, status, error, reset }}
 */
export default function useSmartLocation() {
  const [location, setLocation] = useState(null);     // { lat, lng }
  const [accuracy, setAccuracy] = useState(null);      // meters
  const [timestamp, setTimestamp] = useState(null);
  const [status, setStatus] = useState('idle');        // idle | acquiring | success | error
  const [error, setError] = useState(null);            // string message

  const watchIdRef = useRef(null);
  const readingsRef = useRef([]);
  const timeoutRef = useRef(null);
  const resolvedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const selectBestReading = useCallback(() => {
    const readings = readingsRef.current;
    if (readings.length === 0) return null;

    // Sort by accuracy (lower = better)
    const sorted = [...readings].sort((a, b) => a.accuracy - b.accuracy);
    return sorted[0];
  }, []);

  const finalizeLocation = useCallback(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    cleanup();

    const best = selectBestReading();
    if (best) {
      setLocation({ lat: best.lat, lng: best.lng });
      setAccuracy(best.accuracy);
      setTimestamp(best.timestamp);
      setStatus('success');
      setError(null);
    } else {
      setStatus('error');
      setError('Could not obtain a GPS reading. Please try again or search for your address manually.');
    }
  }, [cleanup, selectBestReading]);

  const requestLocation = useCallback(() => {
    // Reset state
    setStatus('acquiring');
    setError(null);
    setLocation(null);
    setAccuracy(null);
    setTimestamp(null);
    readingsRef.current = [];
    resolvedRef.current = false;
    cleanup();

    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by your browser. Please search for your address manually.');
      return;
    }

    // Collect readings for up to 4 seconds, then pick the best one
    const MAX_COLLECTION_TIME = 4000;
    const MAX_READINGS = 5;
    const GOOD_ACCURACY_THRESHOLD = 20; // meters — if we get ≤20m, accept immediately

    const handlePosition = (position) => {
      if (resolvedRef.current) return;

      const reading = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      readingsRef.current.push(reading);

      // If we got a very good reading, accept immediately
      if (reading.accuracy <= GOOD_ACCURACY_THRESHOLD) {
        finalizeLocation();
        return;
      }

      // If we've collected enough readings, finalize
      if (readingsRef.current.length >= MAX_READINGS) {
        finalizeLocation();
      }
    };

    const handleError = (err) => {
      if (resolvedRef.current) return;

      // If we already have some readings, use the best one
      if (readingsRef.current.length > 0) {
        finalizeLocation();
        return;
      }

      resolvedRef.current = true;
      cleanup();

      let message = 'Could not fetch your location.';
      switch (err.code) {
        case 1: // PERMISSION_DENIED
          message = 'Location permission denied. Please enable location access in your browser settings, or search for your address manually.';
          break;
        case 2: // POSITION_UNAVAILABLE
          message = 'Location information is unavailable. Please search for your address or place the pin on the map manually.';
          break;
        case 3: // TIMEOUT
          message = 'Location request timed out. Please try again or search for your address manually.';
          break;
      }

      setStatus('error');
      setError(message);
    };

    // Use watchPosition for multiple readings
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );

    // Safety timeout: after MAX_COLLECTION_TIME, finalize with whatever we have
    timeoutRef.current = setTimeout(() => {
      if (!resolvedRef.current) {
        finalizeLocation();
      }
    }, MAX_COLLECTION_TIME);
  }, [cleanup, finalizeLocation]);

  const reset = useCallback(() => {
    cleanup();
    setLocation(null);
    setAccuracy(null);
    setTimestamp(null);
    setStatus('idle');
    setError(null);
    readingsRef.current = [];
    resolvedRef.current = false;
  }, [cleanup]);

  /**
   * Returns accuracy level label and color info
   */
  const getAccuracyLevel = useCallback(() => {
    if (accuracy === null) return null;
    if (accuracy <= 20) return { level: 'high', label: 'High accuracy', color: 'emerald', icon: '✅', meters: Math.round(accuracy) };
    if (accuracy <= 50) return { level: 'moderate', label: 'Moderate accuracy', color: 'amber', icon: '⚠️', meters: Math.round(accuracy) };
    return { level: 'low', label: 'Low accuracy', color: 'rose', icon: '⚠️', meters: Math.round(accuracy) };
  }, [accuracy]);

  return {
    requestLocation,
    location,
    accuracy,
    timestamp,
    status,
    error,
    reset,
    getAccuracyLevel
  };
}
