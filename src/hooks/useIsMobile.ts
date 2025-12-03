'use client';

import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    // Code only runs on client
    const check = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    check(); // initial check
    setReady(true); // component mounted → safe to render UI

    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return { isMobile, ready };
}
