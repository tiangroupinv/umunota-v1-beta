import Link from 'next/link';
import LanguageMenu from '@/components/LanguageMenu';
import {ArrowRight,BadgeCheck,BellRing,BriefcaseBusiness,Check,Clock3,CreditCard,MapPin,MessageSquareText,PackageCheck,ShieldCheck,UsersRound,Zap} from 'lucide-react';

const featureCards=[
 {icon:Clock3,title:'Post tasks quickly',body:'Describe what you need, set the area, budget, deadline and completion requirement.'},
 {icon:UsersRound,title:'Match with local runners',body:'Eligible verified runners can discover suitable work and build reputation through real activity.'},
 {icon:BellRing,title:'Stay updated',body:'Task changes, payment actions and important updates stay visible in one notification flow.'},
];

const plans=[
 {name:'Everyday',price:'Free',copy:'For people posting or completing occasional local tasks.',items:['Create and manage tasks','Runner discovery','Notifications and ratings']},
 {name:'Business',price:'Workspace',copy:'For teams that need recurring local operational help.',items:['Business workspace','Team members','Recurring task templates'],featured:true},
 {name:'Community',price:'Included',copy:'For building reputation and sharing useful marketplace experiences.',items:['Community posts','Task-linked activity','Marketplace reputation']},
];

