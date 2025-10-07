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
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  points: number;
  id: string;
  _id: string;
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
