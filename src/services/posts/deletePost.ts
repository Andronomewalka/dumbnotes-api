import { Db, ObjectId } from 'mongodb';
import { NOT_FOUND } from '@utils/constants';
import { Response } from '../types';

export const deletePost = async (id: string, db: Db): Promise<Response<boolean>> => {
  const postsCollection = await db.collection('Posts');
  let data = false;
  let error = '';

  await new Promise((resolve, reject) => {
    postsCollection.deleteOne({ _id: new ObjectId(id) }, (err, result) => {
      if (err || !result) {
        reject(error);
        return;
      }
      const res = result.deletedCount > 0;
      resolve(res);
    });
  })
    .then((res) => {
      data = res as boolean;
    })
    .catch((err) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
