import { newProgress, makeLevel } from './game/levels.js';
export const KEY = 'tiny-town-adventures-save-v1';
export const APP_ID = 'tiny-town-adventures';
export function initialState() { return { schemaVersion: 1, settings: { sound: false }, games: { jungleQuest: newProgress() } }; }
export function validateState(data) {
 if (!data || typeof data !== 'object' || data.schemaVersion !== 1 || !data.settings || typeof data.settings.sound !== 'boolean' || !data.games || !data.games.jungleQuest) throw Error('Unsupported or invalid save format');
 const p = data.games.jungleQuest;
 if (!Number.isSafeInteger(p.highestCompleted) || p.highestCompleted < 0 || !Number.isSafeInteger(p.level) || p.level < 1 || p.level > 1000000 || p.highestCompleted > p.level - 1) throw Error('Invalid progress');
 makeLevel(p.level, p.seed, p.generatorVersion);
 return { schemaVersion: 1, settings: { sound: data.settings.sound }, games: { jungleQuest: { level: p.level, highestCompleted: p.highestCompleted, seed: p.seed, generatorVersion: p.generatorVersion } } };
}
export function readState(storage = localStorage) {
 const raw = storage.getItem(KEY);
 if (raw === null) return { state: initialState(), error: null };
 try { return { state: validateState(JSON.parse(raw)), error: null }; }
 catch (error) { return { state: null, error: `Saved progress could not be loaded: ${error.message}. No data has been erased.` }; }
}
export function writeState(state, storage = localStorage) { const validated = validateState(state); storage.setItem(KEY, JSON.stringify(validated)); return validated; }
export function backupText(state) { return JSON.stringify({ appId: APP_ID, formatVersion: 1, createdAt: new Date().toISOString(), data: validateState(state) }, null, 2); }
export function restoreText(text) {
 const parsed = JSON.parse(text);
 if (!parsed || parsed.appId !== APP_ID || parsed.formatVersion !== 1) throw Error('Not a supported Tiny Town Adventures backup');
 return validateState(parsed.data);
}