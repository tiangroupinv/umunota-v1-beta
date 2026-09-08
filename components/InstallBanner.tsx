'use client';
import {useEffect,useState} from 'react';
import {Download, X} from 'lucide-react';

type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
export default function InstallBanner(){
 const [promptEvent,setPromptEvent]=useState<InstallPromptEvent|null>(null);const [visible,setVisible]=useState(false);const [hint,setHint]=useState(false);
 useEffect(()=>{const standalone=window.matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;const mobile=window.matchMedia('(max-width: 700px)').matches;if(mobile&&!standalone&&sessionStorage.getItem('umunota-install-dismissed')!=='1')setVisible(true);const handler=(e:Event)=>{e.preventDefault();setPromptEvent(e as InstallPromptEvent);setVisible(true)};window.addEventListener('beforeinstallprompt',handler);return()=>window.removeEventListener('beforeinstallprompt',handler)},[]);
 async function install(){if(promptEvent){await promptEvent.prompt();const choice=await promptEvent.userChoice;if(choice.outcome==='accepted')setVisible(false);setPromptEvent(null);return}setHint(true)}
 function dismiss(){sessionStorage.setItem('umunota-install-dismissed','1');setVisible(false)}
 if(!visible)return null;
 return <div className="installBanner"><div className="installIcon"><Download size={19}/></div><div><b>Install UMUNOTA</b><span>{hint?'Use your browser menu and choose Add to Home Screen.':'Get faster access from your home screen.'}</span></div><button onClick={install} className="installAction">{promptEvent?'Install':'How to install'}</button><button onClick={dismiss} className="installClose" aria-label="Close"><X size={17}/></button></div>;
}
