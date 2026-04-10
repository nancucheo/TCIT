import { useMemo } from 'react';
import { useAppSelector } from '@app/hooks';
import { selectFilterText } from '../slices/postsSlice';
import type { Post } from '../types/post.types';

export function usePostFilter(posts: Post[] | undefined): Post[] {
  const filterText = useAppSelector(selectFilterText);

  return useMemo(() => {
    if (!posts) return [];
    if (!filterText.trim()) return posts;
    const lower = filterText.toLowerCase();
    return posts.filter((post) => post.name.toLowerCase().includes(lower));
  }, [posts, filterText]);
}
