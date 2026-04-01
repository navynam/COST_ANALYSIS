import { useState } from 'react';
import type { ListItem } from '../types';

export const useListViewRow = (item: ListItem) => {
  const [open, setOpen] = useState(false);
  const hasChildren = !!(item.children && item.children.length > 0);
  const isAnomaly = item.status === 'anomaly';

  return { open, setOpen, hasChildren, isAnomaly };
};
