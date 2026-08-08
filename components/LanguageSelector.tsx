'use client';
import {useEffect,useState} from 'react';
import {detectLocale,Locale,localeNames,locales,saveLocale} from '@/lib/i18n';
export default function LanguageSelector(){const[locale,setLocale]=useState<Locale>('it');useEffect(()=>{const l=detectLocale();setLocale(l);document.documentElement.lang=l},[]);return <label className="language-selector"><span className="sr-only">Lingua / Language</span><select aria-label="Lingua / Language" value={locale} onChange={e=>{const l=e.target.value as Locale;setLocale(l);saveLocale(l);location.reload()}}>{locales.map(l=><option key={l} value={l}>{localeNames[l]}</option>)}</select></label>}
