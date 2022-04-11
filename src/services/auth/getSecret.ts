import { Db } from 'mongodb';
import { NOT_FOUND } from '@utils/constants';
import { Response } from '../types';

export const getSecret = async (db: Db): Promise<Response<string>> => {
  const postsCollection = await db.collection('Auth');
  let data = '';
  let error = '';

  await new Promise((resolve, reject) => {
    postsCollection.findOne({}, (err, result) => {
      if (err || !result) {
        reject(error);
        return;
      }
      const res = result.secret;
      resolve(res);
    });
  })
    .then((res) => {
      data = res as string;
    })
    .catch((err: string) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
