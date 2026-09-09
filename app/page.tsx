import Link from 'next/link';
import LanguageMenu from '@/components/LanguageMenu';
import {
  BadgeCheck,
  Box,
  CalendarClock,
  Clock3,
  CreditCard,
  FileCheck2,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Printer,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  UserRoundCheck,
  UsersRound,
  Wrench,
  WashingMachine,
} from 'lucide-react';

const services=[
  {icon:ShoppingBasket,title:'Market runs',body:'Groceries, household items and quick purchases.'},
  {icon:Box,title:'Pickup & delivery',body:'Documents, parcels and everyday errands.'},
  {icon:Wrench,title:'Take to repair',body:'Phones, shoes, clothes and other small repairs.'},
  {icon:WashingMachine,title:'Laundry & cleaning',body:'Pickup, drop-off and trusted local help.'},
  {icon:Printer,title:'Print & collect',body:'Print documents and have them collected for you.'},
  {icon:Clock3,title:'Anything safe & local',body:'Describe a safe, legal local task and find someone nearby.'},
];

const taskExamples=[
  {title:'Buy groceries from Kimironko Market',category:'Market shopping',location:'Gasabo, Kigali',budget:'18,500 RWF',time:'Today · 18:30',status:'Runner matching'},
  {title:'Collect printed documents and deliver them',category:'Documents',location:'Nyarugenge, Kigali',budget:'4,500 RWF',time:'Tomorrow · 09:00',status:'Ready to fund'},
  {title:'Take my phone to repair and return it',category:'Repair errand',location:'Kicukiro, Kigali',budget:'7,000 RWF',time:'Tomorrow · 15:00',status:'Verified runner required'},
];

const audiences=[
  {icon:UsersRound,title:'For customers',body:'Post a clear everyday errand with a location, budget, deadline and completion requirement.'},
  {icon:UserRoundCheck,title:'For runners',body:'Use available time to complete safe local tasks, build ratings and create a trusted work history.'},
  {icon:CreditCard,title:'For payments',body:'Task-linked MTN and Airtel Mobile Money requests stay connected to the marketplace record.'},
  {icon:ShieldCheck,title:'For trust',body:'Identity verification, task events and completion evidence help both sides know what happened.'},
];

