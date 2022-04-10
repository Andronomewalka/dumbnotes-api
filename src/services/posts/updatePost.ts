import { Db, ObjectId } from 'mongodb';
import { NOT_FOUND } from 'utils/constants';
import { Response } from '../types';
import { PostType } from './types';

export const updatePost = async (post: PostType, db: Db): Promise<Response<boolean>> => {
  const postsCollection = await db.collection('Posts');
  let data = false;
  let error = '';
  let pathAlreadyExist = false;

  if (post.path === 'new' || post.path === 'navigation') {
    return {
      data: false,
      error: 'Reserved path',
    };
  }

  await new Promise((resolve, reject) => {
    postsCollection.find({}).toArray((err, result) => {
      if (err || !result) {
        reject(err);
        return;
      }

      const res = result.some(
        (item) => item.path === post.path && item._id.toString() !== post.id
      );
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
      data: false,
      error: 'Path already taken',
    };
  }

  const { id, ...postDb } = post;

  await new Promise((resolve, reject) => {
    postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: postDb },
      (err, result) => {
        if (err || !result) {
          reject(err);
          return;
        }
        const res = result.matchedCount > 0;
        resolve(res);
      }
    );
  })
    .then((res) => {
      data = res as boolean;
    })
    .catch((err) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
