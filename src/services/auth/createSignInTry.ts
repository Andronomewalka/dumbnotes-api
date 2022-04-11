import { Db } from 'mongodb';
import { NOT_FOUND } from '@utils/constants';
import { Response } from '../types';

export const createSignInTry = async (ip: string, db: Db): Promise<Response<string>> => {
  const postsCollection = await db.collection('Auth');
  let data = '';
  let error = '';

  const ipTry = {
    ip,
    tries: 0,
  };

  await new Promise((resolve, reject) => {
    postsCollection.insertOne(ipTry, (err, result) => {
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
    .catch((err: string) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
