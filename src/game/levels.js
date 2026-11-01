export const GENERATOR_VERSION = 1;
export const WORLD = Object.freeze({ width: 390, height: 700, pillarWidth: 68, truckWidth: 36 });
export function hash32(n) { let x = n >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x7feb352d); x ^= x >>> 15; x = Math.imul(x, 0x846ca68b); return (x ^ (x >>> 16)) >>> 0; }
export function makeLevel(level, seed = hash32(level * 1949 + 41), generatorVersion = GENERATOR_VERSION) {
 if (!Number.isSafeInteger(level) || level < 1 || level > 1000000) throw Error('Invalid level');
 if (generatorVersion !== GENERATOR_VERSION) throw Error('Unsupported level generator');
 if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw Error('Invalid seed');
 const gap = 72 + (hash32(seed) % Math.min(119, 45 + level * 3));
 return { level, seed, generatorVersion, gap, targetWidth: 68, minLength: gap, maxLength: gap + 68 };
}
export function crossingResult(length, level) { if (!Number.isFinite(length)) return false; return length >= level.minLength && length <= level.maxLength; }
export function newProgress() { return { level: 1, highestCompleted: 0, seed: hash32(1 * 1949 + 41), generatorVersion: GENERATOR_VERSION }; }
export function complete(progress) { const level = progress.level + 1; return { level, highestCompleted: Math.max(progress.highestCompleted, progress.level), seed: hash32(level * 1949 + 41), generatorVersion: GENERATOR_VERSION }; }