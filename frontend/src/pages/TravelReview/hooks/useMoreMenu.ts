/**
 * @role: pages — ... 드롭다운 메뉴 열림/닫힘 상태 훅
 * @rule: 상태·사이드이펙트만 담당
 */
import { useEffect, useRef, useState } from 'react';

export const useMoreMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return { open, setOpen, ref };
};
