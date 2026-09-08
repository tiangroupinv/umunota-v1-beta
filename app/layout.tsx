import './globals.css';
import './marketing-admin.css';
import './production.css';
import './launch.css';
import './business.css';
import type {Metadata} from 'next';
import Providers from './providers';

export const metadata:Metadata={
  title:'UMUNOTA — People. Time. Solutions.',
  description:'Verified everyday help marketplace in Rwanda',
  manifest:'/manifest.webmanifest',
  themeColor:'#090a0c',
  icons:{icon:'/umunota-icon.svg',apple:'/umunota-icon.svg'},
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body><Providers>{children}</Providers></body></html>
}
