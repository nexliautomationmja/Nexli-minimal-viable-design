/** Shared framer-motion variants for firm-site sections (mirrors the portfolio demos). */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: EASE },
  }),
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export const viewportOnce = { once: true, amount: 0.25 } as const;
