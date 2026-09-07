'use client';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {DemoPost,DemoTask,DemoTaskStatus,initialPosts,initialTasks} from '@/lib/demo-data';

type Store={tasks:DemoTask[];posts:DemoPost[];addTask:(task:Omit<DemoTask,'id'|'events'|'createdAt'|'status'|'client'>)=>string;transitionTask:(id:string,status:DemoTaskStatus,label:string,note?:string)=>void;addPost:(body:string,rating:number,taskTitle?:string)=>void;addComment:(postId:string,body:string)=>void;markHelpful:(postId:string)=>void;resetDemo:()=>void};
const Ctx=createContext<Store|null>(null);
const KEY='umunota-demo-v2';
export default function Providers({children}:{children:React.ReactNode}){
 const [tasks,setTasks]=useState<DemoTask[]>(initialTasks); const [posts,setPosts]=useState<DemoPost[]>(initialPosts); const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const data=JSON.parse(raw);if(data.tasks)setTasks(data.tasks);if(data.posts)setPosts(data.posts)}}catch{}setHydrated(true)},[]);
 useEffect(()=>{if(hydrated)localStorage.setItem(KEY,JSON.stringify({tasks,posts}))},[tasks,posts,hydrated]);
 const value=useMemo<Store>(()=>({tasks,posts,
 addTask:(input)=>{const id=crypto.randomUUID();setTasks(v=>[{...input,id,status:'posted',client:'Aline M.',createdAt:'Just now',events:[{label:'Task posted',time:'Just now'}]},...v]);return id},
 transitionTask:(id,status,label,note)=>setTasks(v=>v.map(t=>t.id===id?{...t,status,events:[...t.events,{label,time:'Just now',note}]}:t)),
 addPost:(body,rating,taskTitle)=>setPosts(v=>[{id:crypto.randomUUID(),author:'Aline M.',avatar:'AM',body,rating,taskTitle,verifiedTask:Boolean(taskTitle),createdAt:'Just now',helpful:0,comments:[]},...v]),
 addComment:(postId,body)=>setPosts(v=>v.map(p=>p.id===postId?{...p,comments:[...p.comments,{id:crypto.randomUUID(),author:'Aline M.',body,createdAt:'Just now'}]}:p)),
 markHelpful:(postId)=>setPosts(v=>v.map(p=>p.id===postId?{...p,helpful:p.helpful+1}:p)),
 resetDemo:()=>{setTasks(initialTasks);setPosts(initialPosts)}
 }),[tasks,posts]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useDemo(){const v=useContext(Ctx);if(!v)throw new Error('useDemo must be inside Providers');return v}
