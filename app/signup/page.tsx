'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {createClient} from '@/lib/supabase';
import {Clock3} from 'lucide-react';

const LEGAL_VERSION='2026-09-08';
export default function Signup(){
 const router=useRouter(); const [agree,setAgree]=useState(false); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault(); setErr(''); const f=new FormData(e.currentTarget);
  const name=String(f.get('name')||'').trim(); const email=String(f.get('email')||'').trim(); const phone=String(f.get('phone')||'').trim(); const password=String(f.get('password')||'');
  if(name.length<2||!email.includes('@')||password.length<8||!agree){setErr('Complete all fields, use at least 8 password characters and accept the Terms, Privacy Policy and Safety rules.');return}
  setBusy(true);
  try{
    const supabase=createClient(); const language=localStorage.getItem('umunota-language')||'en';
    const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,phone,legal_acceptance_version:LEGAL_VERSION,language},emailRedirectTo:`${location.origin}/auth/callback?next=/kyc`}});
    if(error){setErr(error.message);return}
    router.push('/kyc');
  }catch(e){setErr(e instanceof Error?e.message:'Unable to create your account.');}
  finally{setBusy(false)}
 }
 return <main className="authPage"><div className="authBrand"><div className="logoMark large"><Clock3 size={24}/></div><b>UMUNOTA</b><span>People. Time. Solutions.</span><small>A Tian Group Innovation Ltd project</small></div><form className="authCard" onSubmit={submit}><span className="eyebrow">CREATE VERIFIED ACCOUNT</span><h1>Join UMUNOTA</h1><p>Marketplace participation requires identity verification. Paid task participation is intended for users who can legally enter the marketplace agreement.</p><div className="field"><label>Full legal name</label><input name="name" required placeholder="Your legal name" autoComplete="name"/></div><div className="grid twocol"><div className="field"><label>Email</label><input name="email" required type="email" placeholder="you@example.com" autoComplete="email"/></div><div className="field"><label>Phone</label><input name="phone" required type="tel" placeholder="+250 7..." autoComplete="tel"/></div></div><div className="field"><label>Password</label><input name="password" required type="password" placeholder="8+ characters" autoComplete="new-password"/></div><label className="checkRow"><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/><span><b>I agree to UMUNOTA’s legal and safety rules</b><small>By creating an account, I agree to the <Link href="/legal/terms" target="_blank">Terms & Conditions</Link>, acknowledge the <Link href="/legal/privacy" target="_blank">Privacy Policy</Link>, and agree to the <Link href="/legal/safety" target="_blank">Safety & Acceptable Use Policy</Link>. Policy version {LEGAL_VERSION}.</small></span></label>{err&&<div className="errorBox">{err}</div>}<button disabled={busy} className="btn btn-gold btn-wide asyncBtn" aria-busy={busy}>{busy?<><Clock3 size={18} className="spinIcon"/> Creating account...</>:<><Clock3 size={18}/> Create account</>}</button><div className="authFoot"><span>Already have an account?</span><Link href="/login">Sign in</Link></div><div className="legalFooterLinks"><Link href="/legal">Legal & Safety Center</Link><Link href="/tian">Tian Group Innovation Ltd</Link></div></form></main>;
}
