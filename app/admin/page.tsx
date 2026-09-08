import Link from 'next/link';
import {Clock3} from 'lucide-react';
import { requireAdmin } from '../../lib/admin';
import { deletePost, setKycStatus, setPaymentStatus, setTaskStatus, setUserRole, updateDashboardAd } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const taskStatuses=['posted','funded','accepted','in_progress','completion_submitted','payment_requested','approved','disputed','paid','cancelled'];
const paymentStatuses=['pending','authorized','requested','released','refunded','disputed','failed'];

export default async function AdminPage(){
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (!hasSupabase) return <main className="adminSetupPage"><section className="adminSetupCard"><span className="eyebrow">ADMIN SETUP REQUIRED</span><h1>Connect production Supabase</h1><p>The admin console needs the production Supabase environment variables configured in Vercel.</p><div className="notice">Add <b>NEXT_PUBLIC_SUPABASE_URL</b> and <b>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</b> to Production, then redeploy.</div><div className="heroActions"><Link className="btn btn-gold" href="/">Open landing page</Link><Link className="btn btn-dark" href="/dashboard">Open dashboard</Link></div></section></main>;

  const {supabase,profile}=await requireAdmin();
  const [profilesRes,tasksRes,paymentsRes,postsRes,adsRes]=await Promise.all([
    supabase.from('profiles').select('id,full_name,username,phone,role,kyc_status,rating,created_at').order('created_at',{ascending:false}).limit(20),
    supabase.from('tasks').select('id,title,status,budget_rwf,customer_id,runner_id,created_at').order('created_at',{ascending:false}).limit(20),
    supabase.from('payments').select('id,task_id,amount_rwf,status,provider,created_at').order('created_at',{ascending:false}).limit(20),
    supabase.from('posts').select('id,body,author_id,task_id,created_at').order('created_at',{ascending:false}).limit(12),
    supabase.from('dashboard_ads').select('id,slot,eyebrow,title,body,cta_label,cta_url,is_active,updated_at').order('slot',{ascending:true}),
  ]);
  const users=profilesRes.data??[];const tasks=tasksRes.data??[];const payments=paymentsRes.data??[];const posts=postsRes.data??[];const ads=adsRes.data??[];
  const volume=payments.filter(p=>p.status==='released').reduce((s,p)=>s+(p.amount_rwf??0),0);
  const disputes=tasks.filter(t=>t.status==='disputed').length+payments.filter(p=>p.status==='disputed').length;

  return <main className="adminPage">
    <aside className="adminSide"><Link className="adminBrand" href="/"><Clock3 size={21}/><b>UMUNOTA</b></Link><span>ADMIN CONTROL</span><nav><a href="#overview">Overview</a><a href="#ads">Dashboard banners</a><a href="#users">Users & KYC</a><a href="#tasks">Tasks</a><a href="#payments">Payments</a><a href="#community">Community</a></nav><Link className="adminBack" href="/dashboard">User dashboard</Link></aside>
    <section className="adminMain">
      <header className="adminTop"><div><span className="eyebrow">PLATFORM OPERATIONS</span><h1>Admin dashboard</h1><p>Signed in as {profile.full_name||'Administrator'}. Live data from Supabase.</p></div><span className="adminLive">Production</span></header>
      <section id="overview" className="adminKpis"><article><span>Users</span><b>{users.length}</b><small>{users.filter(u=>u.role==='runner').length} runners</small></article><article><span>Active tasks</span><b>{tasks.filter(t=>!['paid','cancelled'].includes(t.status)).length}</b><small>{tasks.length} recent</small></article><article><span>Released volume</span><b>{volume.toLocaleString()} RWF</b><small>recent records</small></article><article><span>Disputes</span><b>{disputes}</b><small>needs attention</small></article></section>

      <section id="ads" className="adminPanel"><div className="adminSectionHead"><div><span className="eyebrow">MONETIZATION & PROMOTION</span><h2>Dashboard banner placements</h2><p>Manage the five promotional placements shown inside the user dashboard. Disable any slot without deleting it.</p></div></div><div className="adminAdGrid">{ads.map(ad=><form action={updateDashboardAd} className="adminAdEditor" key={ad.id}><input type="hidden" name="ad_id" value={ad.id}/><div className="adminAdSlot"><span>Placement {ad.slot}</span><label><input type="checkbox" name="is_active" defaultChecked={ad.is_active}/> Active</label></div><label>Eyebrow<input name="eyebrow" defaultValue={ad.eyebrow}/></label><label>Headline<input name="title" defaultValue={ad.title} required/></label><label>Message<textarea name="body" defaultValue={ad.body} required/></label><div className="adminAdTwo"><label>Button label<input name="cta_label" defaultValue={ad.cta_label||''}/></label><label>Button URL<input name="cta_url" defaultValue={ad.cta_url||''}/></label></div><small>Last updated {new Date(ad.updated_at).toLocaleString()}</small><button className="adminPrimary">Save placement {ad.slot}</button></form>)}</div></section>

      <section id="users" className="adminPanel"><div className="adminSectionHead"><div><span className="eyebrow">TRUST & ACCESS</span><h2>Users and KYC</h2></div></div><div className="adminTableWrap"><table className="adminTable"><thead><tr><th>User</th><th>Role</th><th>KYC</th><th>Rating</th><th>Manage</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><b>{u.full_name||u.username||'New user'}</b><small>{u.phone||u.id.slice(0,8)}</small></td><td>{u.role}</td><td><span className={`adminStatus ${u.kyc_status}`}>{u.kyc_status}</span></td><td>{Number(u.rating||0).toFixed(1)}</td><td><div className="adminActions"><form action={setUserRole}><input type="hidden" name="user_id" value={u.id}/><select name="role" defaultValue={u.role}><option>customer</option><option>runner</option><option>admin</option></select><button>Save role</button></form><form action={setKycStatus}><input type="hidden" name="user_id" value={u.id}/><select name="kyc_status" defaultValue={u.kyc_status}><option>not_started</option><option>pending</option><option>verified</option><option>rejected</option></select><button>Save KYC</button></form></div></td></tr>)}</tbody></table></div></section>

      <section id="tasks" className="adminPanel"><div className="adminSectionHead"><div><span className="eyebrow">MARKETPLACE</span><h2>Task operations</h2></div></div><div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Task</th><th>Budget</th><th>Status</th><th>Action</th></tr></thead><tbody>{tasks.map(t=><tr key={t.id}><td><Link href={`/tasks/${t.id}`}><b>{t.title}</b></Link><small>{new Date(t.created_at).toLocaleDateString()}</small></td><td>{t.budget_rwf.toLocaleString()} RWF</td><td>{t.status}</td><td><form className="adminInline" action={setTaskStatus}><input type="hidden" name="task_id" value={t.id}/><select name="status" defaultValue={t.status}>{taskStatuses.map(s=><option key={s}>{s}</option>)}</select><button>Update</button></form></td></tr>)}</tbody></table></div></section>

      <section id="payments" className="adminPanel"><div className="adminSectionHead"><div><span className="eyebrow">MONEY MOVEMENT</span><h2>Payments and disputes</h2></div></div><div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Payment</th><th>Amount</th><th>Provider</th><th>Status</th><th>Action</th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td><b>{p.id.slice(0,8)}</b><small>Task {p.task_id.slice(0,8)}</small></td><td>{p.amount_rwf.toLocaleString()} RWF</td><td>{p.provider||'Not assigned'}</td><td>{p.status}</td><td><form className="adminInline" action={setPaymentStatus}><input type="hidden" name="payment_id" value={p.id}/><select name="status" defaultValue={p.status}>{paymentStatuses.map(s=><option key={s}>{s}</option>)}</select><button>Update</button></form></td></tr>)}</tbody></table></div></section>

      <section id="community" className="adminPanel"><div className="adminSectionHead"><div><span className="eyebrow">SAFETY & MODERATION</span><h2>Community content</h2></div></div><div className="moderationGrid">{posts.map(p=><article key={p.id}><p>{p.body}</p><small>{new Date(p.created_at).toLocaleString()}</small><form action={deletePost}><input type="hidden" name="post_id" value={p.id}/><button className="adminDanger">Remove post</button></form></article>)}</div></section>
    </section>
  </main>;
}
