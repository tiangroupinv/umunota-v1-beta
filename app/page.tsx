import Link from 'next/link';
import LanguageMenu from '@/components/LanguageMenu';
import {ArrowRight, BadgeCheck, CalendarClock, Clock3, CreditCard, FileCheck2, MapPin, ShieldCheck, ShoppingBasket, UserRoundCheck, UsersRound, Wrench, WashingMachine, Printer, Box} from 'lucide-react';

const services=[
  {icon:ShoppingBasket,title:'Market runs',body:'Groceries, household items and quick purchases.'},
  {icon:Box,title:'Pickup & delivery',body:'Documents, parcels and everyday errands.'},
  {icon:Wrench,title:'Repair drop-offs',body:'Take phones, shoes, clothes and other items to repair.'},
  {icon:WashingMachine,title:'Laundry & cleaning',body:'Pickup, drop-off and trusted local help.'},
  {icon:Printer,title:'Print & collect',body:'Print documents and have them collected for you.'},
  {icon:Clock3,title:'Other safe local tasks',body:'Describe a safe, legal task and find someone nearby.'},
];

const examples=[
  {title:'Buy groceries from Kimironko Market',category:'Market shopping',location:'Gasabo, Kigali',budget:'18,500 RWF',time:'Today · 18:30'},
  {title:'Collect printed documents and deliver them',category:'Documents',location:'Nyarugenge, Kigali',budget:'4,500 RWF',time:'Tomorrow · 09:00'},
  {title:'Take my phone to repair and return it',category:'Repair errand',location:'Kicukiro, Kigali',budget:'7,000 RWF',time:'Tomorrow · 15:00'},
];

const steps=[
  ['01','Verify','Complete the required identity checks before posting or accepting marketplace work.'],
  ['02','Post','Describe the task, location, budget, deadline and completion requirement.'],
  ['03','Match','An eligible runner accepts after the task is ready for marketplace work.'],
  ['04','Complete','The runner completes the task and submits the required evidence.'],
  ['05','Review','The customer approves the result or opens a dispute when something is wrong.'],
  ['06','Close','Provider-confirmed payment and ratings complete the task history.'],
];

export default function Page(){
 return <main className="landing landingModern">
  <nav className="modernNav" aria-label="Main navigation">
   <Link className="modernLogo" href="/" aria-label="UMUNOTA home"><img src="/umunota-logo-approved.svg" alt="UMUNOTA — Tasks. People. A Better Tomorrow."/></Link>
   <div className="modernNavLinks"><a href="#services">Services</a><a href="#tasks">Examples</a><a href="#how">How it works</a><a href="#trust">Trust</a></div>
   <div className="modernNavActions"><LanguageMenu/><Link href="/login">Log in</Link><Link className="modernPrimary" href="/signup">Get started <ArrowRight size={16}/></Link></div>
  </nav>

  <section className="modernHero">
   <div className="modernHeroCopy">
    <span className="modernKicker">RWANDA'S LOCAL TASK MARKETPLACE</span>
    <h1>More time for what matters.</h1>
    <p>UMUNOTA helps people get safe, practical everyday tasks done by connecting them with verified local runners.</p>
    <div className="modernHeroActions"><Link className="modernPrimary" href="/signup">Post your first task <ArrowRight size={17}/></Link><Link className="modernTextLink" href="/login">Explore as a runner</Link></div>
    <div className="modernProof"><span><BadgeCheck size={16}/> Verified participation</span><span><ShieldCheck size={16}/> Tracked task flow</span><span><CreditCard size={16}/> Task-linked payments</span></div>
   </div>
   <div className="modernHeroMark" aria-hidden="true">
    <img src="/umunota-logo-approved.svg" alt=""/>
    <div className="modernHeroLine"><span>Need groceries picked up?</span><b>Post it.</b></div>
    <div className="modernHeroLine"><span>Need documents collected?</span><b>Post it.</b></div>
    <div className="modernHeroLine"><span>Need something taken to repair?</span><b>Post it.</b></div>
   </div>
  </section>

  <section id="services" className="modernSection modernServices">
   <div className="modernSectionIntro"><span>EVERYDAY HELP</span><h2>Small tasks. One simple place.</h2><p>UMUNOTA is built for real-world errands and practical local help, not professional freelancing.</p></div>
   <div className="modernServiceList">{services.map(({icon:Icon,title,body})=><article key={title}><Icon size={22}/><div><h3>{title}</h3><p>{body}</p></div><ArrowRight size={18}/></article>)}</div>
  </section>

  <section id="tasks" className="modernSection modernExamples">
   <div className="modernSectionIntro"><span>EXAMPLE TASKS</span><h2>Clear before anyone accepts.</h2><p>These are examples only, not live marketplace listings.</p></div>
   <div className="modernExampleList">{examples.map((task,index)=><article key={task.title}><span className="modernIndex">0{index+1}</span><div className="modernExampleMain"><small>{task.category}</small><h3>{task.title}</h3><div><span><MapPin size={14}/>{task.location}</span><span><CalendarClock size={14}/>{task.time}</span></div></div><strong>{task.budget}</strong></article>)}</div>
   <div className="modernExampleNote"><FileCheck2 size={17}/><p>Real marketplace tasks are shown according to account access and task visibility rules.</p><Link href="/signup">Create a task <ArrowRight size={15}/></Link></div>
  </section>

  <section className="modernBand">
   <div><UsersRound size={24}/><strong>For customers</strong><p>Save time by handing off everyday errands with clear expectations.</p></div>
   <div><UserRoundCheck size={24}/><strong>For runners</strong><p>Use available time to complete safe local work and build a trusted history.</p></div>
   <div><ShieldCheck size={24}/><strong>For trust</strong><p>Verification, task events and completion evidence stay connected.</p></div>
  </section>

  <section id="how" className="modernSection modernHow">
   <div className="modernSectionIntro"><span>HOW IT WORKS</span><h2>One task, six clear stages.</h2></div>
   <div className="modernTimeline">{steps.map(([number,title,body])=><article key={number}><b>{number}</b><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
  </section>

  <section id="trust" className="modernSection modernTrust">
   <div className="modernTrustCopy"><span>BUILT FOR TRUST</span><h2>Marketplace access starts with verification.</h2><p>UMUNOTA combines identity checks, server-controlled task transitions, provider-confirmed payment state, ratings and moderation. Uploading a document alone does not make an account verified.</p><Link className="modernPrimary" href="/signup">Create account <ArrowRight size={16}/></Link></div>
   <div className="modernTrustFacts"><div><b>Verified</b><span>before key marketplace actions</span></div><div><b>Tracked</b><span>status, events and evidence</span></div><div><b>Local</b><span>designed around Rwanda's everyday work</span></div><div><b>Safe</b><span>safe and legal tasks only</span></div></div>
  </section>

  <section className="modernFinal"><div><span>START WITH ONE TASK</span><h2>What would you get done with another pair of hands?</h2></div><Link className="modernPrimary" href="/signup">Get started <ArrowRight size={17}/></Link></section>

  <footer className="modernFooter"><Link href="/" className="modernFooterLogo"><img src="/umunota-logo-approved.svg" alt="UMUNOTA"/></Link><div><Link href="/legal">Legal & Safety</Link><Link href="/community">Community</Link><Link href="/tian">Tian Group projects</Link></div><small>© 2026 Tian Group Innovation Ltd / UMUNOTA.</small></footer>
 </main>;
}
