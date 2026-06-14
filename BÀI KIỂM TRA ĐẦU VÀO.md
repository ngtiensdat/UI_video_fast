## **BÀI KIỂM TRA ĐẦU VÀO**

(ĐƯỢC SỬ DỤNG AI NHƯNG KHÔNG KHUYẾN KHÍCH)

## **1\. Mục tiêu bài test**

Đánh giá kỹ năng xử lý giao diện linh hoạt (Responsive, CSS Animations), quản lý Component, tương tác với DOM (Play/Pause Video), và tối ưu hiệu năng hiển thị cơ bản trong hệ sinh thái React/Next.js.

## **2\. Yêu cầu**

Sử dụng **Next.js** (khuyến khích dùng App Router) và **TypeScript** để xây dựng một trang web xem video dạng cuộn dọc (Vertical Scroll Feed).

**A. Yêu cầu bắt buộc (Core Features):**

1. **Giao diện cuộn dọc (Vertical Scroll Layout):**  
   * Màn hình hiển thị từng video chiếm toàn bộ khung hình (Full-screen hoặc cố định khung tỷ lệ 9:16 ở giữa màn hình nếu xem trên PC).  
   * Áp dụng hiệu ứng cuộn mượt từng video một  
2. **Video Player Component:**  
   * Mỗi video card cần có: Thành phần Video, Tên tác giả, Mô tả ngắn, và dải nút tương tác bên phải (Tim, Bình luận, Chia sẻ).  
   * **Tính năng cốt lõi:** Khi người dùng click vào video, video sẽ Play/Pause.  
3. **Quản lý dữ liệu giả (Mock Data):**  
   * Tự tạo một mảng chứa khoảng 3-5 object dữ liệu giả. Mỗi object gồm: id, videoUrl, authorName, description, likesCount.

**B. Điểm cộng (Bonus \- Dành cho ứng viên xuất sắc):**

1. **Tự động Play/Pause (Auto-play on scroll):** Video tự động phát khi cuộn tới và nằm trong tầm nhìn (viewport), tự động dừng (pause) khi bị cuộn qua. (Gợi ý: sử dụng Intersection Observer API).  
2. **State Mạng Xã Hội:** Nút "Tim" (Like) có thể click để đổi màu (đỏ) và tăng/giảm số lượng like.  
3. **Thanh điều hướng (Sidebar/Bottom Nav):** Có thanh menu cơ bản (Trang chủ, Khám phá, Hồ sơ) mô phỏng UI của các app thật. Mobile hiển thị ở bottom, PC hiển thị bên trái.

## **3\. Tài nguyên cung cấp (Mock Video URLs)**

Ứng viên có thể sử dụng các link video .mp4 miễn phí sau (hoặc tự kiếm trên Pexels/Pixabay) để làm dữ liệu tĩnh:

* Video 1: \[https://www.w3schools.com/html/mov\_bbb.mp4\](https://www.w3schools.com/html/mov\_bbb.mp4)  
* Video 2: \[https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4\](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4)  
* Video 3: \[https://media.w3.org/2010/05/sintel/trailer.mp4\](https://media.w3.org/2010/05/sintel/trailer.mp4)

## **4\. Hình thức nộp bài**

* Source code đẩy lên **GitHub** (Public repo).  
* (Bắt buộc) Deploy ứng dụng lên **Vercel**, **đặt tên dự án là test \+ tên \+ 3 số cuối số điện thoại** (ví dụ Test-NguyenVanA-123)  
* Gửi kèm link video demo (quay lại sau đó đẩy lên GG Drive và chia sẻ link \- bật quyền truy cập cho link).  
* Trong file README.md, giải thích ngắn gọn cách xử lý logic Play/Pause khi cuộn trang.  
* Gửi bài về bằng email đính kèm link source code, link dự án vercel, link video demo đã cấp quyền.