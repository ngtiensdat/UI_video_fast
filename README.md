# Giải thích logic Play/Pause khi cuộn trang (Auto-play on Scroll)

Để tối ưu hóa hiệu năng (không để nhiều video cùng phát một lúc gây tốn băng thông và tài nguyên CPU/GPU), dự án sử dụng **Intersection Observer API** thông qua một custom hook `useIntersectionObserver` đặt tại `src/hooks/use-intersection-observer.ts`.

### 1. Thiết lập Ngưỡng Hiển Thị (Threshold)
Mỗi video card trong Feed được bao bọc bởi một wrapper component `FeedItemWrapper`. Wrapper này lắng nghe sự kiện hiển thị với cấu hình `threshold: 0.6`. Điều này đảm bảo video phải hiển thị **tối thiểu 60% diện tích** trong khung hình người dùng (viewport) thì mới được coi là đang hoạt động (`isIntersecting === true`).

### 2. Xử lý Trạng thái Play / Pause
Tại component `video-player.tsx`, chúng ta sử dụng một `useEffect` theo dõi biến `isActive` (nhận giá trị được truyền từ trạng thái `isIntersecting` của wrapper).
* **Khi `isActive === true`**: Component thực thi phương thức `videoRef.current.play()` để bắt đầu phát video tự động. Đồng thời, âm lượng và trạng thái tắt tiếng sẽ được đồng bộ hóa từ cài đặt trong `localStorage`.
* **Khi `isActive === false`**: Component lập tức thực thi phương thức `videoRef.current.pause()` để dừng video lại, đồng thời đặt `videoRef.current.currentTime = 0` nhằm reset video về giây đầu tiên khi người dùng cuộn qua.

### 3. Tránh xung đột cử chỉ (Pointer Events)
Thay vì sử dụng sự kiện `click` thông thường (dễ bị kích hoạt nhầm khi người dùng thực hiện thao tác vuốt cuộn trang trên màn hình cảm ứng di động), trình phát sử dụng hệ thống sự kiện pointer (`pointerdown`, `pointerup`, `pointercancel`) để nhận diện chính xác cử chỉ click/nhấp đúp và nhấn giữ mà không làm cản trở hay gây xung đột với hành vi cuộn dọc của trang Feed.
