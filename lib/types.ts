export type Watch = {
  id: string; brand: string; model: string; reference: string; year: string;
  movement: string; caliber: string; diameter: string; material: string;
  dial: string; waterResistance: string; purchasePrice: number; currentValue: number;
  condition: string; status: string; image: string; serial: string; notes: string;
  lifecycleStatus?: 'active'|'for_sale'|'transferred'|'sold_external'|'lost'|'stolen'|'recovered';
  isForSale?: boolean;
  lossStatus?: 'none'|'lost'|'stolen'|'recovered'|string;
  isNumbered?: boolean; editionNumber?: number|null; editionTotal?: number|null;
};
export type Maintenance = { id:string; watchId:string; watch:string; type:string; due:string; status:string; cost:number; provider:string; notes:string };
export type Listing = { id:string; title:string; price:number; condition:string; seller:string; image:string; location:string };
