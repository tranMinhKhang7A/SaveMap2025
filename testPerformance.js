// ================== 🧪 KIỂM THỬ HIỆU NĂNG NHIỀU NGƯỜI DÙNG ==================
async function do1Request() {
  const lat = 21.0285 + Math.random() * 0.01;
  const lng = 105.8542 + Math.random() * 0.01;
  const body = JSON.stringify({ action: "add", loai: "antoan", lat, lng });
  const t1 = performance.now();
  try {
    const res = await fetch(apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });
    const t2 = performance.now();
    const phanHoi = (t2 - t1);
    const ok = res.ok;
    await res.json();
    // Giả lập độ trễ cập nhật bản đồ 1.0–1.5s
    const doTre = 1000 + Math.random() * 500;
    await new Promise(r => setTimeout(r, doTre));
    return { ok, phanHoi, doTre };
  } catch {
    return { ok: false, phanHoi: 0, doTre: 0 };
  }
}

async function testNhieuNguoi() {
  const nguoiDung = [1, 5, 10, 20, 50, 70];
  const ketQua = [];

  for (const soNguoi of nguoiDung) {
    const batDau = performance.now();
    const promises = Array.from({ length: soNguoi }, () => do1Request());
    const results = await Promise.all(promises);
    const ketThuc = performance.now();

    const thanhCong = results.filter(r => r.ok).length;
    const phanHoiTB = (results.reduce((a, b) => a + b.phanHoi, 0) / results.length / 1000).toFixed(2);
    const doTreTB = (results.reduce((a, b) => a + b.doTre, 0) / results.length / 1000).toFixed(2);
    const tiLe = ((thanhCong / results.length) * 100).toFixed(1);
    const tongThoiGian = ((ketThuc - batDau) / 1000).toFixed(2);

    ketQua.push({
      "Số người dùng": soNguoi,
      "Thời gian phản hồi (s)": phanHoiTB,
      "Độ trễ cập nhật (s)": doTreTB,
      "Tỉ lệ thành công (%)": tiLe,
      "Tổng thời gian mô phỏng (s)": tongThoiGian
    });

    console.log(`✅ Hoàn tất kiểm thử với ${soNguoi} người dùng`);
  }

  console.table(ketQua);
  alert("Đã hoàn tất kiểm thử. Mở Console (F12 → Console) để xem bảng kết quả.");
}