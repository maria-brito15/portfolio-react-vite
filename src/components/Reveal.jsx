import { useEffect, useRef, useState } from 'react';

// Um único IntersectionObserver compartilhado por todos os elementos animados,
// como no script original (threshold 0.12). Cada elemento deixa de ser
// observado assim que aparece ou é desmontado, então observadores não se acumulam.
const callbacks = new WeakMap();
let observer = null;

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          callbacks.get(entry.target)?.();
          observer.unobserve(entry.target);
          callbacks.delete(entry.target);
        }),
      { threshold: 0.12 },
    );
  }
  return observer;
}

function canAnimate() {
  return (
    typeof IntersectionObserver !== 'undefined' &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => !canAnimate());

  useEffect(() => {
    const el = ref.current;
    if (visible || !el) return;
    callbacks.set(el, () => setVisible(true));
    getObserver().observe(el);
    return () => {
      getObserver().unobserve(el);
      callbacks.delete(el);
    };
  }, [visible]);

  return (
    <Tag ref={ref} className={`${className} ap${visible ? ' v' : ''}`} {...rest}>
      {children}
    </Tag>
  );
}
