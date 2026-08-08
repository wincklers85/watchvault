'use client';
export const locales=['it','en','fr','es','ru'] as const;
export type Locale=typeof locales[number];
export const localeNames:Record<Locale,string>={it:'Italiano',en:'English',fr:'Français',es:'Español',ru:'Русский'};
const KEY='watchvault-locale';
export function detectLocale():Locale{if(typeof window==='undefined')return'it';const saved=localStorage.getItem(KEY) as Locale|null;if(saved&&locales.includes(saved))return saved;const lang=(navigator.languages?.[0]||navigator.language||'it').toLowerCase().split('-')[0] as Locale;return locales.includes(lang)?lang:'en'}
export function saveLocale(locale:Locale){if(typeof window!=='undefined'){localStorage.setItem(KEY,locale);document.documentElement.lang=locale;window.dispatchEvent(new CustomEvent('watchvault-locale',{detail:locale}))}}
export const copy={
 it:{story:'La nostra storia',privacy:'Privacy',terms:'Termini',language:'Lingua',logout:'Esci'},
 en:{story:'Our story',privacy:'Privacy',terms:'Terms',language:'Language',logout:'Sign out'},
 fr:{story:'Notre histoire',privacy:'Confidentialité',terms:'Conditions',language:'Langue',logout:'Déconnexion'},
 es:{story:'Nuestra historia',privacy:'Privacidad',terms:'Términos',language:'Idioma',logout:'Salir'},
 ru:{story:'Наша история',privacy:'Конфиденциальность',terms:'Условия',language:'Язык',logout:'Выйти'}
} as const;
