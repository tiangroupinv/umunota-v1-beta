'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {createClient} from '@/lib/supabase';
import {Chrome, Github, LockKeyhole} from 'lucide-react';

export default function Login(){
  const router=useRouter();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);

  async function oauth(provider:'google'|'github'){
    setErr('');
    try{
      const supabase=createClient();
      const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:`${location.origin}/auth/callback?next=/dashboard`}});
      if(error)setErr(error.message);
    }catch(e){setErr(e instanceof Error?e.message:'Authentication is unavailable.');}
  }

  async function submit(e:React.FormEvent){
    e.preventDefault(); setErr('');
    if(!email.includes('@')||password.length<8){setErr('Enter a valid email and a password with at least 8 characters.');return}
    setBusy(true);
    try{
      const supabase=createClient();
      const {error}=await supabase.auth.signInWithPassword({email,password});
      if(error){setErr(error.message);return}
      router.replace('/dashboard'); router.refresh();
    }catch(e){setErr(e instanceof Error?e.message:'Unable to sign in.');}
    finally{setBusy(false)}
  }

  return <main className="authPage"><div className="authBrand"><div className="logoMark large"><LockKeyhole size={24}/></div><b>UMUNOTA</b><span>People. Time. Solutions.</span></div><form className="authCard" onSubmit={submit}><span className="eyebrow">SECURE ACCESS</span><h1>Sign in to UMUNOTA</h1><p>Access your verified profile, tasks, payments and community.</p><div className="oauthGrid"><button type="button" className="oauthBtn" onClick={()=>oauth('google')}><Chrome size={18}/> Continue with Google</button><button type="button" className="oauthBtn" onClick={()=>oauth('github')}><Github size={18}/> Continue with GitHub</button></div><div className="authDivider"><span>or use email</span></div><div className="field"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required/></div><div className="field"><label>Password</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" required/></div>{err&&<div className="errorBox">{err}</div>}<button disabled={busy} className="btn btn-gold btn-wide">{busy?'Signing in...':'Sign in'}</button><div className="authFoot"><span>New to UMUNOTA?</span><Link href="/signup">Create account</Link></div></form></main>;
}
