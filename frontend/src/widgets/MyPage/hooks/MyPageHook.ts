import { useState } from 'react';
import { Value } from 'react-calendar/src/shared/types.js';

export const useDaySelect = () => {
  const [value, onChange] = useState<Value>(new Date());
  return { value, onChange };
};
