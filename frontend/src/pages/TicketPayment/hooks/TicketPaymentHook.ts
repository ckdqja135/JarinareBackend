import { useState } from 'react';

export const usePyamentState = () => {
  const [payment, setPayemnt] = useState<boolean>(false);
  return { payment, setPayemnt };
};
