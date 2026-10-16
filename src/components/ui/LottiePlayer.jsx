import React from 'react';
import { Lottie } from 'lottie-react';

/**
 * Plays a Lottie JSON from /public (or a remote URL).
 * Uses lottie-react v3 `src` API.
 */
const LottiePlayer = ({
  src,
  className = '',
  loop = true,
  autoplay = true,
  style,
}) => {
  if (!src) return <div className={className} style={style} aria-hidden />;

  return (
    <Lottie
      src={src}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  );
};

export default LottiePlayer;
