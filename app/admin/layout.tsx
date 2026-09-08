import Link from 'next/link';
import {Building2} from 'lucide-react';

export default function AdminLayout({children}:{children:React.ReactNode}){
 return <><Link href="/admin/business" className="adminBusinessShortcut"><Building2 size={17}/> Business manager</Link>{children}</>;
}
