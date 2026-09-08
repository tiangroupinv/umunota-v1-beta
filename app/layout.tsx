import './globals.css';
import './marketing-admin.css';
import './production.css';
import './launch.css';
import './business.css';
import './community.css';
import './platform.css';
import './settings.css';
import './brand.css';
import './controls.css';
import type {Metadata} from 'next';
import Providers from './providers';
import {LanguageProvider} from '@/components/LanguageProvider';

export const metadata:Metadata={
  title:'UMUNOTA — Tasks. People. A Better Tomorrow.',
  description:'Verified everyday help marketplace in Rwanda — a Tian Group Innovation Ltd project.',
  manifest:'/manifest.webmanifest',
  themeColor:'#090a0c',
  icons:{icon:'/umunota-icon.svg',apple:'/umunota-icon.svg'},
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body><LanguageProvider><Providers>{children}</Providers></LanguageProvider></body></html>
}
