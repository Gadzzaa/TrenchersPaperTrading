const DEFAULT_BUYS = Object.freeze([
  { amount: 0.1 },
  { amount: 0.25 },
  { amount: 0.5 },
  { amount: 1 },
]);

const DEFAULT_SELLS = Object.freeze([
  { amount: 10 },
  { amount: 25 },
  { amount: 50 },
  { amount: 100 },
]);

export const defaultPresets = Object.freeze({
  preset1: {
    buys: DEFAULT_BUYS,
    sells: DEFAULT_SELLS,
  },
  preset2: {
    buys: [{ amount: 0.25 }, { amount: 0.5 }, { amount: 0.75 }, { amount: 1 }],
    sells: DEFAULT_SELLS,
  },
  preset3: {
    buys: [{ amount: 0.5 }, { amount: 0.75 }, { amount: 1 }, { amount: 1.25 }],
    sells: DEFAULT_SELLS,
  },
});
