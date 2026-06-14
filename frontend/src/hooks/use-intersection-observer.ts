import { useEffect, useState, useCallback } from "react";

interface UseIntersectionObserverProps extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0.5,
  root = null,
  rootMargin = "0px",
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  const refCallback = useCallback((node: Element | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const hasSupport = !!window.IntersectionObserver;
    if (!hasSupport) {
      // Fallback if not supported - wrap in setTimeout to avoid react-hooks/set-state-in-effect
      const timer = setTimeout(() => setIntersecting(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isEntryIntersecting = entry.isIntersecting;
        setIntersecting(isEntryIntersecting);

        if (isEntryIntersecting && freezeOnceVisible) {
          observer.unobserve(element);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, threshold, root, rootMargin, freezeOnceVisible]);

  return [refCallback, isIntersecting];
}
export type { UseIntersectionObserverProps };
