'use client';
import {useEffect,useState} from 'react';
import {Download, X} from 'lucide-react';

type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
export default function InstallBanner(){
 const [promptEvent,setPromptEvent]=useState<InstallPromptEvent|null>(null); const [visible,setVisible]=useState(false);
 useEffect(()=>{const handler=(e:Event)=>{e.preventDefault();setPromptEvent(e as InstallPromptEvent);setVisible(true)};window.addEventListener('beforeinstallprompt',handler);if(window.matchMedia('(display-mode: standalone)').matches)setVisible(false);return()=>window.removeEventListener('beforeinstallprompt',handler)},[]);
 async function install(){if(!promptEvent)return;await promptEvent.prompt();const choice=await promptEvent.userChoice;if(choice.outcome==='accepted')setVisible(false);setPromptEvent(null)}
 if(!visible)return null;
 return <div className="installBanner"><div className="installIcon"><Download size={19}/></div><div><b>Install UMUNOTA</b><span>Faster access from your home screen.</span></div><button onClick={install} className="installAction">Install</button><button onClick={()=>setVisible(false)} className="installClose" aria-label="Close"><X size={17}/></button></div>;
}
