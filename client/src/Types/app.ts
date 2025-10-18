// Redux
export type initialStateResetDataPass = {
  email: string;
  resetCode: string;
};

// Signup page
export type SignupFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Login Page
export type LoginFormState = {
  email: string;
  password: string;
};

// User Schema
export type UserSchema = {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  currentPlan: string;
  planPurchasedAt: string | Date;
  planExpiresAt: string | Date;
  points: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// getUser Context
export type initialStateGetUser = {
  loading: boolean;
  data: UserSchema | null;
  error: string;
};

export type PlaylistSchema = {
  _id: string;
  id: string;
  type: string;
  title: string;
  description: string;
  image: string;
  imageUrl: string;
  seasons: {
    _id: string;
    id: string;
    seasonNumber: number;
    countOfEpisodes: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export type EpisodeSchema = {
  _id: string;
  id: string;
  title: string;
  duration: number;
  playlistId: string;
  seasonNumber: number;
  episodeNumber: number;
  createdAt: Date;
  updatedAt: Date;
};
