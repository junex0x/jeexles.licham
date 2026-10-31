# jeexles.licham

**Lịch âm – dương Việt Nam** · Được tạo bởi **jeexles**.

Website/PWA giao diện tối giản, hoạt động trên Android, iPhone, tablet và máy tính.

## Tính năng

- Xem lịch tháng có ngày âm và dương song song; chọn từng ngày để xem chi tiết.
- Chuyển đổi âm ↔ dương (có hỗ trợ tháng nhuận).
- Xem can chi, giờ hoàng đạo và 24 tiết khí dưới dạng thông tin tham khảo.
- Ngày lễ Việt Nam, sự kiện sắp tới và sự kiện riêng (lưu trên thiết bị).
- Cài đặt dạng PWA, hỗ trợ dùng ngoại tuyến sau lần tải thành công đầu tiên.
- Không sử dụng API bên ngoài, tài khoản, Supabase hay máy chủ lưu trữ sự kiện.

## Bộ máy tính lịch

`lunar-core.js` là mã tính toán thiên văn được triển khai riêng cho dự án, sử dụng các công thức tính kỳ trăng mới, kinh độ Mặt Trời và quy tắc lịch âm – dương Việt Nam tại múi giờ UTC+7. Toàn bộ mã nguồn tính lịch trong phiên bản này được triển khai riêng cho dự án.

Phạm vi giao diện: **1901–2098**. Các ngày lịch thiên văn lịch sử xa và những trường hợp nằm sát thời điểm giao thoa múi giờ có thể chênh lệch so với lịch niên giám chính thức; nên đối chiếu nguồn lịch chuẩn cho nhu cầu pháp lý hay nghi lễ quan trọng. Ngày lễ không đại diện cho lịch nghỉ lễ chính thức từng năm.

## Chạy và xuất bản

Dùng web server tĩnh (PWA cần HTTPS hoặc localhost):

```sh
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`. Có thể triển khai thư mục này lên Vercel hoặc GitHub Pages, không cần build.

## Thương hiệu

- **Tên sản phẩm:** jeexles.licham
- **Tác giả và đơn vị phát triển:** jeexles
- **Phiên bản:** 2.0

© 2026 jeexles. All rights reserved.
