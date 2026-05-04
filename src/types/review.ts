export type Review = {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
    isPro: boolean;
  };
  rating: number;
  comment: string;
  date: string;
};

export type ReviewPostData = {
  rating: number;
  comment: string;
};

