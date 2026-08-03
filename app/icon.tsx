import {ImageResponse} from 'next/og';
export const size={width:512,height:512};export const contentType='image/png';
export default function Icon(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(145deg,#171c26,#090b10)',borderRadius:96,color:'#d8ad5b',fontSize:210,fontWeight:900,fontFamily:'sans-serif',border:'18px solid #d8ad5b',boxShadow:'inset 0 0 0 16px #090b10'}}>W</div>,size)}
