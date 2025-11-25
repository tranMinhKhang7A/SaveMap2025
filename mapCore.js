// ================== KHỞI TẠO BẢN ĐỒ VÀ XỬ LÝ VỊ TRÍ NGƯỜI DÙNG ==================
let userLocation = null;
var map;

function khoiTaoBanDo() {
        map = L.map('map').setView([21.0285, 105.8542], 13); // Hà Nội làm trung tâm ban đầu
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map); // Thêm lớp bản đồ từ OpenStreetMap
        map.locate({ setView: true, maxZoom: 16 });
        return map;
}

function xuLyLocationFound(e) {
  userLocation = e.latlng;
  L.marker(e.latlng).addTo(map).bindPopup("📍 Bạn đang ở đây!").openPopup();
  hienThiThoiTiet(e.latlng.lat, e.latlng.lng);
}

function xuLyLocationError(e) {
  console.warn("⚠️ Không thể lấy vị trí:", e.message);
}

// ================== TẢI DỮ LIỆU BAN ĐẦU TỪ SERVER ==================
function taiDuLieuBanDau() {
    fetch(apiURL)
      .then(res => res.json())
      .then(data => {
        data.forEach(item => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lng);
          if (!isNaN(lat) && !isNaN(lng)) {
            taoMarker(lat, lng, item.loai, item.uuid);
          }
        });
      })
      .catch(err => console.error("Lỗi tải dữ liệu:", err));
}

// ================== THÊM THÔNG TIN THỜI TIẾT ======================
const weatherAPI = "https://api.open-meteo.com/v1/forecast";
function hienThiThoiTiet(lat, lng) {
  fetch(`${weatherAPI}?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weathercode,windspeed_10m`)
    .then(res => res.json())
    .then(data => {
      const w = data.current;
      const html = `
        <b>🌤️ Thời tiết hiện tại</b><br>
        🌡️ Nhiệt độ: ${w.temperature_2m}°C<br>
        💧 Mưa: ${w.precipitation} mm<br>
        🌬️ Gió: ${w.windspeed_10m} km/h
      `;
      L.control.weather = L.control({ position: 'topright' });
      L.control.weather.onAdd = function() {
        const div = L.DomUtil.create('div', 'weather-info');
        div.style.background = 'rgba(255,255,255,0.9)';
        div.style.padding = '6px';
        div.style.borderRadius = '8px';
        div.style.fontSize = '14px';
        div.innerHTML = html;
        return div;
      };
      L.control.weather.addTo(map);
    })
    .catch(err => console.error("Lỗi lấy thời tiết:", err));
}


