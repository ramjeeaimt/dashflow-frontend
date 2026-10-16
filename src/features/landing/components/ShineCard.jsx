import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelMatrix from './PixelMatrix';

/**
 * How it works cards: on hover, particles scatter from the corner and
 * fill the whole card, then keep flickering.
 */
const ShineCard = ({
  children,
  className = '',
  as: Tag = 'div',
  pixels = false,
  ...props
}) => {
  const MotionTag = motion[Tag] || motion.div;
  const [hovered, setHovered] = useState(false);

  const onEnter = useCallback(() => {
    if (pixels) setHovered(true);
  }, [pixels]);

  const onLeave = useCallback(() => setHovered(false), []);

  return (
    <MotionTag
      whileHover={pixels ? { y: -4, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } } : undefined}
      whileTap={pixels ? { scale: 0.985 } : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`shine-card relative overflow-hidden ${hovered && pixels ? 'is-lit' : ''} ${className}`}
      {...props}
    >
      {pixels && (
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="pixels"
              className="shine-card__pixel-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PixelMatrix variant="light" />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <div className="shine-card__content relative z-[2] h-full">{children}</div>
    </MotionTag>
  );
};

export default ShineCard;
