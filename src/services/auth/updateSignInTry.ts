import { Db } from 'mongodb';
import { NOT_FOUND } from 'utils/constants';
import { Response } from '../types';

export const updateSignInTry = async (
  ip: string,
  tries: number,
  db: Db
): Promise<Response<boolean>> => {
  const postsCollection = await db.collection('Auth');
  let data = false;
  let error = '';

  const ipTry = {
    ip,
    tries,
  };

  await new Promise((resolve, reject) => {
    postsCollection.updateOne({ ip }, { $set: ipTry }, (err, result) => {
      if (err || !result) {
        reject(error);
        return;
      }
      const res = result.matchedCount > 0;
      resolve(res);
    });
  })
    .then((res) => {
      data = res as boolean;
    })
    .catch((err: string) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
