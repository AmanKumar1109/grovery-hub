import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  BAHARAGORA_HUB,
  MAX_DELIVERY_RADIUS_KM,
  calculateDistance,
  checkDeliveryServiceable,
  calculateETA,
  resolveOrderCoordinates,
  getInitialRiderCoordinates
} from '../utils/locationUtils';
import { fetchRoadRoute, routePointsToLatLngs } from '../utils/routeService';
import { Navigation, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function OrderLiveMap({ order }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  const [customerCoords, setCustomerCoords] = useState(null);
  const [initialRiderCoords, setInitialRiderCoords] = useState(null);
  const [serviceCheck, setServiceCheck] = useState(null);

  const [riderPos, setRiderPos] = useState(null);
  const [roadDistance, setRoadDistance] = useState(null);
  const [roadDuration, setRoadDuration] = useState(null);

  // 1. Resolve coordinates asynchronously on mount
  useEffect(() => {
    let active = true;
    resolveOrderCoordinates(order).then(coords => {
      if (!active) return;
      setCustomerCoords(coords);
      setServiceCheck(checkDeliveryServiceable(coords.lat, coords.lng));
      
      const initialRider = order?.riderLocation && order.riderLocation.lat
        ? { lat: order.riderLocation.lat, lng: order.riderLocation.lng }
        : getInitialRiderCoordinates(coords.lat, coords.lng);
        
      setInitialRiderCoords(initialRider);
      setRiderPos(initialRider);
    });
    return () => { active = false; };
  }, [order]);

  // Sync live rider location when order.riderLocation updates in Firestore
  useEffect(() => {
    if (order?.riderLocation && order.riderLocation.lat && order.riderLocation.lng) {
      const livePos = { lat: order.riderLocation.lat, lng: order.riderLocation.lng };
      setRiderPos(livePos);

      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng([livePos.lat, livePos.lng]);
      }
    }
  }, [order?.riderLocation]);

  const distanceToCustomer = riderPos && customerCoords ? calculateDistance(
    riderPos.lat,
    riderPos.lng,
    customerCoords.lat,
    customerCoords.lng
  ) : 0;

  const currentETA = roadDuration ? `~${roadDuration} mins` : calculateETA(distanceToCustomer);
  const displayDistance = roadDistance || distanceToCustomer;

  useEffect(() => {
    if (!mapContainerRef.current || !customerCoords || !initialRiderCoords) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const centerLat = (BAHARAGORA_HUB.lat + customerCoords.lat) / 2;
    const centerLng = (BAHARAGORA_HUB.lng + customerCoords.lng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: false
    });

    mapInstanceRef.current = map;

    // Switch to Google Maps Standard Roadmap tiles for highly detailed local names
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    }).addTo(map);

    // 5 KM Geofence Ring
    L.circle([BAHARAGORA_HUB.lat, BAHARAGORA_HUB.lng], {
      radius: MAX_DELIVERY_RADIUS_KM * 1000,
      color: serviceCheck.isServiceable ? '#10b981' : '#f43f5e',
      fillColor: serviceCheck.isServiceable ? '#10b981' : '#f43f5e',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(map);

    const createIcon = (svg, color) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${color};
            border: 3px solid white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">
            ${svg}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
    };

    const storeIcon = createIcon(
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`,
      '#059669'
    );

    const riderIcon = createIcon(
      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.5a2.5 2.5 0 0 0-2.5-2.5H14"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
      '#f59e0b'
    );

    const customerIcon = createIcon(
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
      serviceCheck.isServiceable ? '#2563eb' : '#e11d48'
    );

    // Store Marker
    L.marker([BAHARAGORA_HUB.lat, BAHARAGORA_HUB.lng], { icon: storeIcon }).addTo(map);

    // Customer Marker
    L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon }).addTo(map);

    // Rider Marker
    const riderMarker = L.marker([initialRiderCoords.lat, initialRiderCoords.lng], { icon: riderIcon }).addTo(map);
    riderMarkerRef.current = riderMarker;

    // Draw initial straight line as placeholder while road route loads
    const initialPolyline = L.polyline(
      [
        [BAHARAGORA_HUB.lat, BAHARAGORA_HUB.lng],
        [initialRiderCoords.lat, initialRiderCoords.lng],
        [customerCoords.lat, customerCoords.lng]
      ],
      {
        color: '#059669',
        weight: 5,
        opacity: 0.7,
        dashArray: '8, 8'
      }
    ).addTo(map);
    routePolylineRef.current = initialPolyline;

    // Fetch real road route from Google Maps Directions API
    fetchRoadRoute(
      { lat: BAHARAGORA_HUB.lat, lng: BAHARAGORA_HUB.lng },
      { lat: customerCoords.lat, lng: customerCoords.lng },
      [{ lat: initialRiderCoords.lat, lng: initialRiderCoords.lng }]
    ).then(result => {
      if (!mapInstanceRef.current) return;

      // Remove the placeholder straight line
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
      }

      const latLngs = routePointsToLatLngs(result.points);

      // Draw the real road route
      const roadPolyline = L.polyline(latLngs, {
        color: '#059669',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(mapInstanceRef.current);

      routePolylineRef.current = roadPolyline;

      if (result.success) {
        setRoadDistance(result.totalDistanceKm);
        setRoadDuration(result.totalDurationMins);
      }

      // Fit bounds to the route
      if (latLngs.length > 0) {
        const routeBounds = L.latLngBounds(latLngs);
        mapInstanceRef.current.fitBounds(routeBounds, { padding: [35, 35] });
      }
    });

    const bounds = L.latLngBounds([
      [BAHARAGORA_HUB.lat, BAHARAGORA_HUB.lng],
      [customerCoords.lat, customerCoords.lng],
      [initialRiderCoords.lat, initialRiderCoords.lng]
    ]);
    map.fitBounds(bounds, { padding: [35, 35] });

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order?.id, customerCoords]); // Re-run if coordinates change

  if (!customerCoords || !riderPos || !serviceCheck) {
    return (
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 flex flex-col items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        <p className="text-slate-400 text-xs mt-3 font-bold animate-pulse">Locating exact address...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 flex flex-col space-y-0">
      {/* Dynamic HUD Bar */}
      <div className="p-3.5 bg-slate-950 text-white flex items-center justify-between gap-2 border-b border-slate-800 text-xs font-bold">
        <div className="flex items-center gap-1.5 text-amber-400">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{currentETA}</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400">
          <Navigation className="w-3.5 h-3.5 shrink-0" />
          <span>{displayDistance} km away</span>
        </div>

        {serviceCheck.isServiceable ? (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> 5km Zone
          </span>
        ) : (
          <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Out of Zone
          </span>
        )}
      </div>

      {/* Map Body Container */}
      <div className="relative w-full h-56 bg-slate-950">
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '224px', minHeight: '224px', zIndex: 1 }}
          className="w-full h-full"
        />

        {!serviceCheck.isServiceable && (
          <div className="absolute top-2 left-2 right-2 z-[1000] bg-rose-600/90 backdrop-blur-xs text-white p-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 text-center">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Exceeds 5km Baharagora radius limit ({serviceCheck.distanceKm} km)</span>
          </div>
        )}
      </div>
    </div>
  );
}
