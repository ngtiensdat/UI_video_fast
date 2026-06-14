import { useEffect, useRef, useState, RefCallback } from "react";

interface UseIntersectionObserverProps extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0.5,
  root = null,
  rootMargin = "0px",
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [RefCallback<Element>, boolean] {
  const [isIntersecting, setIntersecting] = useState(false);
  const elementRef = useRef<Element | null>(null);

  const refCallback: RefCallback<Element> = (node) => {
    elementRef.current = node;
  };

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    const hasSupport = !!window.IntersectionObserver;
    if (!hasSupport) {
      // Fallback if not supported
      setIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isEntryIntersecting = entry.isIntersecting;
        setIntersecting(isEntryIntersecting);

        if (isEntryIntersecting && freezeOnceVisible) {
          observer.unobserve(node);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return [refCallback, isIntersecting];
}
export type { UseIntersectionObserverProps };
