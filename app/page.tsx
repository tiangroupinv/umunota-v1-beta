import Link from 'next/link';
import LanguageMenu from '@/components/LanguageMenu';
import {ArrowRight,BriefcaseBusiness,CheckCircle2,Clock3,MapPin,Play,ShieldCheck,Sparkles,UsersRound} from 'lucide-react';

const audiences=[
 {icon:UsersRound,title:'For Individuals',body:'Post everyday tasks and get support from trusted runners.'},
 {icon:BriefcaseBusiness,title:'For Businesses',body:'Delegate local work and keep your team focused.'},
 {icon:Clock3,title:'For Runners',body:'Find safe local tasks, earn fairly and build your reputation.'},
 {icon:Sparkles,title:'For Communities',body:'Turn spare time into useful work and stronger local connections.'},
];

const steps=[
 ['01','Post clearly','Describe the task, location area, budget, deadline and what completion should look like.'],
 ['02','Match safely','Eligible verified runners can discover and accept work they can complete.'],
 ['03','Track progress','Task status, evidence and important updates stay connected to one record.'],
 ['04','Complete fairly','Review the result, confirm the outcome and build reputation through ratings.'],
];

export default function Page(){return <main className="launchLanding">
 <header className="launchNav">
  <nav className="launchNavLinks" aria-label="Primary navigation">
   <a className="active" href="#home">Home</a>
   <a href="#how">How it works</a>
   <a href="#business">For Businesses</a>
   <a href="#runners">For Runners</a>
   <a href="#about">About</a>
  </nav>
  <Link href="/" className="launchLogo" aria-label="UMUNOTA home"><img src="/umunota-logo-official.png" alt="UMUNOTA — Tasks. People. A Better Tomorrow."/></Link>
  <div className="launchNavActions"><LanguageMenu/><Link href="/login" className="launchSignIn">Sign in</Link><Link href="/signup" className="launchPrimary">Get started</Link></div>
 </header>

 <section id="home" className="launchHero">
  <div className="launchHeroCopy">
   <span className="launchEyebrow">RWANDA'S LOCAL TASK MARKETPLACE</span>
   <h1>Everyday tasks.<br/><strong>Real opportunities.</strong></h1>
   <p>UMUNOTA connects people who need safe everyday tasks done with people who can get them done — clearly, fairly and locally.</p>
   <div className="launchHeroActions"><Link href="/signup" className="launchPrimary launchLarge">Get started <ArrowRight size={18}/></Link><a href="#how" className="launchSecondary"><Play size={17} fill="currentColor"/> How it works</a></div>
   <div className="launchMiniValues"><span><b>People</b>Get things done</span><span><b>Businesses</b>Save time</span><span><b>Runners</b>Earn fairly</span><span><b>Communities</b>Grow together</span></div>
  </div>
  <div className="launchHeroVisual" aria-label="UMUNOTA connects people and everyday opportunities">
   <div className="launchVisualBrand"><img src="/umunota-logo-official.png" alt=""/></div>
   <div className="launchVisualStatement"><span>Small tasks.</span><strong>Bigger tomorrows.</strong></div>
   <div className="launchVisualMap"><MapPin size={22}/><span>Kigali, Rwanda</span></div>
   <div className="launchOrbit orbitOne"></div><div className="launchOrbit orbitTwo"></div>
  </div>
 </section>

 <section className="launchAudienceStrip">{audiences.map(({icon:Icon,title,body})=><article key={title}><Icon size={30}/><div><h2>{title}</h2><p>{body}</p></div></article>)}</section>

 <section id="how" className="launchHow">
  <div className="launchSectionLead"><span className="launchEyebrow">HOW IT WORKS</span><h2>Simple enough for one errand.<br/>Strong enough to build trust.</h2><p>UMUNOTA keeps the important parts of a task connected without turning everyday help into complicated professional freelancing.</p></div>
  <div className="launchSteps">{steps.map(([n,title,body])=><article key={n}><b>{n}</b><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
 </section>

 <section className="launchSplit" id="business">
  <div className="launchSplitCopy"><span className="launchEyebrow">FOR BUSINESSES</span><h2>Delegate the small work that steals big chunks of time.</h2><p>Create a Business workspace for recurring errands, local pickups and operational tasks while keeping activity connected to your UMUNOTA account.</p><Link href="/business" className="launchTextLink">Explore UMUNOTA Business <ArrowRight size={18}/></Link></div>
  <div className="launchPrinciples"><span><CheckCircle2/> Clear task ownership</span><span><CheckCircle2/> Team workspace support</span><span><CheckCircle2/> Recurring task templates</span><span><CheckCircle2/> Real marketplace records</span></div>
 </section>

 <section className="launchSplit reverse" id="runners">
  <div className="launchSplitCopy"><span className="launchEyebrow">FOR RUNNERS</span><h2>Turn available time into a reputation people can trust.</h2><p>Discover eligible tasks, complete them responsibly and build a history based on verified marketplace activity and ratings.</p><Link href="/signup" className="launchTextLink">Create a runner account <ArrowRight size={18}/></Link></div>
  <div className="launchRunnerQuote"><ShieldCheck size={38}/><p>Verification is part of marketplace access. Uploading an ID alone does not make an account verified.</p></div>
 </section>

 <section id="about" className="launchAbout">
  <div><span className="launchEyebrow">A BETTER TOMORROW</span><h2>Built around useful work, time and local opportunity.</h2></div>
  <div><p>UMUNOTA is a project of Tian Group Innovation Ltd. The marketplace is focused on safe, legal everyday tasks and responsible participation.</p><div className="launchAboutLinks"><Link href="/legal">Legal & Safety</Link><Link href="/tian">Tian Group projects</Link><Link href="/community">Community</Link></div></div>
 </section>

 <section className="launchFinal"><img src="/umunota-logo-official.png" alt="UMUNOTA"/><div><span className="launchEyebrow">START WITH ONE TASK</span><h2>What could you get done today?</h2></div><Link href="/signup" className="launchPrimary launchLarge">Get started <ArrowRight size={18}/></Link></section>
 <footer className="launchFooter"><span>© 2026 Tian Group Innovation Ltd / UMUNOTA.</span><span>Safe, legal everyday tasks only.</span></footer>
 </main>}
