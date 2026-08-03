import { Listing, Maintenance, Watch } from './types';
export const demoWatches: Watch[] = [
 {id:'1',brand:'Omega',model:'Speedmaster Moonwatch',reference:'310.30.42.50.01.002',year:'2022',movement:'Manuale',caliber:'3861',diameter:'42 mm',material:'Acciaio',dial:'Nero',waterResistance:'50 m',purchasePrice:6900,currentValue:7600,condition:'Eccellente',status:'In collezione',image:'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=80',serial:'89••••••',notes:'Full set, bracciale originale.'},
 {id:'2',brand:'Seiko',model:'Prospex Solar Speedtimer',reference:'SSC813',year:'2024',movement:'Solare',caliber:'V192',diameter:'39 mm',material:'Acciaio',dial:'Panda',waterResistance:'100 m',purchasePrice:620,currentValue:590,condition:'Ottimo',status:'In collezione',image:'https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&w=1000&q=80',serial:'58••••••',notes:'Cinturino aggiuntivo in pelle.'},
 {id:'3',brand:'Tissot',model:'PRX Powermatic 80',reference:'T137.407.11.041.00',year:'2023',movement:'Automatico',caliber:'Powermatic 80',diameter:'40 mm',material:'Acciaio',dial:'Blu',waterResistance:'100 m',purchasePrice:720,currentValue:650,condition:'Molto buono',status:'In collezione',image:'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1000&q=80',serial:'42••••••',notes:'Piccoli segni sul bracciale.'}
];
export const demoMaintenance: Maintenance[] = [
 {id:'m1',watchId:'1',watch:'Omega Speedmaster',type:'Controllo impermeabilità',due:'2026-09-18',status:'In scadenza',cost:0,provider:'',notes:'Controllo annuale consigliato'},
 {id:'m2',watchId:'2',watch:'Seiko SSC813',type:'Ricarica solare completa',due:'2026-08-12',status:'Da fare',cost:0,provider:'',notes:'Esporre a luce indiretta intensa'},
 {id:'m3',watchId:'3',watch:'Tissot PRX',type:'Tagliando completo',due:'2028-03-01',status:'Programmato',cost:280,provider:'Centro autorizzato',notes:''}
];
export const demoListings: Listing[] = [
 {id:'l1',title:'Longines HydroConquest 41 mm',price:1250,condition:'Ottimo',seller:'Marco_Time',image:'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80',location:'Milano'},
 {id:'l2',title:'Hamilton Khaki Field Mechanical',price:430,condition:'Come nuovo',seller:'WatchLover84',image:'https://images.unsplash.com/photo-1526045431048-f857369baa09?auto=format&fit=crop&w=900&q=80',location:'Torino'},
 {id:'l3',title:'Citizen Promaster Eco-Drive',price:295,condition:'Buono',seller:'DiverClub',image:'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?auto=format&fit=crop&w=900&q=80',location:'Genova'}
];
