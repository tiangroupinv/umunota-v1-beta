'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
const nav=[['⌂','Home','/dashboard'],['＋','Post task','/tasks/new'],['◎','Find runner','/runners'],['▤','My tasks','/tasks'],['✦','Community','/community'],['◇','Payments','/payments'],['✓','Trust & KYC','/kyc'],['○','Profile','/profile']];
export default function AppShell({children}:{children:React.ReactNode}){
 const pathname=usePathname(); const [search,setSearch]=useState('');
 return <div className="shell"><aside className="sidebar"><Link href="/dashboard" className="logo"><span className="logoMark">◷</span><span><b>UMUNOTA</b><small>People. Time. Solutions.</small></span></Link><nav className="nav">{nav.map(([i,l,h])=>{const active=pathname===h||(h!='/tasks'&&pathname.startsWith(h+'/'));return <Link className={active?'active':''} href={h} key={h}><span className="navIcon">{i}</span><span className="label">{l}</span></Link>})}</nav><div className="sideTrust"><span className="statusDot"/> <b>Trust protected</b><small>Verified identities · tracked work · protected payments</small></div></aside><main className="main"><header className="topbar"><form className="searchBox" onSubmit={e=>{e.preventDefault();location.href='/tasks/new?title='+encodeURIComponent(search)}}><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="What do you need done today?"/><button>Search</button></form><span className="location">⌖ Kigali</span><Link className="profileChip" href="/profile"><span className="avatar smallAvatar">AM</span><span className="profileName">Aline M.</span><span>⌄</span></Link></header>{children}</main></div>
}