export default function Page(){
  return <main className="landing landingV2">
    <nav className="landingNav" aria-label="Main navigation">
      <Link className="landingLogo" href="/" aria-label="UMUNOTA home">
        <img src="/umunota-logo-dark.svg" alt="UMUNOTA — Tasks. People. A Better Tomorrow."/>
      </Link>
      <div className="landingLinks">
        <a href="#tasks">Task examples</a>
        <a href="#services">Services</a>
        <a href="#how">How it works</a>
        <a href="#trust">Trust</a>
      </div>
      <div className="landingActions">
        <LanguageMenu/>
        <Link href="/login">Log in</Link>
        <Link className="btn btn-gold" href="/signup"><Clock3 size={16}/> Get started</Link>
      </div>
    </nav>

    <section className="landingHero">
      <div className="landingHeroCopy">
        <span className="heroKicker"><i/> RWANDA'S LOCAL TASK MARKETPLACE</span>
        <h1>Get everyday tasks done.<span>Build trust while doing it.</span></h1>
        <p>UMUNOTA connects people who need safe, practical everyday help with verified people ready to complete local tasks — from market runs and pickups to repair drop-offs, laundry and document collection.</p>
        <div className="landingCtas">
          <Link className="btn btn-gold" href="/signup"><Clock3 size={17}/> Post your first task</Link>
          <Link className="btn btn-dark" href="/login"><UsersRound size={17}/> Explore as a runner</Link>
        </div>
        <div className="landingTrust">
          <span><BadgeCheck size={15}/> Verified marketplace access</span>
          <span><ShieldCheck size={15}/> Tracked task flow</span>
          <span><PackageCheck size={15}/> Proof and ratings</span>
        </div>
      </div>

      <div className="heroProduct" aria-label="Example UMUNOTA task preview">
        <div className="heroProductHead">
          <img src="/umunota-logo-dark.svg" alt="UMUNOTA"/>
          <span className="exampleFlag">EXAMPLE PREVIEW</span>
        </div>
        <article className="heroTask">
          <div className="heroTaskTop">
            <div>
              <small>MARKET SHOPPING</small>
              <h3>Buy groceries from Kimironko Market</h3>
            </div>
            <div className="heroBudget"><b>18,500 RWF</b><span>example budget</span></div>
          </div>
          <div className="heroMeta">
            <span><MapPin size={15}/> Gasabo, Kigali</span>
            <span><CalendarClock size={15}/> Today · 18:30</span>
          </div>
          <div className="heroProgress" aria-label="Example task progress"><span className="active"/><span className="active"/><span/><span/></div>
        </article>
        <div className="heroRunner">
          <span className="runnerAvatar"><UserRoundCheck size={20}/></span>
          <div><b>Verified runner matching</b><span>Identity and marketplace checks required</span></div>
          <small>Protected</small>
        </div>
      </div>
    </section>

    <section className="landingValueStrip" aria-label="UMUNOTA highlights">
      <article><Clock3 size={20}/><div><b>Post in minutes</b><span>Describe what needs to be done.</span></div></article>
      <article><BadgeCheck size={20}/><div><b>Verified participation</b><span>Verification before key marketplace actions.</span></div></article>
      <article><CreditCard size={20}/><div><b>Task-linked payments</b><span>Payment records remain connected to the task.</span></div></article>
      <article><FileCheck2 size={20}/><div><b>Track the record</b><span>Status, evidence and ratings stay together.</span></div></article>
    </section>

    <section id="tasks" className="landingSection landingExamples">
      <div className="landingSectionHead">
        <span className="eyebrow">EXAMPLE TASKS</span>
        <h2>Clear tasks make local help easier to organize.</h2>
        <p>These cards are examples only. They show the kind of information UMUNOTA keeps together before a task begins.</p>
      </div>
      <div className="landingTaskGrid">
        {taskExamples.map(t=><article className="landingTaskCard" key={t.title}>
          <div className="landingTaskCardTop"><span>{t.category}</span><b>{t.budget}</b></div>
          <h3>{t.title}</h3>
          <div className="landingTaskMeta">
            <span><MapPin size={15}/>{t.location}</span>
            <span><CalendarClock size={15}/>{t.time}</span>
          </div>
          <div className="landingTaskStatus"><BadgeCheck size={15}/>{t.status}</div>
        </article>)}
      </div>
      <div className="landingExamplesFoot">
        <p>Real marketplace tasks are shown only according to account access and task visibility rules. The cards above do not represent live marketplace listings.</p>
        <Link className="btn btn-gold" href="/signup"><Clock3 size={16}/> Create a real task</Link>
      </div>
    </section>

    <section id="services" className="landingSection">
      <div className="landingSectionHead">
        <span className="eyebrow">EVERYDAY HELP</span>
        <h2>One marketplace for many small real-world tasks.</h2>
        <p>UMUNOTA is designed around practical, safe and legal local work instead of limiting people to one delivery category.</p>
      </div>
      <div className="landingServiceGrid">
        {services.map(({icon:Icon,title,body})=><article key={title}>
          <span className="landingServiceIcon"><Icon size={22}/></span>
          <h3>{title}</h3>
          <p>{body}</p>
        </article>)}
      </div>
    </section>

    <section className="landingSection landingAudience">
      <div className="landingSectionHead">
        <span className="eyebrow">ONE SYSTEM, DIFFERENT NEEDS</span>
        <h2>Customers, runners, trust and payments in one flow.</h2>
      </div>
      <div className="landingAudienceGrid">
        {audiences.map(({icon:Icon,title,body})=><article key={title}><Icon size={24}/><h3>{title}</h3><p>{body}</p></article>)}
      </div>
    </section>

    <section id="how" className="landingSection landingSteps">
      <div className="landingSectionHead">
        <span className="eyebrow">HOW IT WORKS</span>
        <h2>From “I need help” to a completed task record.</h2>
        <p>Each stage has a clear purpose so customers and runners know what must happen next.</p>
      </div>
      <div className="stepGrid">
        <article><b>01</b><h3>Verify account</h3><p>Complete required identity checks before posting or accepting marketplace work.</p></article>
        <article><b>02</b><h3>Post the task</h3><p>Add the job, location, budget, category, deadline and completion requirement.</p></article>
        <article><b>03</b><h3>Fund and accept</h3><p>Payment status and runner acceptance are connected to the same task record.</p></article>
        <article><b>04</b><h3>Complete and review</h3><p>The runner completes the task and submits the required completion evidence.</p></article>
        <article><b>05</b><h3>Approve or dispute</h3><p>The customer reviews the result and either approves it or opens a dispute.</p></article>
        <article><b>06</b><h3>Close and rate</h3><p>Provider-confirmed payment and ratings complete the marketplace history.</p></article>
      </div>
    </section>

    <section className="landingSection landingProductFlow">
      <div className="landingFlowCopy">
        <span className="eyebrow">THE UMUNOTA RECORD</span>
        <h2>More than matching two people.</h2>
        <p>UMUNOTA keeps the task context together: who posted it, who accepted it, where it happens, when it is due, what was agreed and what happened during completion.</p>
        <div className="landingFlowChecklist">
          <span><Smartphone size={17}/> Mobile-first experience</span>
          <span><MessageSquareText size={17}/> Community and task history</span>
          <span><FileCheck2 size={17}/> Completion evidence</span>
          <span><CreditCard size={17}/> Task-linked payment records</span>
        </div>
      </div>
      <div className="landingLifecycle" aria-label="Task lifecycle">
        <div>Posted</div><div>Funded</div><div>Accepted</div><div>In progress</div><div>Completion submitted</div><div>Payment requested</div><div>Approved</div><div>Paid</div>
      </div>
    </section>

    <section id="trust" className="landingTrustSection">
      <div>
        <span className="eyebrow">BUILT FOR TRUST</span>
        <h2>Marketplace participation starts with verification.</h2>
        <p>UMUNOTA combines identity checks, server-checked task transitions, provider-confirmed payment state, ratings and moderation. Uploading a document alone does not make an account verified.</p>
        <Link className="btn btn-gold" href="/signup"><Clock3 size={16}/> Create account</Link>
      </div>
      <div className="trustTiles">
        <article><b>Verified</b><span>Identity checks before core marketplace actions</span></article>
        <article><b>Tracked</b><span>Task status, events and completion evidence</span></article>
        <article><b>Provider-backed</b><span>Mobile Money activity through configured payment partners</span></article>
        <article><b>Local</b><span>Designed around Rwanda’s everyday work</span></article>
      </div>
    </section>

    <section className="landingSection landingFinalCta">
      <Clock3 size={42}/>
      <div>
        <span className="eyebrow">START WITH ONE TASK</span>
        <h2>What would you get done with another pair of hands?</h2>
        <p>Create your UMUNOTA account, complete the required verification and post a clear task when you are ready.</p>
      </div>
      <Link className="btn btn-gold" href="/signup">Get started</Link>
    </section>

    <footer className="landingFooter">
      <div>
        <Link className="landingFooterLogo" href="/" aria-label="UMUNOTA home"><img src="/umunota-logo-dark.svg" alt="UMUNOTA — Tasks. People. A Better Tomorrow."/></Link>
        <p>Tasks. People. A Better Tomorrow.</p>
        <small>A project of Tian Group Innovation Ltd.</small>
      </div>
      <div>
        <Link href="/login">Log in</Link>
        <Link href="/signup">Create account</Link>
        <Link href="/community">Community</Link>
        <Link href="/legal">Legal & Safety</Link>
        <Link href="/tian">Tian Group projects</Link>
      </div>
      <small>© 2026 Tian Group Innovation Ltd / UMUNOTA. Safe, legal everyday tasks only.</small>
    </footer>
  </main>;
}
