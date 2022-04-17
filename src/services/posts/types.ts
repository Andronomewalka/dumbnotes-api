export interface PostBaseType {
  id: string;
  name: string;
  path: string;
}

export interface PostType extends PostBaseType {
  content: string;
}

export interface GetPostsParams {
  filter: string;
  cursorId: string;
  limit: number;
  exclude: string[];
}
