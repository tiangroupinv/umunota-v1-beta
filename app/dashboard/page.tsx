'use client';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import TaskCard from '@/components/TaskCard';
import { runners, services } from '@/lib/demo-data';
import { useDemo } from '@/app/providers';

const activity = [
  ['✓','Payment released','Groceries task completed successfully','2h'],
  ['↗','Runner accepted','Document pickup is ready to start','4h'],
  ['★','New rating received','Your latest task was rated 5.0','Yesterday'],
];

export default function Dashboard() {
  const { tasks, posts } = useDemo();
  return <AppShell>
    <div className="layout3">
      <div className="contentCol">
        <section className="hero">
          <div className="heroCopy">
            <span className="eyebrow gold">TRUSTED EVERYDAY HELP IN KIGALI</span>
            <h1>Your time matters.<br/><span className="gold">Let someone help.</span></h1>
            <p>Post what you need, choose a trusted runner, follow every stage and approve payment only when the work is complete.</p>
            <div className="heroActions"><Link className="btn btn-gold" href="/tasks/new">＋ Post a task</Link><Link className="btn btn-glass" href="/runners">◎ Find a runner</Link></div>
            <div className="trustRow"><span>⚡ Fast matching</span><span>✓ Verified runners</span><span>▣ Protected workflow</span><span>★ Mutual ratings</span></div>
          </div>
          <div className="heroVisual"><div className="timeOrb">◷</div><span className="script">More time<br/>for what matters.</span></div>
        </section>

        <section className="section">
          <div className="section-head"><div><span className="eyebrow">POPULAR SERVICES</span><h2>What do you need done?</h2></div><Link className="gold" href="/tasks/new">Post something else →</Link></div>
          <div className="grid services">{services.slice(0,6).map(s=><Link href={'/tasks/new?title='+encodeURIComponent(s.title)} className="card service" key={s.title}><div className="serviceIcon">{s.icon}</div><b>{s.title}</b><p>{s.desc}</p><span className="serviceArrow">↗</span></Link>)}</div>
        </section>

        <section className="section">
          <div className="section-head"><div><span className="eyebrow">LIVE WORK</span><h2>Your active tasks</h2></div><Link className="gold" href="/tasks">View all tasks →</Link></div>
          <div className="grid twocol">{tasks.slice(0,4).map(t=><TaskCard task={t} key={t.id}/>)}</div>
        </section>

        <section className="section grid twocol">
          <div className="card" style={{padding:18}}>
            <div className="section-head"><div><span className="eyebrow">NEAR YOU</span><h2>Trusted runners</h2></div><Link className="gold" href="/runners">See all →</Link></div>
            {runners.slice(0,4).map(r=><div className="runnerRow" key={r.id}><div className="identity"><div className="avatar">{r.initials}</div><div><b>{r.name} {r.verified&&<span className="verified">✓</span>}</b><div className="small"><span className="gold">★ {r.rating}</span> · {r.tasks} tasks · {r.distance} · <span className={r.online?'online':'muted'}>{r.online?'Online':'Offline'}</span></div></div></div><Link className="btn btn-small btn-dark" href={'/runners#'+r.id}>Request</Link></div>)}
          </div>
          <div className="card" style={{padding:18}}>
            <div className="section-head"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>What changed</h2></div><Link className="gold" href="/tasks">Open timeline →</Link></div>
            {activity.map(([icon,title,body,time])=><div className="runnerRow" key={title}><div className="identity"><div className="avatar smallAvatar">{icon}</div><div><b>{title}</b><div className="small muted">{body}</div></div></div><span className="small muted">{time}</span></div>)}
          </div>
        </section>

        <section className="section">
          <div className="section-head"><div><span className="eyebrow">COMMUNITY</span><h2>Experiences from completed tasks</h2></div><Link className="gold" href="/community">Open community →</Link></div>
          <div className="grid twocol">{posts.slice(0,2).map(p=><div className="card miniPost" style={{padding:18}} key={p.id}><div className="identity"><div className="avatar">{p.avatar}</div><div><b>{p.author}</b><div className="small muted">{p.verifiedTask?'✓ Verified task':'Community post'} · {p.createdAt}</div></div></div><p>{p.body}</p><span className="stars">{'★'.repeat(p.rating)}</span></div>)}</div>
        </section>
      </div>

      <aside className="sidecards">
        <div className="card walletCard"><span className="eyebrow">WALLET BALANCE</span><div className="kpi">12,500 <small>RWF</small></div><p className="small muted">Protected payments stay linked to their task history.</p><div className="walletActions"><Link className="btn btn-gold" href="/payments">Top up</Link><Link className="btn btn-dark" href="/payments">Transactions</Link></div></div>
        <div className="card trustCard"><div className="trustRing"><b>92</b><small>/100</small></div><div><span className="eyebrow">TRUST SCORE</span><h3>Strong profile</h3><p>Identity · task history · ratings · reliability</p><Link href="/kyc" className="gold">View trust center →</Link></div></div>
        <div className="card"><span className="eyebrow">QUICK ACTIONS</span><div className="quickGrid"><Link href="/tasks/new">＋<span>Post task</span></Link><Link href="/runners">◎<span>Find runner</span></Link><Link href="/tasks/new">◷<span>Schedule task</span></Link><Link href="/tasks">↻<span>Repeat task</span></Link></div></div>
        <div className="card safetyCard"><span>◈</span><div><b>UMUNOTA Protection</b><p>Tracked stages, task evidence, ratings and dispute records in one place.</p><Link href="/kyc" className="gold small">How protection works →</Link></div></div>
        <div className="card" style={{padding:18}}><span className="eyebrow gold">EARN WITH YOUR TIME</span><h3>Become a trusted runner</h3><p className="small muted">Complete your profile, verify your identity and accept nearby safe tasks.</p><Link href="/runners" className="btn btn-gold btn-wide">Explore runner mode</Link></div>
      </aside>
    </div>
  </AppShell>;
}
