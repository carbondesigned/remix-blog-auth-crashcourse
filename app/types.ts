export type PostType = {
  id: number;
  title: string;
  body: string;
  user: { username: string };
  createdAt: Date;
  updatedAt: Date;
};
