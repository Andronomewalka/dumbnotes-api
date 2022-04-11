import { Db } from 'mongodb';
import { NOT_FOUND } from '@utils/constants';
import { Response } from '../types';

export const getSignInTry = async (ip: string, db: Db): Promise<Response<number>> => {
  const postsCollection = await db.collection('Auth');
  let data = -1;
  let error = '';

  await new Promise((resolve, reject) => {
    postsCollection.findOne({ ip }, (err, result) => {
      if (err || !result) {
        reject(error);
        return;
      }
      const res = result.tries;
      resolve(res);
    });
  })
    .then((res) => {
      data = res as number;
    })
    .catch((err: string) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
