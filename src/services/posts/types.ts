export interface PostBaseType {
  id: string;
  name: string;
  path: string;
}

export interface PostType extends PostBaseType {
  content: string;
}
