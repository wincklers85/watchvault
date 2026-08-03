'use client';
import { demoWatches } from './demo';
import { Watch } from './types';
const KEY='watchvault-watches';
export function getWatches():Watch[]{ if(typeof window==='undefined') return demoWatches; const v=localStorage.getItem(KEY); return v?JSON.parse(v):demoWatches; }
export function saveWatches(v:Watch[]){ localStorage.setItem(KEY,JSON.stringify(v)); }
