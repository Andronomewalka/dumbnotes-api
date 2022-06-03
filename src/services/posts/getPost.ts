import { Db } from 'mongodb';
import { NOT_FOUND } from '@utils/constants';
import { Response } from '../types';
import { GetPostParams, PostType } from './types';
import { defaultPost } from './utils';

export const getPost = async (
  path: string,
  db: Db,
  params: GetPostParams
): Promise<Response<PostType>> => {
  const postsCollection = await db.collection('Posts');
  let data: PostType = defaultPost;
  let error = '';

  const projection = params.exclude.reduce(
    (acc, cur) => (((acc as any)[cur] = 0), acc),
    {}
  );

  await new Promise((resolve, reject) => {
    postsCollection.findOne({ path }, { projection }, (err, result) => {
      if (err || !result) {
        reject(error);
        return;
      }
      const { _id, ...postData } = result;
      const res = { id: _id.toString(), ...postData } as PostType;
      resolve(res);
    });
  })
    .then((res) => {
      data = res as PostType;
    })
    .catch((err: string) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
