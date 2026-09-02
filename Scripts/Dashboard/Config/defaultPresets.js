const DEFAULT_BUYS = Object.freeze([
    {amount: 0.10},
    {amount: 0.25},
    {amount: 0.50},
    {amount: 1},
]);

const DEFAULT_SELLS = Object.freeze([
    {amount: 10},
    {amount: 25},
    {amount: 50},
    {amount: 100},
]);

export const defaultPresets = Object.freeze({
    preset1: {
        buys: DEFAULT_BUYS,
        sells: DEFAULT_SELLS,
    },
    preset2: {
        buys: [{amount: 0.50}, {amount: 1}, {amount: 1.50}, {amount: 2}],
        sells: DEFAULT_SELLS,
    },
    preset3: {
        buys: [{amount: 1}, {amount: 2.50}, {amount: 5}, {amount: 10}],
        sells: [{amount: 25}, {amount: 50}, {amount: 75}, {amount: 100}],
    },
});
