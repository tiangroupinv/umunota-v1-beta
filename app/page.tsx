import Link from 'next/link';
import LanguageMenu from '@/components/LanguageMenu';
import {ArrowRight,BadgeCheck,CalendarClock,Clock3,CreditCard,FileCheck2,MapPin,PackageCheck,Printer,ShieldCheck,ShoppingBasket,UsersRound,WashingMachine,Wrench} from 'lucide-react';

const services=[
 {icon:ShoppingBasket,title:'Market runs',body:'Groceries, household items and quick purchases.'},
 {icon:PackageCheck,title:'Pickup & delivery',body:'Documents, parcels and everyday errands.'},
 {icon:Wrench,title:'Repair errands',body:'Take phones, shoes, clothes or other items for repair and return.'},
 {icon:WashingMachine,title:'Laundry & cleaning',body:'Pickup, drop-off and trusted local help.'},
 {icon:Printer,title:'Print & collect',body:'Print documents and have them collected for you.'},
 {icon:Clock3,title:'Other safe local tasks',body:'Describe a safe, legal task and find help nearby.'},
];

const examples=[
 {title:'Buy groceries from Kimironko Market',category:'Market shopping',location:'Gasabo, Kigali',budget:'18,500 RWF',time:'Today · 18:30'},
 {title:'Collect printed documents and deliver them',category:'Documents',location:'Nyarugenge, Kigali',budget:'4,500 RWF',time:'Tomorrow · 09:00'},
 {title:'Take my phone to repair and return it',category:'Repair errand',location:'Kicukiro, Kigali',budget:'7,000 RWF',time:'Tomorrow · 15:00'},
];

const steps=[
 ['01','Verify','Complete the required identity checks before marketplace participation.'],
 ['02','Post','Describe the task, budget, area, deadline and completion requirement.'],
 ['03','Match','An eligible verified runner accepts the funded task.'],
 ['04','Complete','The runner finishes the work and submits the required evidence.'],
 ['05','Review','The customer approves the result or opens a dispute.'],
 ['06','Close','Payment confirmation and ratings complete the task history.'],
];

export default function Page(){return <main className="landingModern">
 <nav className="modernNav">
  <Link href="/" className="modernLogo"><img src="/umunota-logo-approved.svg" alt="UMUNOTA — Tasks. People. A Better Tomorrow."/></Link>
  <div className="modernNavLinks"><a href="#services">Services</a><a href="#examples">Examples</a><a href="#how">How it works</a><a href="#trust">Trust</a></div>
  <div className="modernNavActions"><LanguageMenu/><Link href="/login" className="plainLink">Log in</Link><Link href="/signup" className="modernPrimary">Get started <ArrowRight size={16}/></Link></div>
 </nav>

 <section className="modernHero">
  <div className="modernHeroMain">
   <span className="modernEyebrow">RWANDA'S LOCAL TASK MARKETPLACE</span>
   <h1>Everyday help,<br/>without the everyday hassle.</h1>
   <p>Post safe local tasks, connect with verified people nearby, follow progress and keep every important step tied to one clear record.</p>
   <div className="modernHeroActions"><Link href="/signup" className="modernPrimary">Post a task <ArrowRight size={17}/></Link><Link href="/login" className="modernTextLink">Find tasks to do <ArrowRight size={17}/></Link></div>
  </div>
  <div className="modernHeroSide">
   <div className="modernMetric"><b>01</b><span>Post what you need done</span></div>
   <div className="modernMetric"><b>02</b><span>Match with a verified runner</span></div>
   <div className="modernMetric"><b>03</b><span>Track completion and payment</span></div>
  </div>
 </section>

 <section className="modernProofBar">
  <span><BadgeCheck size={18}/> Verified marketplace access</span>
  <span><ShieldCheck size={18}/> Server-checked task flow</span>
  <span><CreditCard size={18}/> Task-linked payment records</span>
  <span><FileCheck2 size={18}/> Completion evidence and ratings</span>
 </section>

 <section id="services" className="modernSection">
  <div className="modernSectionIntro"><span className="modernEyebrow">EVERYDAY HELP</span><h2>Useful work, not another complicated app category.</h2><p>UMUNOTA is built for practical tasks people already need help with every day.</p></div>
  <div className="modernServiceList">{services.map(({icon:Icon,title,body},i)=><article key={title}><span className="serviceNumber">0{i+1}</span><Icon size={22}/><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
 </section>

 <section id="examples" className="modernSection modernExamples">
  <div className="modernSectionIntro"><span className="modernEyebrow">EXAMPLE TASKS</span><h2>A task should be understandable before anyone accepts it.</h2><p>These are examples only, not live marketplace listings.</p></div>
  <div className="modernTaskRows">{examples.map(t=><article key={t.title}><div className="taskLead"><span>{t.category}</span><h3>{t.title}</h3></div><div className="taskMeta"><span><MapPin size={15}/>{t.location}</span><span><CalendarClock size={15}/>{t.time}</span></div><strong>{t.budget}</strong><ArrowRight size={18}/></article>)}</div>
  <div className="modernExampleNote">Real tasks are displayed according to account access and task visibility rules.</div>
 </section>

 <section id="how" className="modernSection modernHow">
  <div className="modernSectionIntro"><span className="modernEyebrow">HOW IT WORKS</span><h2>One simple flow from request to completion.</h2></div>
  <div className="modernTimeline">{steps.map(([n,title,body])=><article key={n}><b>{n}</b><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
 </section>

 <section id="trust" className="modernTrust">
  <div><span className="modernEyebrow">BUILT FOR TRUST</span><h2>Trust is part of the workflow, not decoration around it.</h2></div>
  <div className="modernTrustCopy"><p>Identity checks, server-controlled task transitions, completion evidence, provider-confirmed payment state and ratings are connected to the same marketplace record.</p><p>Uploading a document alone does not make an account verified. Participation depends on the configured verification result and marketplace rules.</p><Link href="/signup" className="modernTextLink">Create your account <ArrowRight size={17}/></Link></div>
 </section>

 <section className="modernFinal">
  <div><span className="modernEyebrow">START WITH ONE TASK</span><h2>What would you get done with another pair of hands?</h2></div>
  <Link href="/signup" className="modernPrimary">Get started <ArrowRight size={17}/></Link>
 </section>

 <footer className="modernFooter">
  <div><img src="/umunota-logo-approved.svg" alt="UMUNOTA"/><p>A project of Tian Group Innovation Ltd.</p></div>
  <div><Link href="/login">Log in</Link><Link href="/signup">Create account</Link><Link href="/community">Community</Link><Link href="/legal">Legal & Safety</Link><Link href="/tian">Tian Group projects</Link></div>
  <small>© 2026 Tian Group Innovation Ltd / UMUNOTA. Safe, legal everyday tasks only.</small>
 </footer>
</main>}
