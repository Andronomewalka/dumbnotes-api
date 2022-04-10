import { Db } from 'mongodb';
import { NOT_FOUND } from 'utils/constants';
import { Response } from '../types';
import { NavNodeBaseType } from './types';

export const getNavigation = async (db: Db): Promise<Response<NavNodeBaseType[]>> => {
  const navCollection = await db.collection('Nav');
  let data: NavNodeBaseType[] = [];
  let error = '';

  await new Promise((resolve, reject) => {
    navCollection.findOne({}, (err, result) => {
      if (err || !result) {
        reject(error);
        return;
      }
      const res = result.navItems;
      resolve(res);
    });
  })
    .then((res) => {
      data = res as NavNodeBaseType[];
    })
    .catch((err: string) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
