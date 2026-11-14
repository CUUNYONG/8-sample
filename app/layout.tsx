import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'상담 쉼 카페 | 햇살 속, 잠시 쉬어가는 시간',description:'신선한 브런치와 커피, 조용한 공간. 상담 쉼 카페의 1대1 상담을 통한 명상 프로그램을 만나보세요.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
