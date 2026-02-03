'use client';

import { useEffect, useState } from 'react';
import { MathJax } from 'better-react-mathjax';

interface ClientMathJaxProps {
  children: string;
}

export default function ClientMathJax({ children }: ClientMathJaxProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <span>{children.replace(/\\\[|\]|\\\(|\)/g, '')}</span>;
  }

  return <MathJax>{children}</MathJax>;
}
