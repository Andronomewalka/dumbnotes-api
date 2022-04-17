import { GetPostsParams, PostType } from './types';

export const defaultPost: PostType = {
  id: '',
  name: '',
  path: '',
  content: '',
};

export const reservedPathes = ['new', 'navigation', '404', '500'];

export const deserializeGetPostsParams = (query: any): GetPostsParams => {
  let filter = '.*';
  if (typeof query.filter === 'string') {
    filter = query.filter;
  }

  let cursorId = '';
  if (typeof query.cursorId === 'string') {
    cursorId = query.cursorId === '0' ? '' : query.cursorId;
  }

  let limit = 0;
  if (typeof query.limit === 'string') {
    limit = parseInt(query.limit);
    if (Number.isNaN(limit)) {
      limit = 0;
    }
  }

  let exclude: string[] = [];
  if (typeof query.exclude === 'string') {
    try {
      exclude = JSON.parse(query.exclude);
      // eslint-disable-next-line no-empty
    } catch {}
  }

  return {
    filter,
    cursorId,
    limit,
    exclude,
  };
};
