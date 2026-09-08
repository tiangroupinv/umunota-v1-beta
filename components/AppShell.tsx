'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {Bell, CircleUserRound, Clock3, CreditCard, Home, MapPin, MessageSquareText, Search, ShieldCheck, Sparkles, UsersRound, ClipboardList, Plus, ChevronDown} from 'lucide-react';
import {createClient} from '@/lib/supabase';
import InstallBanner from './InstallBanner';

const nav=[
 [Home,'Home','/dashboard'],[Plus,'Post task','/tasks/new'],[UsersRound,'Find runner','/runners'],[ClipboardList,'My tasks','/tasks'],[MessageSquareText,'Community','/community'],[CreditCard,'Payments','/payments'],[ShieldCheck,'Trust & KYC','/kyc'],[CircleUserRound,'Profile','/profile']
] as const;
const areas=['Kigali','Gasabo','Kicukiro','Nyarugenge','Musanze','Huye','Rubavu'];

export default function AppShell({children}:{children:React.ReactNode}){
 const pathname=usePathname(); const [search,setSearch]=useState(''); const [area,setArea]=useState('Kigali'); const [name,setName]=useState('Account');
 useEffect(()=>{(async()=>{try{const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {data}=await supabase.from('profiles').select('full_name').eq('id',user.id).single();if(data?.full_name)setName(data.full_name);}catch{}})()},[]);
 const initials=name==='Account'?'U':name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
 return <div className="shell"><aside className="sidebar"><Link href="/dashboard" className="logo"><span className="logoMark"><Clock3 size={22}/></span><span><b>UMUNOTA</b><small>People. Time. Solutions.</small></span></Link><nav className="nav">{nav.map(([Icon,label,href])=>{const active=pathname===href||(href!='/tasks'&&pathname.startsWith(href+'/'));return <Link className={active?'active':''} href={href} key={href}><span className="navIcon"><Icon size={18}/></span><span className="label">{label}</span></Link>})}</nav><div className="sideTrust"><ShieldCheck size={18}/><div><b>Verified marketplace</b><small>Identity · tracked work · protected payments</small></div></div></aside><main className="main"><InstallBanner/><header className="topbar"><form className="searchBox" onSubmit={e=>{e.preventDefault();location.href='/tasks/new?title='+encodeURIComponent(search)}}><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="What do you need done?"/><button>Search</button></form><div className="locationSelect"><MapPin size={17}/><select value={area} onChange={e=>setArea(e.target.value)} aria-label="Location">{areas.map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={14}/></div><button className="iconButton" aria-label="Notifications"><Bell size={18}/></button><Link className="profileChip" href="/profile"><span className="avatar smallAvatar">{initials}</span><span className="profileName">{name}</span></Link></header>{children}</main></div>;
}
