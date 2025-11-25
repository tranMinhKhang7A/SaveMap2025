// ================== 🚗 TÌM ĐƯỜNG AN TOÀN ==================
let currentRoute = null;
function timDuongAnToan(latB, lngB) {
  if (!userLocation) {
    alert("⚠️ Chưa xác định được vị trí của bạn!");
    return;
  }

  const start = L.latLng(userLocation.lat, userLocation.lng);
  const end = L.latLng(latB, lngB);

  const blocked = allMarkers
    .filter(m => m.loai === "ngap" || m.loai === "tacduong")
    .map(m => m.marker.getLatLng());

  if (currentRoute) {
    map.removeControl(currentRoute);
    currentRoute = null;
  }

  currentRoute = L.Routing.control({
    waypoints: [start, end],
    routeWhileDragging: false,
    lineOptions: { styles: [{ color: "#007bff", weight: 6, opacity: 0.8 }] },
    createMarker: () => null,
    router: L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1",
      profile: "driving"
    })
  })
  .on('routesfound', function(e) {
    const route = e.routes[0];
    const distance = (route.summary.totalDistance / 1000).toFixed(2);
    const time = Math.round(route.summary.totalTime / 60);
    const coords = route.coordinates.map(c => [c.lat, c.lng]);

    const intersects = blocked.some(b =>
      route.coordinates.some(c => map.distance(c, b) < 100)
    );

    if (intersects) alert("⚠️ Tuyến đường này có thể đi qua khu vực ngập hoặc tắc đường!");

    // Hiển thị popup thông tin
    L.popup()
      .setLatLng(end)
      .setContent(`🛣️ Quãng đường an toàn: ${distance} km<br>⏱️ Thời gian: ~${time} phút`)
      .openOn(map);

    //  Gửi dữ liệu tuyến đường lên Google Apps Script
    /*
    fetch(apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveRoute",
        start: { lat: start.lat, lng: start.lng },
        end: { lat: end.lat, lng: end.lng },
        distance,
        time,
        path: coords
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "ok") {
        console.log("✅ Đã lưu tuyến đường vào Google Sheet!");
      } else {
        console.warn("⚠️ Lưu tuyến đường thất bại:", data.message);
      }
    })
    .catch(err => console.error("❌ Lỗi khi gửi tuyến đường:", err));
    */
  })
  .addTo(map);
}