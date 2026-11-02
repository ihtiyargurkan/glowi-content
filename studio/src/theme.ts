// Glowi brand + motion tokens
export const C = {
  plum: '#4B2E39',
  plumDeep: '#24131B',
  plumInk: '#170A10',
  blush: '#EEDDE2',
  blushWarm: '#F3D6D6',
  rose: '#D98C9A',
  roseDeep: '#A8566A',
  dermis: '#8E4257',
  gold: '#F2C879',
  goldHot: '#FFE3A8',
  uvb: '#FF7468',
  uva: '#C7B2FF',
  spot: '#8A5A44',
  white: '#FFFFFF',
  water: '#A8DDF2',
  waterDeep: '#5BB3DD',
  night: '#0E0A1C',
  moon: '#F4EBD8',
  cortisol: '#FF9A6A',
  oil: '#F2C46A',
  foam: '#F7F3F5',
  sugar: '#FFFFFF',
  caramel: '#C47A35',
  caramelDeep: '#8A4B1C',
  age: '#E89A3C',
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// deterministic pseudo random
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
// progress of time `s` between a and b seconds
export const prog = (s: number, a: number, b: number) => clamp((s - a) / (b - a));
