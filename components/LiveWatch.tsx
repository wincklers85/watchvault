'use client';
import {useEffect,useState} from 'react';

export default function LiveWatch(){
  const[now,setNow]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id)},[]);
  const seconds=now.getSeconds()+now.getMilliseconds()/1000;
  const minutes=now.getMinutes()+seconds/60;
  const hours=(now.getHours()%12)+minutes/60;
  const secondDeg=seconds*6;
  const minuteDeg=minutes*6;
  const hourDeg=hours*30;
  return <div className="watch-face" aria-label={`Ora locale ${now.toLocaleTimeString('it-IT')}`}>
    {Array.from({length:12}).map((_,i)=><span key={i} className="hour-marker" style={{transform:`translateX(-50%) rotate(${i*30}deg)`}}/>) }
    <div className="watch-brand">WATCHVAULT</div>
    <div className="watch-sub">COLLECT • PRESERVE • SHARE</div>
    <span className="hand hour-hand" style={{transform:`translateX(-50%) rotate(${hourDeg}deg)`}}/>
    <span className="hand minute-hand" style={{transform:`translateX(-50%) rotate(${minuteDeg}deg)`}}/>
    <span className="hand second-hand" style={{transform:`translateX(-50%) rotate(${secondDeg}deg)`}}/>
    <span className="watch-pin"/>
  </div>
}
