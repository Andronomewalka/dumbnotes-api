import { Db } from 'mongodb';
import { NOT_FOUND } from '@utils/constants';
import { Response } from '../types';
import { NavNodeBaseType } from './types';

export const updateNavigation = async (
  navItems: NavNodeBaseType[],
  db: Db
): Promise<Response<boolean>> => {
  const navCollection = await db.collection('Nav');
  let data = false;
  let error = '';

  await new Promise((resolve, reject) => {
    navCollection.updateOne({}, { $set: { navItems } }, (err, result) => {
      if (err || !result) {
        reject(err);
        return;
      }
      const res = result.matchedCount > 0;
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
