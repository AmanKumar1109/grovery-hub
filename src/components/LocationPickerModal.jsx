import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Search,
  Navigation,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building,
  Home,
  FileText,
  Compass,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { BAHARAGORA_HUB, MAX_DELIVERY_RADIUS_KM, checkDeliveryServiceable } from '../utils/locationUtils';
import useSmartLocation from '../hooks/useSmartLocation';

export default function LocationPickerModal({ isOpen, onClose, onConfirm, initialLocation }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const geocoderRef = useRef(null);

  const {
    requestLocation,
    location: gpsLocation,
    accuracy: gpsAccuracy,
    status: gpsStatus,
    error: gpsError,
    getAccuracyLevel
  } = useSmartLocation();

  // Selected Pin Coordinates & Accuracy
  const [coords, setCoords] = useState(
    initialLocation?.lat && initialLocation?.lng
      ? { lat: parseFloat(initialLocation.lat), lng: parseFloat(initialLocation.lng) }
      : { lat: BAHARAGORA_HUB.lat, lng: BAHARAGORA_HUB.lng }
  );
  const [currentAccuracy, setCurrentAccuracy] = useState(initialLocation?.accuracy || null);
  const [addressSource, setAddressSource] = useState(initialLocation?.addressSource || 'manual');

  // Address & Geocoding State
  const [formattedAddress, setFormattedAddress] = useState(initialLocation?.formattedAddress || '');
  const [placeId, setPlaceId] = useState(initialLocation?.placeId || '');
  const [city, setCity] = useState(initialLocation?.city || 'Baharagora');
  const [state, setState] = useState(initialLocation?.state || 'Jharkhand');
  const [postalCode, setPostalCode] = useState(initialLocation?.pincode || initialLocation?.postalCode || '832101');
  const [country, setCountry] = useState(initialLocation?.country || 'India');

  // Structured Address Details State
  const [addressDetails, setAddressDetails] = useState({
    houseNumber: initialLocation?.houseNumber || '',
    building: initialLocation?.building || '',
    floor: initialLocation?.floor || '',
    street: initialLocation?.street || '',
    landmark: initialLocation?.landmark || '',
    deliveryInstructions: initialLocation?.deliveryInstructions || ''
  });

  // Autocomplete Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const searchDebounceRef = useRef(null);

  // Serviceability Status
  const serviceability = checkDeliveryServiceable(coords.lat, coords.lng);
  const accuracyInfo = getAccuracyLevel();

  // Load Google Maps JS SDK Services (Places & Geocoder)
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    loadGoogleMaps().then(maps => {
      if (!active) return;
      if (!autocompleteServiceRef.current && maps.places) {
        autocompleteServiceRef.current = new maps.places.AutocompleteService();
      }
      if (!geocoderRef.current) {
        geocoderRef.current = new maps.Geocoder();
      }
    }).catch(err => {
      console.warn("Google Maps Services not loaded:", err.message);
    });
    return () => { active = false; };
  }, [isOpen]);

  // Update pin position when GPS location succeeds
  useEffect(() => {
    if (gpsStatus === 'success' && gpsLocation) {
      setCoords(gpsLocation);
      setCurrentAccuracy(gpsAccuracy);
      setAddressSource('gps');
      reverseGeocode(gpsLocation.lat, gpsLocation.lng);
    }
  }, [gpsStatus, gpsLocation, gpsAccuracy]);

  // Reverse Geocode (lat, lng) -> Address
  const reverseGeocode = useCallback((lat, lng) => {
    if (!geocoderRef.current) return;
    setIsGeocoding(true);

    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      setIsGeocoding(false);
      if (status === 'OK' && results[0]) {
        const first = results[0];
        setFormattedAddress(first.formatted_address);
        setPlaceId(first.place_id || '');

        let parsedCity = '';
        let parsedState = 'Jharkhand';
        let parsedPincode = '';
        let parsedCountry = 'India';
        let streetParts = [];

        first.address_components.forEach(comp => {
          const types = comp.types;
          if (types.includes('locality')) parsedCity = comp.long_name;
          else if (types.includes('administrative_area_level_1')) parsedState = comp.long_name;
          else if (types.includes('postal_code')) parsedPincode = comp.long_name;
          else if (types.includes('country')) parsedCountry = comp.long_name;

          if (types.includes('route') || types.includes('street_number') || types.includes('premise')) {
            streetParts.push(comp.long_name);
          }
        });

        if (parsedCity) setCity(parsedCity);
        if (parsedState) setState(parsedState);
        if (parsedPincode) setPostalCode(parsedPincode);
        if (parsedCountry) setCountry(parsedCountry);

        if (streetParts.length > 0) {
          setAddressDetails(prev => ({
            ...prev,
            street: prev.street || streetParts.join(', ')
          }));
        }
      }
    });
  }, []);

  // Initialize Leaflet Map with Draggable Marker
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Remove existing instance if present
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 16,
      zoomControl: true
    });
    mapInstanceRef.current = map;

    // Google Maps Standard Roadmap Tiles
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    }).addTo(map);

    // 5 KM Geofence Circle around Hub
    const isServiceable = serviceability.isServiceable;
    L.circle([BAHARAGORA_HUB.lat, BAHARAGORA_HUB.lng], {
      radius: MAX_DELIVERY_RADIUS_KM * 1000,
      color: isServiceable ? '#10b981' : '#f43f5e',
      fillColor: isServiceable ? '#10b981' : '#f43f5e',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(map);

    // Store Hub Marker Icon
    const storeIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="background: #059669; border: 3px solid white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    L.marker([BAHARAGORA_HUB.lat, BAHARAGORA_HUB.lng], { icon: storeIcon })
      .addTo(map)
      .bindPopup(`<strong style="color: #059669;">🏪 THE GROCERY HUB</strong><br/><span style="font-size: 11px;">Baharagora Store</span>`);

    // Customer Delivery Pin Icon (DRAGGABLE)
    const pinColor = isServiceable ? '#2563eb' : '#e11d48';
    const customerPinIcon = L.divIcon({
      className: 'custom-leaflet-marker draggable-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background: ${pinColor}; border: 3px solid white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.35); cursor: grab;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div style="background: rgba(15, 23, 42, 0.9); color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 800; margin-top: 4px; border: 1px solid rgba(255,255,255,0.3); white-space: nowrap;">
            🎯 Drag to Exact Entrance
          </div>
        </div>
      `,
      iconSize: [44, 60],
      iconAnchor: [22, 22]
    });

    const marker = L.marker([coords.lat, coords.lng], {
      icon: customerPinIcon,
      draggable: true
    }).addTo(map);

    markerRef.current = marker;

    // Drag end listener — update coordinates & reverse geocode
    marker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      const newLat = Math.round(newPos.lat * 1000000) / 1000000;
      const newLng = Math.round(newPos.lng * 1000000) / 1000000;
      setCoords({ lat: newLat, lng: newLng });
      setCurrentAccuracy(null);
      setAddressSource('manual_pin');
      reverseGeocode(newLat, newLng);
    });

    // Invalidate map size after animation
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Sync marker position when coords state changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
      mapInstanceRef.current.panTo([coords.lat, coords.lng]);
    }
  }, [coords]);

  // Handle Autocomplete Search Query Input (Debounced)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!val.trim() || val.length < 3) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(() => {
      if (autocompleteServiceRef.current) {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: val,
            componentRestrictions: { country: 'in' }
          },
          (results, status) => {
            setIsSearching(false);
            if (status === 'OK' && results) {
              setPredictions(results);
            } else {
              setPredictions([]);
            }
          }
        );
      } else {
        setIsSearching(false);
      }
    }, 300);
  };

  // Select a Google Place Prediction
  const handleSelectPrediction = (prediction) => {
    setSearchQuery(prediction.description);
    setPredictions([]);

    if (geocoderRef.current) {
      geocoderRef.current.geocode({ placeId: prediction.place_id }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          const newLat = loc.lat();
          const newLng = loc.lng();
          setCoords({ lat: newLat, lng: newLng });
          setPlaceId(prediction.place_id);
          setFormattedAddress(results[0].formatted_address);
          setAddressSource('places');
          setCurrentAccuracy(null);
          reverseGeocode(newLat, newLng);
        }
      });
    }
  };

  // Handle Details Input Change
  const handleDetailsChange = (e) => {
    setAddressDetails({ ...addressDetails, [e.target.name]: e.target.value });
  };

  // Confirm Final Location & Send to Parent
  const handleConfirmLocation = () => {
    const streetCombined = [
      addressDetails.houseNumber,
      addressDetails.building,
      addressDetails.floor ? `Floor ${addressDetails.floor}` : '',
      addressDetails.street
    ].filter(Boolean).join(', ') || formattedAddress.split(',')[0] || 'Delivery Location';

    const confirmedData = {
      lat: coords.lat,
      lng: coords.lng,
      street: streetCombined,
      locality: addressDetails.landmark ? `Near ${addressDetails.landmark}` : '',
      city: city || 'Baharagora',
      state: state || 'Jharkhand',
      pincode: postalCode || '832101',
      formattedAddress: formattedAddress,
      location: {
        latitude: coords.lat,
        longitude: coords.lng,
        accuracy: currentAccuracy,
        placeId: placeId,
        formattedAddress: formattedAddress,
        city: city,
        state: state,
        postalCode: postalCode,
        country: country,
        addressSource: addressSource,
        confirmedByUser: true,
        confirmedAt: new Date().toISOString()
      },
      addressDetails: { ...addressDetails }
    };

    onConfirm(confirmedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">Select Exact Delivery Point</h2>
              <p className="text-xs text-slate-400">Pinpoint your entrance for fastest delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">

          {/* Search Bar + Current Location Row */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search area, apartment, landmark or place..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Google Places Suggestions List */}
            {predictions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden max-h-48 overflow-y-auto z-10 space-y-0 divide-y divide-slate-100">
                {predictions.map((p) => (
                  <div
                    key={p.place_id}
                    onClick={() => handleSelectPrediction(p)}
                    className="p-3 hover:bg-amber-50 cursor-pointer flex items-start gap-2.5 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{p.structured_formatting?.main_text || p.description}</p>
                      <p className="text-[11px] font-medium text-slate-500 line-clamp-1">{p.structured_formatting?.secondary_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* "Use My Current Location" Button */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={requestLocation}
                disabled={gpsStatus === 'acquiring'}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Navigation className={`w-4 h-4 ${gpsStatus === 'acquiring' ? 'animate-spin' : ''}`} />
                <span>{gpsStatus === 'acquiring' ? 'Acquiring High-Accuracy GPS...' : 'Use My Current Location'}</span>
              </button>
            </div>

            {/* GPS Error Alert */}
            {gpsStatus === 'error' && gpsError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* Interactive Map Area */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-950">
            <div
              ref={mapContainerRef}
              style={{ width: '100%', height: '240px', minHeight: '240px', zIndex: 1 }}
              className="w-full h-full"
            />

            {/* Live 5 KM Serviceability Badge Overlay on Map */}
            <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-2 pointer-events-none">
              {serviceability.isServiceable ? (
                <div className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                  <span>🟢 Delivery Available ({serviceability.distanceKm} km)</span>
                </div>
              ) : (
                <div className="bg-rose-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md">
                  <AlertTriangle className="w-4 h-4" />
                  <span>🔴 Outside 5 KM Radius Zone ({serviceability.distanceKm} km)</span>
                </div>
              )}

              {/* Accuracy Badge */}
              {accuracyInfo && (
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-black backdrop-blur-md shadow-md border ${
                  accuracyInfo.level === 'high'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : accuracyInfo.level === 'moderate'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                }`}>
                  {accuracyInfo.icon} {accuracyInfo.label} (±{accuracyInfo.meters}m)
                </div>
              )}
            </div>

            {/* Pin Drag Helper Banner */}
            <div className="absolute bottom-2 left-3 right-3 z-[1000] bg-slate-900/80 backdrop-blur-xs text-slate-300 px-3 py-1.5 rounded-xl text-[11px] font-bold text-center pointer-events-none">
              📍 Touch & hold the marker to drag it right onto your building entrance
            </div>
          </div>

          {/* Formatted Address Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <span>Detected Address</span>
              {isGeocoding && <span className="text-amber-600 font-bold animate-pulse">Updating...</span>}
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
              {formattedAddress || 'Move map pin to detect address...'}
            </p>
          </div>

          {/* Structured Address Details Form */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-amber-500" />
              Complete Entrance Details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">House / Flat No.</label>
                <input
                  type="text"
                  name="houseNumber"
                  value={addressDetails.houseNumber}
                  onChange={handleDetailsChange}
                  placeholder="e.g. Flat 302, House 24"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">Building / Apartment</label>
                <input
                  type="text"
                  name="building"
                  value={addressDetails.building}
                  onChange={handleDetailsChange}
                  placeholder="e.g. Green Residency"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">Floor (Optional)</label>
                <input
                  type="text"
                  name="floor"
                  value={addressDetails.floor}
                  onChange={handleDetailsChange}
                  placeholder="e.g. 2nd Floor"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={addressDetails.landmark}
                  onChange={handleDetailsChange}
                  placeholder="e.g. Near XYZ School"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1">Delivery Instructions (Optional)</label>
              <input
                type="text"
                name="deliveryInstructions"
                value={addressDetails.deliveryInstructions}
                onChange={handleDetailsChange}
                placeholder="e.g. Call when you reach gate, leave at door"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

        </div>

        {/* Footer Confirm Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-bold hidden sm:block">
            📍 Coordinates: <span className="text-slate-900 font-mono">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
          </div>

          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={!serviceability.isServiceable}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
              serviceability.isServiceable
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-300/40'
                : 'bg-rose-100 text-rose-700 border-2 border-rose-300 opacity-80 cursor-not-allowed'
            }`}
          >
            <span>
              {serviceability.isServiceable
                ? 'Confirm This Delivery Location'
                : '🚫 Delivery Unavailable (Out of 5 KM Zone)'}
            </span>
            {serviceability.isServiceable && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
          </button>
        </div>

      </div>
    </div>
  );
}
