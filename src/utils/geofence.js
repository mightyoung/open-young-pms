/**
 * Geofencing utility for GPS-based location tracking
 */
export function isInsideGeofence(lat, lng, center, radiusMeters) {
  const R = 6371000
  const dLat = ((center.lat - lat) * Math.PI) / 180
  const dLng = ((center.lng - lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((center.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c <= radiusMeters
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

export function watchPosition(callback, onError) {
  if (!navigator.geolocation) {
    onError(new Error('浏览器不支持定位'))
    return null
  }
  return navigator.geolocation.watchPosition(
    pos =>
      callback({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
    onError,
    { enableHighAccuracy: true }
  )
}

export const DEFAULT_GEOFENCES = [
  { id: 'zone-a', name: 'A区生产车间', center: { lat: 30.5728, lng: 104.0668 }, radius: 200 },
  { id: 'zone-b', name: 'B区施工现场', center: { lat: 30.5738, lng: 104.0678 }, radius: 150 },
  { id: 'zone-c', name: 'C区仓储区', center: { lat: 30.5718, lng: 104.0658 }, radius: 180 },
]
