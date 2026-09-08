'use client';
import {useEffect,useRef,useState} from 'react';
import {Check,ChevronDown} from 'lucide-react';

export type DropdownOption={value:string;label:string;description?:string};
export default function CustomDropdown({value,onChange,options,label,icon:Icon,compact=false}:{value:string;onChange:(value:string)=>void;options:DropdownOption[];label:string;icon?:React.ComponentType<{size?:number}>;compact?:boolean}){
 const [open,setOpen]=useState(false);const ref=useRef<HTMLDivElement>(null);const selected=options.find(o=>o.value===value)||options[0];
 useEffect(()=>{const close=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close)},[]);
 return <div className={`customDropdown ${compact?'compact':''} ${open?'open':''}`} ref={ref}><button type="button" className="customDropdownTrigger" aria-haspopup="listbox" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{Icon&&<Icon size={17}/>}<span className="customDropdownText"><small>{label}</small><b>{selected?.label}</b></span><ChevronDown size={15} className="customDropdownChevron"/></button>{open&&<div className="customDropdownMenu" role="listbox" aria-label={label}>{options.map(option=><button type="button" role="option" aria-selected={option.value===value} className={option.value===value?'selected':''} key={option.value} onClick={()=>{onChange(option.value);setOpen(false)}}><span><b>{option.label}</b>{option.description&&<small>{option.description}</small>}</span>{option.value===value&&<Check size={16}/>}</button>)}</div>}</div>
}
