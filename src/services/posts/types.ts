export interface PostBaseType {
  id: string;
  name: string;
  path: string;
}

export interface PostType extends PostBaseType {
  content: string;
  date: string;
}

export interface GetPostParams {
  exclude: string[];
}

export interface GetPostsParams extends GetPostParams {
  filter: string;
  cursorId: string;
  limit: number;
}
