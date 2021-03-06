import { Db, ObjectId } from 'mongodb';
import { NOT_FOUND } from '@utils/constants';
import { Response } from '../types';
import { GetPostsParams, PostType } from './types';

export const getPosts = async (
  params: GetPostsParams,
  db: Db
): Promise<Response<(Partial<PostType> & Pick<PostType, 'id'>)[]>> => {
  const postsCollection = await db.collection('Posts');
  let data: Partial<PostType> & Pick<PostType, 'id'>[] = [];
  let error = '';

  const _idIndex = params.exclude.indexOf('_id');
  if (_idIndex !== undefined && _idIndex > -1) {
    params.exclude.splice(_idIndex, 1);
  }

  const projection = params.exclude.reduce(
    (acc, cur) => (((acc as any)[cur] = 0), acc),
    {}
  );

  await new Promise((resolve) => {
    postsCollection
      .find(
        {
          _id: { $gt: new ObjectId(params.cursorId || 0) },
          $or: [
            { name: { $regex: new RegExp(`${params.filter}`), $options: 'i' } },
            {
              content: {
                $regex: new RegExp(`(?<=>)[^\\>]*${params.filter}[^\\>]*(?=<\\/|<)`),
                $options: 'i',
              },
            },
          ],
        },
        { limit: params.limit, projection }
      )
      .toArray((err, result) => {
        if (err || !result) {
          error = err + '' || NOT_FOUND;
          return;
        }
        const res = result.map((post) => {
          const { _id, ...postData } = post;
          return { id: _id.toString(), ...postData };
        });
        resolve(res);
      });
  })
    .then((res) => {
      data = res as (Partial<PostType> & Pick<PostType, 'id'>)[];
    })
    .catch((err: string) => {
      error = err + '' || NOT_FOUND;
    });

  return { data, error };
};
