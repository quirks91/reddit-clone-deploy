export interface User {
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sub {
  createdAt: string;
  updatedAt: string;
  name: string;
  title: string;
  description: string;
  imageUrn: string;
  bannerUrn: string;
  username: string;
  posts: Post[];
  postCount?: string;

  imageUrl: string;
  bannerUrl: string;
}

export interface Post {
  identifier: string;
  title: string;
  slug: string;
  body: string;
  subName: string;
  username: string;
  createdAt: string;
  updatdAt: string;
  sub?: Sub;

  url: string;
  userVote?: number;
  voteScore?: number;
  commentCount?: number;
}

export interface Comment {
  identifier: string;
  body: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  post?: Post;

  userVote?: number;
  voteScore?: number;
}