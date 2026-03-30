export function getLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000 }
    )
  })
}

export function formatCoordinate(lat, lng) {
  if (lat == null || lng == null) return '未知位置'
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}
