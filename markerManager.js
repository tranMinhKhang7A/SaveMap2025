// ================== KHỞI TẠO TOÀN CỤC ==================
var loai = 'antoan';
var apiURL = "https://billowing-sea-9e3a.agribarniot.workers.dev/https://script.google.com/macros/s/AKfycbzFeesLV0wX1lIDi1iT7SwWp7DhXLwcWstueOiorJvjPZYPt84E5bmKXvrR2OHksdU/exec";
const allMarkers = [];
const markerMap = new Map();

// ================== HÀM CHỌN LOẠI MARKER ==================
function chonLoai(l) {
      loai = l;
      const text = l === 'ngap' ? '🚫 Đường ngập' :
                   l === 'antoan' ? '✅ Điểm an toàn' :
                   l === 'cuuho' ? '🆘 Cần cứu hộ' :
                   '🛑🚗 Tắc đường';
      document.getElementById('status').textContent = '🟢 Loại hiện tại: ' + text;
}

// ================== HÀM TẠO MARKER ==================
function taoMarker(lat, lng, loai, uuid = null) {
      if (uuid && markerMap.has(uuid)) {
        const oldMarker = markerMap.get(uuid);
        if (map.hasLayer(oldMarker)) map.removeLayer(oldMarker);
        markerMap.delete(uuid);
      }

      let iconUrl, text;
      if (loai === 'ngap') {
        iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26d4.svg";
        text = "🚫 Ngập";
      } else if (loai === 'antoan') {
        iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg";
        text = "✅ An toàn";
      } else if (loai === 'cuuho') {
        iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f198.svg";
        text = "🆘 Cứu hộ";
      } else if (loai === 'tacduong') {
        iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a7.svg";
        text = "🛑🚗 Tắc đường";
      } else {
        iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2753.svg";
        text = "❓ Không rõ";
      }

      const icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.uuid = uuid;

      let popup = `<b>${text}</b><br><i>${lat.toFixed(5)}, ${lng.toFixed(5)}</i>`;
      if (uuid) {
        popup += `
          <br><label>Thay đổi loại:</label>
          <select id="newType_${uuid}">
            <option value="ngap" ${loai === "ngap" ? "selected" : ""}>🚫 Ngập</option>
            <option value="antoan" ${loai === "antoan" ? "selected" : ""}>✅ An toàn</option>
            <option value="cuuho" ${loai === "cuuho" ? "selected" : ""}>🆘 Cứu hộ</option>
            <option value="tacduong" ${loai === "tacduong" ? "selected" : ""}>🛑🚗 Tắc đường</option>
          </select><br>
          <button onclick="capNhatLoai('${uuid}')">💾 Cập nhật</button>
          <button onclick="xoaDiem('${uuid}')">🗑️ Xóa điểm</button>`;
      }

      marker.bindPopup(popup);
      allMarkers.push({ marker, loai });
      if (uuid) markerMap.set(uuid, marker);
      return marker;
}

// ========== HÀM CẬP NHẬT LOẠI MARKER ==========
 function capNhatLoai(uuid) {
	  const select = document.getElementById(`newType_${uuid}`);
	  const newType = select.value;

	  fetch(apiURL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ action: "updateType", uuid, loai: newType })
	  })
	  .then(res => res.json())
	  .then(data => {
		if (data.status === "ok") {
		  alert("✅ Đã cập nhật loại điểm!");
		  map.eachLayer(function(layer) {
			if (layer.uuid === uuid) {
			  const latlng = layer.getLatLng();
			  map.removeLayer(layer);

			  // 🔹 Tạo marker mới với icon tương ứng loại mới
			  const newMarker = taoMarker(latlng.lat, latlng.lng, newType, uuid);

			  // 🔹 Cập nhật lại trong allMarkers
			  const index = allMarkers.findIndex(m => m.marker.uuid === uuid);
			  if (index !== -1) {
				allMarkers[index] = { marker: newMarker, loai: newType };
			  }

			  // 🔹 Cập nhật lại bộ lọc hiển thị
			  capNhatBoLoc();
			}
		  });
		} else {
		  alert("❌ Cập nhật thất bại: " + data.message);
		}
	  })
	  .catch(err => console.error("❌ Lỗi khi cập nhật loại:", err));
	}

// ========== HÀM XÓA MARKER ==========
// Xóa & cập nhật loại điểm
    function xoaDiem(uuid) {
      const adminKey = prompt("🔑 Nhập khóa admin để xóa điểm:");
      if (!adminKey) return;
      fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", uuid, adminKey })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "deleted") {
          alert("✅ Đã xóa điểm!");
          map.eachLayer(layer => {
            if (layer.uuid === uuid) {
              layer.setOpacity(0);
              setTimeout(() => map.removeLayer(layer), 400);
            }
          });
        } else alert("❌ Xóa thất bại: " + data.message);
      });
    }
// ================== BỘ LỌC HIỂN THỊ ==================
    function capNhatBoLoc() {
      const showNgap = document.getElementById("filter_ngap").checked;
      const showAntoan = document.getElementById("filter_antoan").checked;
      const showCuuho = document.getElementById("filter_cuuho").checked;
      const showTacduong = document.getElementById("filter_tacduong").checked;

      allMarkers.forEach(item => {
        const hien =
          (item.loai === "ngap" && showNgap) ||
          (item.loai === "antoan" && showAntoan) ||
          (item.loai === "cuuho" && showCuuho) ||
          (item.loai === "tacduong" && showTacduong);

        if (hien && !map.hasLayer(item.marker)) map.addLayer(item.marker);
        else if (!hien && map.hasLayer(item.marker)) map.removeLayer(item.marker);
      });
    }
    ["filter_ngap","filter_antoan","filter_cuuho","filter_tacduong"]
      .forEach(id => document.getElementById(id).addEventListener("change", capNhatBoLoc));

function xuLyClickBanDo(e) {
      // Shift + click -> tìm đường
      if (e.originalEvent.shiftKey) {
        const lat = e.latlng.lat, lng = e.latlng.lng;
        L.marker([lat, lng]).addTo(map).bindPopup("🎯 Điểm đến").openPopup();
        timDuongAnToan(lat, lng);
        return;
      }

      // Click bình thường -> thêm điểm
      const lat = e.latlng.lat, lng = e.latlng.lng;
      const tempMarker = taoMarker(lat, lng, loai);

      fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", loai, lat, lng })
      })
      .then(res => res.json())
      .then(data => {
        if (data.uuid) {
          map.removeLayer(tempMarker);
          taoMarker(lat, lng, loai, data.uuid);
        }
      })
      .catch(err => console.error("Lỗi khi gửi:", err));
}

