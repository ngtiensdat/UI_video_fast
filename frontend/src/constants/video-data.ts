import { VideoItem, CommentItem } from "../types";

export const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    authorName: "@tho_beo_bunny",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    description: "Big Buck Bunny - Phim hoạt hình ngắn kinh điển. Xem phim này lại gợi nhớ bao kỷ niệm tuổi thơ thân thương! 🐇🥕 #hoathinh #kinhdien #tho #tuoitho",
    likesCount: 15,
    commentsCount: 4,
    sharesCount: 3,
    musicName: "Nhạc phim gốc Big Buck Bunny (Stereo)",
  },
  {
    id: "vid-2",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    authorName: "@cam_xuc_thu_sau",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    description: "Trông chờ cuối tuần giống hệt như thế này đây... Một cái nhìn nhanh về không khí ngày Thứ Sáu tràn ngập niềm vui! ☀️🕺 #thusaulovers #cuoituan #vibe #vuive",
    likesCount: 28,
    commentsCount: 4,
    sharesCount: 1,
    musicName: "Nhạc nền Friday Dance - Âm thanh MDN (Bản gốc)",
  },
  {
    id: "vid-3",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    authorName: "@truyen_thuyet_sintel",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    description: "Sintel - Trailer chính thức. Một bộ phim hoạt hình 3D mã nguồn mở tuyệt đẹp được thực hiện bởi Blender Foundation. 🐉🗡️ #blender #3d #sintel #cgi #hoathinh",
    likesCount: 42,
    commentsCount: 4,
    sharesCount: 7,
    musicName: "Nhạc phim chính thức Sintel Orchestral Theme",
  }
];

export const MOCK_COMMENTS: CommentItem[] = [
  {
    id: "c-1",
    authorName: "@alex_tuong_lai",
    authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop",
    content: "Wow, màu phim này được chỉnh đỉnh thực sự luôn! Bạn dùng máy gì quay thế?",
    createdAt: "2 giờ trước",
    likesCount: 3,
    isLiked: false,
  },
  {
    id: "c-2",
    authorName: "@chloe_nhay_mua",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop",
    content: "Bản nhạc này khớp với hình ảnh dã man! Cứ bật đi bật lại nghe cả ngày không chán.",
    createdAt: "5 giờ trước",
    likesCount: 2,
    isLiked: true,
  },
  {
    id: "c-3",
    authorName: "@quai_kiet_neon",
    authorAvatar: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=80&h=80&fit=crop",
    content: "Ước gì được đặt chân đến đây một lần. Địa điểm này ở đâu vậy bạn ơi? Cho mình xin thông tin với!",
    createdAt: "1 ngày trước",
    likesCount: 0,
    isLiked: false,
  },
  {
    id: "c-4",
    authorName: "@synth_lap_trinh",
    authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=80&h=80&fit=crop",
    content: "Đậm chất thẩm mỹ Cyberpunk luôn. Giao diện trang web này nhìn cũng siêu mượt và sạch sẽ nữa!",
    createdAt: "1 ngày trước",
    likesCount: 1,
    isLiked: false,
  }
];

export const LIKE_INCREASE_STEP = 1;
export const LOCAL_STORAGE_COMMENT_PREFIX = "cyberfeed_comments_";

export const INITIAL_COMMENTS_MAP: Record<string, CommentItem[]> = {
  "vid-1": [
    { id: "c-1-1", authorName: "@tho_con", authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop", content: "Chú thỏ béo nhìn đáng yêu xỉu luôn á! 😍", createdAt: "2 giờ trước", likesCount: 12, isLiked: false },
    { id: "c-1-2", authorName: "@ca_rot_ngot", authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop", content: "Ký ức tuổi thơ ùa về. Phim hoạt hình 3D đời đầu của Blender đỉnh ghê.", createdAt: "5 giờ trước", likesCount: 8, isLiked: true },
    { id: "c-1-3", authorName: "@yeu_hoathinh", authorAvatar: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=80&h=80&fit=crop", content: "Xem đi xem lại vẫn thấy hài hước.", createdAt: "1 ngày trước", likesCount: 3, isLiked: false },
    { id: "c-1-4", authorName: "@blender_fan", authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=80&h=80&fit=crop", content: "Render bằng công nghệ cũ mà chuyển động mượt thật sự.", createdAt: "2 ngày trước", likesCount: 1, isLiked: false }
  ],
  "vid-2": [
    { id: "c-2-1", authorName: "@vui_ve_ghe", authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop", content: "Cuối tuần đến rồi quẩy lên thôi mọi người ơi! 💃🕺", createdAt: "1 giờ trước", likesCount: 15, isLiked: false },
    { id: "c-2-2", authorName: "@dan_choi_he_anh", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", content: "Giai điệu này bắt tai ghê, nghe xong muốn nhảy theo.", createdAt: "3 giờ trước", likesCount: 9, isLiked: true },
    { id: "c-2-3", authorName: "@co_nang_vui_tinh", authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", content: "Đúng vibe Thứ Sáu mong chờ luôn á, yêu đời hẳn.", createdAt: "6 giờ trước", likesCount: 4, isLiked: false },
    { id: "c-2-4", authorName: "@party_tracker", authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop", content: "Bình luận đầu tiên nha! Tối nay đi quẩy thôi.", createdAt: "1 ngày trước", likesCount: 2, isLiked: false }
  ],
  "vid-3": [
    { id: "c-3-1", authorName: "@chien_binh_rong", authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=80&h=80&fit=crop", content: "Cốt truyện Sintel cảm động lắm, nhạc phim nghe da diết quá.", createdAt: "4 giờ trước", likesCount: 22, isLiked: true },
    { id: "c-3-2", authorName: "@blender_chuyen_nghiep", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", content: "Tạo hình nhân vật và chú rồng nhìn nghệ thuật dã man.", createdAt: "8 giờ trước", likesCount: 14, isLiked: false },
    { id: "c-3-3", authorName: "@anime_lover", authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop", content: "Thích nhất đoạn rượt đuổi trên tuyết, kỹ xảo đỉnh cao.", createdAt: "1 ngày trước", likesCount: 7, isLiked: false },
    { id: "c-3-4", authorName: "@cgi_maker", authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop", content: "Học Blender 3D cũng vì bộ phim ngắn này, cảm hứng dồi dào.", createdAt: "3 ngày trước", likesCount: 5, isLiked: false }
  ]
};

