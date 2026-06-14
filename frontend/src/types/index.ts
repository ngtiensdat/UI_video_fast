export interface VideoItem {
  id: string;
  videoUrl: string;
  authorName: string;
  authorAvatar: string;
  description: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  musicName: string;
}

export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}
