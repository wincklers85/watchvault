import {ImageResponse} from 'next/og';
export const size={width:180,height:180};export const contentType='image/png';
export default function AppleIcon(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#0d1118',borderRadius:38,color:'#d8ad5b',fontSize:82,fontWeight:900,fontFamily:'sans-serif',border:'7px solid #d8ad5b'}}>W</div>,size)}
