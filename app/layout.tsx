import type { Metadata, Viewport } from 'next';
import './globals.css';
import './mobile.css';
import './v2.css';
import './passport-print.css';
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||'https://watchvault.onrender.com';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'WatchVault — Il social dei collezionisti',template:'%s | WatchVault'},description:'Cataloga la tua collezione di orologi, conserva fotografie e manutenzioni, parla con altri appassionati e scopri il marketplace.',applicationName:'WatchVault',manifest:'/manifest.webmanifest',icons:{icon:[{url:'/icon',type:'image/png'}],apple:[{url:'/apple-icon',type:'image/png'}]},appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'WatchVault'},openGraph:{type:'website',locale:'it_IT',url:siteUrl,siteName:'WatchVault',title:'WatchVault — Ogni orologio ha una storia',description:'Il social professionale per catalogare, preservare e condividere la tua collezione di orologi.',images:[{url:'/opengraph-image',width:1200,height:630,alt:'WatchVault — Il social dei collezionisti'}]},twitter:{card:'summary_large_image',title:'WatchVault — Ogni orologio ha una storia',description:'Collezione, manutenzioni, community e marketplace in un’unica piattaforma.',images:['/opengraph-image']}};
export const viewport:Viewport={themeColor:'#090b10',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="it"><body>{children}</body></html>}
