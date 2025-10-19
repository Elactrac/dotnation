
import { useState, useEffect, useRef } from 'react';

function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const frameRate = 60;
  const totalFrames = Math.round(duration / (1000 / frameRate));

  useEffect(() => {
    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const counter = setInterval(() => {
          frame++;
          const progress = frame / totalFrames;
          const currentCount = Math.round(end * progress);

          if (frame >= totalFrames) {
            clearInterval(counter);
            setCount(end);
          } else {
            setCount(currentCount);
          }
        }, 1000 / frameRate);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [end, totalFrames]);

  return [count, ref];
}

export default useCountUp;
