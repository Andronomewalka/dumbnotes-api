import { Db } from 'mongodb';
import { NOT_FOUND } from '@utils/constants';
import { Response } from '../types';
import { PostType } from './types';
import { reservedPathes } from './utils';

export const createPost = async (
  post: Omit<PostType, 'id' | 'date'>,
  db: Db
): Promise<Response<string>> => {
  const postsCollection = await db.collection('Posts');
  let data = '';
  let error = '';
  let pathAlreadyExist = false;

  if (reservedPathes.includes(post.path.toLowerCase())) {
    return {
      data: '',
      error: 'Reserved path',
    };
  }

  await new Promise((resolve, reject) => {
    postsCollection.find({}).toArray((err, result) => {
      if (err || !result) {
        reject(err);
        return;
      }

      const res = result.some((item) => item.path === post.path);
      resolve(res);
    });
  })
    .then((res) => {
      pathAlreadyExist = res as boolean;
    })
    .catch((err) => {
      error = err + '' || NOT_FOUND;
    });

  if (pathAlreadyExist) {
    return {
      data: '',
      error: 'Path already taken',
    };
  }

  await new Promise((resolve, reject) => {
    postsCollection.insertOne({ ...post, date: new Date().getTime() }, (err, result) => {
      if (err || !result) {
        reject(error);
        return;
      }
      const res = result.insertedId.toString();
      resolve(res);
    });
  })
    .then((res) => {
      data = res as string;
    })
    .catch((err) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
