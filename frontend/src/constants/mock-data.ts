export const BASE_PROFILE_STATS = {
  followers: "3.5K",
  followedBase: 82,
  likesBase: 12400,
  defaultAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
  authorName: "@dat_nguyen_test",
};

export const MOCK_PROFILE_VIDEOS = [
  { id: "vid-6", title: "Visual hành lang cyber", views: "1.2K lượt xem", likes: 84, img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&h=200&fit=crop" },
  { id: "vid-5", title: "ASMR Bàn phím cơ cực chill", views: "4.8K lượt xem", likes: 350, img: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=200&h=200&fit=crop" },
];

export const MOCK_FOLLOWED_ACCOUNTS = [
  { name: "@tho_beo_bunny", handle: "@tho_beo_bunny", desc: "Đang hoạt động", status: "online", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
  { name: "@truyen_thuyet_sintel", handle: "@truyen_thuyet_sintel", desc: "🔴 Đang Live: Blender 4.3 CGI", status: "live", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { name: "@cam_xuc_thu_sau", handle: "@cam_xuc_thu_sau", desc: "Hoạt động 3 giờ trước", status: "offline", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { name: "@canh_hoang_hon", handle: "@canh_hoang_hon", desc: "Đang hoạt động", status: "online", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" },
  { name: "@goc_rong_dien_anh", handle: "@goc_rong_dien_anh", desc: "Đang hoạt động", status: "online", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" },
];

export interface FriendItem {
  name: string;
  msg: string;
  time: string;
  online: boolean;
  avatar: string;
}

export const MOCK_FRIENDS_LIST: FriendItem[] = [
  { name: "@alex_tuong_lai", msg: "Visual đẹp quá bạn ơi! ⚡️", time: "10:45 AM", online: true, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" },
  { name: "@chloe_nhay_mua", msg: "Đã gửi một video", time: "Hôm qua", online: true, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" },
  { name: "@synth_lap_trinh", msg: "Bạn có rảnh làm cái beat mới không?", time: "2 ngày trước", online: false, avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&h=100&fit=crop" },
];

export const MOCK_CHAT_REPLIES = [
  "Visual video của cậu xịn thực sự luôn đó! 🚀",
  "Ui cảm ơn cậu đã tương tác nha! Trông giao diện Looking mượt quá đỗi. 🤩",
  "Để tối nay mình check lại code xem sao nhé! Hẹn gặp lại cậu sau.",
  "Tuyệt vời quá! Mình rất thích thiết kế glassmorphism này."
];

export const MOCK_UPLOAD_SUGGESTIONS = [
  {
    label: "💻 Code Lofi",
    url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-40033-large.mp4",
    desc: "Đêm khuya code dự án Next.js chill chill với nhạc lofi 💻🎧 #lofi #nextjs #coderlife",
    music: "Chill Coding Lofi - @lập_trình_viên"
  },
  {
    label: "🍃 Rừng Nắng",
    url: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
    desc: "Hòa mình vào thiên nhiên hoang dã cực thanh tịnh. Cuối tuần chill thôi! 🍃☀️ #nature #chill #xanh",
    music: "Âm thanh rừng xanh mát lành (Bản gốc)"
  },
  {
    label: "🌊 Bể Bơi",
    url: "https://assets.mixkit.co/videos/preview/mixkit-under-water-view-of-a-swimming-pool-1430-large.mp4",
    desc: "Giải nhiệt mùa hè oi bức dưới dòng nước mát lạnh 🌊🏊‍♂️ #summer #he2026 #chill",
    music: "Summer Water Vibe - @nhac_chill"
  }
];
