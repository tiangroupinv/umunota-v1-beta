'use client';
import {useEffect} from 'react';
import {useLanguage} from './LanguageProvider';

const skip=new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','TEXTAREA','OPTION']);
const cache=new Map<string,Record<string,string>>();

function eligibleText(node:Text){
 const parent=node.parentElement;if(!parent||skip.has(parent.tagName)||parent.closest('[data-no-translate]'))return false;
 const value=node.nodeValue?.trim()||'';return value.length>1&&/[A-Za-z]/.test(value);
}

export default function AutoTranslate(){
 const {lang}=useLanguage();
 useEffect(()=>{
  if(typeof document==='undefined')return;
  let stopped=false,timer:number|undefined;
  const originals=new WeakMap<Text,string>();
  const attrOriginals=new WeakMap<Element,Map<string,string>>();
  const attrs=['placeholder','title','aria-label'];
  async function translate(items:string[]){
   if(lang==='en')return Object.fromEntries(items.map(x=>[x,x]));
   const missing=items.filter(x=>!cache.get(x)?.[lang]);
   if(missing.length){
    try{const r=await fetch('/api/translate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({language:lang,texts:missing})});if(r.ok){const data=await r.json();missing.forEach((x,i)=>{const current=cache.get(x)||{};current[lang]=data.translations?.[i]||x;cache.set(x,current)})}}catch{}
   }
   return Object.fromEntries(items.map(x=>[x,cache.get(x)?.[lang]||x]));
  }
  async function run(){
   const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes:Text[]=[];let n:Node|null;
   while((n=walker.nextNode())){const t=n as Text;if(eligibleText(t)){if(!originals.has(t))originals.set(t,t.nodeValue||'');nodes.push(t)}}
   const elements=[...document.querySelectorAll<HTMLElement>('[placeholder],[title],[aria-label]')].filter(e=>!e.closest('[data-no-translate]'));
   const values=new Set<string>();nodes.forEach(t=>values.add((originals.get(t)||'').trim()));elements.forEach(e=>attrs.forEach(a=>{const v=e.getAttribute(a);if(v&&/[A-Za-z]/.test(v)){let map=attrOriginals.get(e);if(!map){map=new Map();attrOriginals.set(e,map)}if(!map.has(a))map.set(a,v);values.add(map.get(a)!)}}));
   if(lang==='en'){nodes.forEach(t=>{const o=originals.get(t);if(o!==undefined)t.nodeValue=o});elements.forEach(e=>{const m=attrOriginals.get(e);m?.forEach((v,a)=>e.setAttribute(a,v))});return}
   const list=[...values].filter(Boolean);for(let i=0;i<list.length;i+=60){const batch=list.slice(i,i+60),map=await translate(batch);if(stopped)return;nodes.forEach(t=>{const o=originals.get(t);if(o&&batch.includes(o.trim()))t.nodeValue=o.replace(o.trim(),map[o.trim()]||o.trim())});elements.forEach(e=>{const m=attrOriginals.get(e);m?.forEach((v,a)=>{if(batch.includes(v))e.setAttribute(a,map[v]||v)})})}
  }
  const schedule=()=>{window.clearTimeout(timer);timer=window.setTimeout(run,180)};run();const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});return()=>{stopped=true;observer.disconnect();window.clearTimeout(timer)};
 },[lang]);
 return null;
}
