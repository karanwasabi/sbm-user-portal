'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type PortalPageTransitionProps = {
  children: ReactNode;
};

export function PortalPageTransition({ children }: PortalPageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
