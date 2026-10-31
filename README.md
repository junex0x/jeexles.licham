# jeexles.licham

Website/PWA xem lịch âm – dương Việt Nam, giao diện tương thích điện thoại, tablet và máy tính; thương hiệu **jeexles**.

## Chức năng

- Xem lịch tháng với **ngày dương lớn, ngày âm nhỏ** và đánh dấu ngày lễ/sự kiện.
- Trang Hôm nay: âm lịch, can chi, tiết khí và giờ hoàng đạo (thông tin tham khảo).
- Chuyển đổi **dương → âm** và **âm → dương**, bao gồm tháng nhuận.
- Xem các ngày lễ Việt Nam và lưu sinh nhật, kỷ niệm hoặc sự kiện riêng (một lần / hằng năm) trên thiết bị.
- Tìm về hôm nay, đổi tháng, xem sự kiện sắp tới, cài đặt tuần bắt đầu thứ Hai/Chủ Nhật.
- Không cần máy chủ, tài khoản, API hay Supabase. Dữ liệu sự kiện lưu bằng `localStorage` trình duyệt.
- Có PWA, service worker, icon, chạy lại khi offline sau lần truy cập và cài thành app từ trình duyệt.

## Cách chạy

Mở bằng một HTTP server tĩnh, không mở trực tiếp file `index.html` để dùng đầy đủ chức năng PWA.

```sh
python -m http.server 8000
```

Mở http://localhost:8000. Có thể đưa toàn bộ thư mục lên **Vercel** (Other / Static Website) hoặc GitHub Pages. PWA chỉ được cài đặt qua HTTPS hoặc localhost.

## Ghi chú

Ngày hôm nay lấy theo múi giờ **Asia/Ho_Chi_Minh (GMT+7)**. Dải năm giao diện được hỗ trợ: **1901–2098**. Những ngày lễ cố định dùng để nhắc xem, không thay thế lịch nghỉ lễ chính thức do Nhà nước công bố hằng năm.

## Bản quyền

- Phần giao diện, tích hợp và thương hiệu của dự án: **jeexles — jeexles.licham**.
- Thuật toán lịch âm sửa đổi từ **jQuery.AmLich v0.3.1** / Hồ Ngọc Đức, kèm thông báo bản quyền tại `lunar-core.js` và `licenses/NOTICE.txt`. Phần mã thuật toán có giới hạn **dùng cho mục đích cá nhân, phi thương mại** theo giấy phép đính kèm. Nếu muốn sử dụng dự án theo hướng thương mại, cần xin phép chủ sở hữu thuật toán hoặc thay thế bằng nguồn có giấy phép phù hợp.