export default function Page(){return <main className="finLanding">
 <header className="finNav">
  <Link href="/" className="finBrand"><img src="/umunota-logo-official.png" alt="UMUNOTA — Tasks. People. A Better Tomorrow."/></Link>
  <nav><a href="#features">Features</a><a href="#business">Business</a><a href="#how">How it works</a><a href="#community">Community</a></nav>
  <div className="finNavActions"><LanguageMenu/><Link href="/login" className="finLogin">Log in</Link><Link href="/signup" className="finPill finPillLight">Sign up <ArrowRight size={14}/></Link></div>
 </header>

 <section className="finHero" id="home">
  <div className="finHeroShade"></div>
  <div className="finHeroCopy">
   <span className="finKicker"><Zap size={12}/> Local tasks. Real opportunities.</span>
   <h1>Get everyday tasks done<br/><em>Smarter. Faster.</em> Together.</h1>
   <p>UMUNOTA connects people who need safe local tasks completed with trusted people who have the time and ability to help.</p>
   <div className="finHeroActions"><Link href="/signup" className="finPill finPillLight">Get started <ArrowRight size={15}/></Link><a href="#how" className="finPill finPillDark">See how it works <ArrowRight size={15}/></a></div>
  </div>

  <div className="finWorkspaceWrap">
   <div className="finWorkspaceLabel">UMUNOTA INTERFACE PREVIEW</div>
   <div className="finWorkspace">
    <aside className="finPreviewSide">
     <img src="/umunota-logo-official.png" alt=""/>
     <div className="finPreviewNav active"><span></span>Dashboard</div>
     <div className="finPreviewNav"><span></span>My tasks</div>
     <div className="finPreviewNav"><span></span>Runners</div>
     <div className="finPreviewNav"><span></span>Payments</div>
     <div className="finPreviewNav"><span></span>Community</div>
    </aside>
    <div className="finPreviewMain">
     <div className="finPreviewTop"><div><small>Welcome back</small><b>Your task workspace</b></div><div className="finPreviewAvatar">U</div></div>
     <div className="finPreviewMetrics"><div><span>Active tasks</span><b>—</b><small>Live account records</small></div><div><span>Task value</span><b>RWF</b><small>Across active tasks</small></div><div><span>Identity</span><b>Verified</b><small>Marketplace access</small></div><div><span>Notifications</span><b>On</b><small>Task updates</small></div></div>
     <div className="finPreviewGrid">
      <div className="finPreviewPanel"><div className="finPreviewPanelHead"><span>Recent activity</span><small>Preview</small></div><div className="finPreviewTask"><i></i><div><b>Task title appears here</b><small><MapPin size={11}/> Kigali · Status updates</small></div><strong>RWF</strong></div><div className="finPreviewTask"><i></i><div><b>Another task record</b><small><Clock3 size={11}/> Deadline and progress</small></div><strong>RWF</strong></div><div className="finPreviewChart"><span></span><span></span><span></span><span></span><span></span><span></span></div></div>
      <div className="finPreviewPanel small"><div className="finPreviewPanelHead"><span>Runner</span><small>Verified</small></div><div className="finRunnerPreview"><div className="finPreviewAvatar gold">R</div><div><b>Trusted runner</b><small>Rating · task history</small></div></div><button>View runner</button></div>
     </div>
    </div>
   </div>
  </div>
 </section>

 <section className="finTrustBar"><span>Built for Rwanda</span><span>Verified participation</span><span>Task-linked records</span><span>Local opportunity</span><span>Tian Group Innovation Ltd</span></section>

 <section className="finFeatureIntro" id="features">
  <div><span className="finKicker">WHY UMUNOTA</span><h2>Manage everyday work <em>with less friction.</em></h2></div>
  <p>Post, match, complete and review useful local work while keeping the important parts connected to one marketplace record.</p>
 </section>

 <section className="finFeatureCards">{featureCards.map(({icon:Icon,title,body})=><article key={title}><div className="finFeatureIcon"><Icon size={20}/></div><h3>{title}</h3><p>{body}</p><span>Learn more <ArrowRight size={13}/></span></article>)}</section>

 <section className="finSplit" id="business">
  <div className="finSplitCopy"><span className="finKicker">FOR INDIVIDUALS AND BUSINESSES</span><h2>Built for one errand <em>and recurring operations.</em></h2><div className="finList"><span><BadgeCheck/> Everyday local tasks for individuals</span><span><BriefcaseBusiness/> Business workspaces and team access</span><span><PackageCheck/> Recurring pickup, delivery and operational work</span><span><ShieldCheck/> Verification-aware marketplace access</span></div><Link href="/business" className="finPill finPillLight">Explore Business <ArrowRight size={15}/></Link></div>
  <div className="finDevice"><div className="finDeviceTop"><img src="/umunota-logo-official.png" alt=""/><span>Business workspace</span></div><div className="finDeviceRow"><i></i><div><b>Recurring pickup</b><small>Template · Kigali</small></div><strong>Active</strong></div><div className="finDeviceRow"><i></i><div><b>Document collection</b><small>Assigned locally</small></div><strong>Ready</strong></div><div className="finDeviceRow"><i></i><div><b>Store errand</b><small>Task history saved</small></div><strong>Done</strong></div></div>
 </section>

 <section className="finSplit reverse" id="how">
  <div className="finDevice finTaskComposer"><span className="finKicker">POST A TASK</span><label>What needs to be done?</label><div className="finInput">Describe the task clearly</div><div className="finComposerGrid"><div><small>Area</small><b>Kigali</b></div><div><small>Budget</small><b>RWF</b></div></div><div className="finInput muted">Deadline and completion requirement</div><button>Publish task</button></div>
  <div className="finSplitCopy"><span className="finKicker">HOW IT WORKS</span><h2>Take control of the <em>whole task journey.</em></h2><p>UMUNOTA keeps task creation, matching, progress, evidence, payment actions and ratings connected instead of scattering them across chats and informal agreements.</p><div className="finStats"><div><b>01</b><span>Post clearly</span></div><div><b>02</b><span>Match safely</span></div><div><b>03</b><span>Complete fairly</span></div></div><Link href="/signup" className="finPill finPillLight">Create account <ArrowRight size={15}/></Link></div>
 </section>

 <section className="finPlans">
  <div className="finCentered"><span className="finKicker">CHOOSE YOUR WAY TO USE UMUNOTA</span><h2>Start simple. <em>Grow when you need to.</em></h2><p>No fake subscriptions or invented benefits—the options below describe the product paths already being built into UMUNOTA.</p></div>
  <div className="finPlanGrid">{plans.map(p=><article className={p.featured?'featured':''} key={p.name}>{p.featured&&<span className="finPlanBadge">Best for teams</span>}<small>{p.name}</small><h3>{p.price}</h3><p>{p.copy}</p><div>{p.items.map(x=><span key={x}><Check size={14}/>{x}</span>)}</div><Link href={p.name==='Business'?'/business':'/signup'}>{p.name==='Business'?'Explore Business':'Get started'}</Link></article>)}</div>
 </section>

 <section className="finCommunity" id="community">
  <div><span className="finKicker">COMMUNITY AND REPUTATION</span><h2>Useful work becomes <em>visible trust.</em></h2><p>Ratings, completed tasks and community activity can help people build a stronger marketplace reputation over time.</p></div>
  <div className="finCommunityQuote"><MessageSquareText size={24}/><p>“A good marketplace should make everyday help easier to understand, easier to track and easier to trust.”</p><small>UMUNOTA product principle</small></div>
 </section>

 <section className="finFinal"><img src="/umunota-logo-official.png" alt="UMUNOTA"/><div><span className="finKicker">TASKS. PEOPLE. A BETTER TOMORROW.</span><h2>Start with one useful task.</h2></div><Link href="/signup" className="finPill finPillLight">Get started <ArrowRight size={15}/></Link></section>
 <footer className="finFooter"><span>© 2026 Tian Group Innovation Ltd / UMUNOTA.</span><div><Link href="/legal">Legal & Safety</Link><Link href="/community">Community</Link><Link href="/tian">Tian Group</Link></div></footer>
 </main>}
