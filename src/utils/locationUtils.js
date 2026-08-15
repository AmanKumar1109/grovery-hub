import { loadGoogleMaps } from './googleMapsLoader';

// Exact Baharagora Store Location (Dadu Complex, near Shitla Mandir, Baharagora, Jharkhand 832101)
export const BAHARAGORA_HUB = {
  lat: 22.2760625,
  lng: 86.7193125,
  name: 'THE GROCERY HUB',
  address: 'Dadu Complex, near Shitla Mandir, Baharagora, Jharkhand 832101',
  pincode: '832101'
};

// Maximum Allowed Delivery Radius Limit (in Kilometers)
export const MAX_DELIVERY_RADIUS_KM = 7.0;

/**
 * Calculates Haversine distance in kilometers between two coordinates
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100;
}

/**
 * Checks if a customer location is within the 7 km Baharagora delivery zone
 */
export function checkDeliveryServiceable(lat, lng) {
  if (!lat || !lng) {
    return {
      isServiceable: true,
      distanceKm: 0,
      radiusLimitKm: MAX_DELIVERY_RADIUS_KM,
      diffKm: 0
    };
  }

  const distanceKm = calculateDistance(BAHARAGORA_HUB.lat, BAHARAGORA_HUB.lng, lat, lng);
  const isServiceable = distanceKm <= MAX_DELIVERY_RADIUS_KM;

  return {
    isServiceable,
    distanceKm,
    radiusLimitKm: MAX_DELIVERY_RADIUS_KM,
    diffKm: Math.round((distanceKm - MAX_DELIVERY_RADIUS_KM) * 100) / 100
  };
}

/**
 * Calculates Estimated Time of Arrival (ETA)
 */
export function calculateETA(distanceKm, averageSpeedKmH = 25) {
  if (!distanceKm || distanceKm <= 0) return '5-10 mins';
  const hours = distanceKm / averageSpeedKmH;
  const minutes = Math.max(3, Math.ceil(hours * 60) + 4);
  return `~${minutes} mins`;
}

/**
 * Resolves coordinates for customer addresses using Google Maps Geocoder if exact lat/lng is missing.
 */
export async function resolveOrderCoordinates(order) {
  if (!order) return { lat: BAHARAGORA_HUB.lat, lng: BAHARAGORA_HUB.lng };

  // 1. If order already has direct exact lat/lng (From "Use Current Location")
  if (order.lat && order.lng) {
    return { lat: parseFloat(order.lat), lng: parseFloat(order.lng) };
  }
  if (order.customerCoords && order.customerCoords.lat && order.customerCoords.lng) {
    return { lat: parseFloat(order.customerCoords.lat), lng: parseFloat(order.customerCoords.lng) };
  }

  // 2. Geocode the address text using Google Maps
  const addressString = order.address || order.customerAddress || order.deliveryAddress || 'Baharagora, Jharkhand';
  
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();
    
    return new Promise((resolve) => {
      geocoder.geocode({ address: addressString }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          console.warn(`Geocode failed for address: ${addressString}. Status: ${status}`);
          // Fallback to Baharagora Hub if geocoding completely fails
          resolve({ lat: BAHARAGORA_HUB.lat, lng: BAHARAGORA_HUB.lng });
        }
      });
    });
  } catch (err) {
    console.error("Error loading Google Maps for Geocoding:", err);
    return { lat: BAHARAGORA_HUB.lat, lng: BAHARAGORA_HUB.lng };
  }
}

export function getInitialRiderCoordinates(customerLat, customerLng) {
  const storeLat = BAHARAGORA_HUB.lat;
  const storeLng = BAHARAGORA_HUB.lng;

  return {
    lat: Math.round(((storeLat + customerLat) / 2) * 10000) / 10000,
    lng: Math.round(((storeLng + customerLng) / 2) * 10000) / 10000
  };
}

/**
 * Checks if a typed/selected customer address is serviceable within 7 km of Baharagora
 */
export function checkAddressServiceability(addressObj) {
  if (!addressObj) {
    return { isServiceable: true, distanceKm: 0, reason: '' };
  }

  const addrStr = typeof addressObj === 'string'
    ? addressObj
    : `${addressObj.street || ''} ${addressObj.locality || ''} ${addressObj.city || ''} ${addressObj.state || ''} ${addressObj.pincode || ''}`;
  
  const text = addrStr.toLowerCase();

  // Known out-of-radius towns & cities with accurate distances from Baharagora Store
  const unserviceableTowns = [
    { name: 'Bistupur', distance: 110 },
    { name: 'Jamshedpur', distance: 105 },
    { name: 'Tatanagar', distance: 108 },
    { name: 'Sakchi', distance: 108 },
    { name: 'Kadma', distance: 112 },
    { name: 'Sonari', distance: 114 },
    { name: 'Telco', distance: 102 },
    { name: 'Adityapur', distance: 115 },
    { name: 'Mango', distance: 110 },
    { name: 'Ghatshila', distance: 45 },
    { name: 'Kharagpur', distance: 55 },
    { name: 'Ranchi', distance: 190 },
    { name: 'Baripada', distance: 60 },
    { name: 'Dhalbhumgarh', distance: 22 },
    { name: 'Chakulia', distance: 28 }
  ];

  for (const town of unserviceableTowns) {
    if (text.includes(town.name.toLowerCase())) {
      return {
        isServiceable: false,
        distanceKm: town.distance,
        townName: town.name,
        reason: `🚫 Delivery Unavailable: "${town.name}" is approx ${town.distance} km away from Baharagora Store. We strictly deliver ONLY within a 7 km radius of Baharagora Hub!`
      };
    }
  }

  // Pincode validation: Baharagora local store pincode is 832101
  const pincode = String(addressObj.pincode || '').trim();
  if (pincode && pincode.length === 6) {
    if (pincode.startsWith('831') || pincode.startsWith('834') || pincode.startsWith('721') || pincode.startsWith('757')) {
      return {
        isServiceable: false,
        distanceKm: 110,
        townName: addressObj.city || 'Out of Town',
        reason: `🚫 Delivery Unavailable: Pincode ${pincode} is out of our 7 km delivery radius around Baharagora (832101)!`
      };
    }
  }

  // If we have real coordinates (from Use Current Location), do a precise distance check
  if (addressObj.lat && addressObj.lng) {
    const distanceKm = calculateDistance(BAHARAGORA_HUB.lat, BAHARAGORA_HUB.lng, addressObj.lat, addressObj.lng);
    const isServiceable = distanceKm <= MAX_DELIVERY_RADIUS_KM;
    return {
      isServiceable,
      distanceKm,
      townName: addressObj.city || 'Local Area',
      reason: isServiceable
        ? ''
        : `🚫 Delivery Unavailable: Address is ${distanceKm} km away from Baharagora Store (Exceeds 5.0 km limit)!`
    };
  }

  // If no exact coordinates but passed the string/pincode checks, assume serviceable
  return {
    isServiceable: true,
    distanceKm: 0,
    townName: addressObj.city || 'Local Area',
    reason: ''
  };
}
