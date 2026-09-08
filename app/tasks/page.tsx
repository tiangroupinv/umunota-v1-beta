'use client';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@/lib/supabase';
import {BriefcaseBusiness, CalendarClock, MapPin, Plus} from 'lucide-react';

type Task={id:string;title:string;status:string;budget_rwf:number;location_text:string;due_at:string|null;created_at:string;customer_id:string;runner_id:string|null};
export default function Tasks(){
 const [tasks,setTasks]=useState<Task[]>([]);const [filter,setFilter]=useState('all');const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 useEffect(()=>{(async()=>{try{const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user){location.href='/login?next=/tasks';return}const {data,error}=await supabase.from('tasks').select('id,title,status,budget_rwf,location_text,due_at,created_at,customer_id,runner_id').or(`customer_id.eq.${user.id},runner_id.eq.${user.id}`).order('created_at',{ascending:false});if(error)throw error;setTasks(data||[])}catch(e){setError(e instanceof Error?e.message:'Unable to load tasks.')}finally{setLoading(false)}})()},[]);
 const shown=useMemo(()=>tasks.filter(t=>filter==='all'||(filter==='completed'?t.status==='paid':t.status===filter)),[tasks,filter]);
 return <AppShell><div className="pageHead"><div><span className="eyebrow">TASK WORKSPACE</span><h1>My tasks</h1><p>Live task records from your UMUNOTA account.</p></div><Link className="btn btn-gold" href="/tasks/new"><Plus size={17}/> Post a task</Link></div><div className="filterBar customTabs">{[['all','All'],['posted','Open'],['in_progress','In progress'],['payment_requested','Needs approval'],['completed','Completed']].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} className={filter===v?'active':''}>{l}</button>)}</div>{error&&<div className="errorBox">{error}</div>}{loading?<div className="card loadingCard">Loading your tasks...</div>:<div className="productionTaskGrid">{shown.map(t=><Link href={`/tasks/${t.id}`} className="productionTask" key={t.id}><div className="taskTop"><span className="taskState">{t.status.replaceAll('_',' ')}</span><strong>{t.budget_rwf.toLocaleString()} RWF</strong></div><h3>{t.title}</h3><div className="taskMeta"><span><MapPin size={15}/>{t.location_text}</span>{t.due_at&&<span><CalendarClock size={15}/>{new Date(t.due_at).toLocaleString()}</span>}</div></Link>)}{!shown.length&&<div className="empty card"><BriefcaseBusiness size={32} className="goldIcon"/><h3>No matching tasks</h3><p>Tasks you post or accept will appear here from the production database.</p></div>}</div>}</AppShell>;
}
