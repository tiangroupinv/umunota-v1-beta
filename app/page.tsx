import Link from 'next/link';
import {BadgeCheck, Box, Clock3, PackageCheck, Printer, ShieldCheck, ShoppingBasket, Sparkles, Wrench, WashingMachine} from 'lucide-react';

const services=[
  {icon:ShoppingBasket,title:'Market runs',body:'Groceries, household items and quick purchases.'},
  {icon:Box,title:'Pickup & delivery',body:'Documents, parcels and everyday errands.'},
  {icon:Wrench,title:'Take to repair',body:'Phones, shoes, clothes and other small repairs.'},
  {icon:WashingMachine,title:'Laundry & cleaning',body:'Pickup, drop-off and trusted local help.'},
  {icon:Printer,title:'Print & collect',body:'Print documents and have them collected for you.'},
  {icon:Sparkles,title:'Anything safe & local',body:'Describe what you need and find someone nearby.'},
];

export default function Page(){
  return <main className="landing">
    <nav className="landingNav"><Link className="landingBrand" href="/"><span className="brandClock"><Clock3 size={20}/></span><b>UMUNOTA</b></Link><div className="landingLinks"><a href="#how">How it works</a><a href="#trust">Trust</a><a href="#services">Services</a></div><div className="landingActions"><Link href="/login">Log in</Link><Link className="btn btn-gold" href="/signup"><Clock3 size={16}/> Get started</Link></div></nav>

    <section className="landingHero"><div className="landingHeroCopy"><span className="landingPill">PEOPLE · TIME · SOLUTIONS</span><h1>Your time matters.<br/><span className="gold">Let someone help.</span></h1><p>UMUNOTA connects people who need everyday tasks done with trusted nearby runners ready to help across Kigali and beyond.</p><div className="landingCtas"><Link className="btn btn-gold" href="/signup"><Clock3 size={17}/> Post your first task</Link><Link className="btn btn-dark" href="/runners">Become a runner</Link></div><div className="landingTrust"><span><BadgeCheck size={15}/> Verified profiles</span><span><ShieldCheck size={15}/> Protected task flow</span><span><PackageCheck size={15}/> Ratings & proof</span></div></div><div className="landingVisual"><div className="landingOrb"><Clock3 size={54}/></div><div className="floatingTask one"><b>Market pickup</b><span>18,500 RWF</span><small>Runner matched · 8 min</small></div><div className="floatingTask two"><b>Print & deliver</b><span>4,500 RWF</span><small>In progress</small></div><div className="floatingTask three"><b>Phone repair drop-off</b><span>7,000 RWF</span><small>Trusted runner nearby</small></div></div></section>

    <section id="services" className="landingSection"><div className="landingSectionHead"><span className="eyebrow">EVERYDAY HELP</span><h2>One place for the small tasks that steal your time.</h2><p>Post what you need in plain language. UMUNOTA helps match you with someone who can get it done.</p></div><div className="landingServiceGrid">{services.map(({icon:Icon,title,body})=><article key={title}><span className="landingServiceIcon"><Icon size={22}/></span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section id="how" className="landingSection landingSteps"><div className="landingSectionHead"><span className="eyebrow">HOW IT WORKS</span><h2>From “I need help” to done.</h2></div><div className="stepGrid"><article><b>01</b><h3>Post the task</h3><p>Describe the job, location, budget and deadline.</p></article><article><b>02</b><h3>Choose a runner</h3><p>Review trust signals, ratings and nearby availability.</p></article><article><b>03</b><h3>Track progress</h3><p>Follow the task from acceptance to completion proof.</p></article><article><b>04</b><h3>Approve & rate</h3><p>Confirm the work, release payment and share your experience.</p></article></div></section>

    <section id="trust" className="landingTrustSection"><div><span className="eyebrow">BUILT FOR TRUST</span><h2>More than a task board.</h2><p>UMUNOTA combines identity verification, protected task stages, completion proof, payments tracking, ratings and moderation so both sides know what happens next.</p><Link className="btn btn-gold" href="/signup"><Clock3 size={16}/> Join UMUNOTA</Link></div><div className="trustTiles"><article><b>Verified</b><span>Identity before marketplace access</span></article><article><b>24/7</b><span>Task history & evidence</span></article><article><b>1 flow</b><span>Post → Complete → Pay → Rate</span></article><article><b>Rwanda</b><span>Built around local everyday work</span></article></div></section>

    <footer className="landingFooter"><div><Link className="landingBrand" href="/"><span className="brandClock"><Clock3 size={20}/></span><b>UMUNOTA</b></Link><p>People. Time. Solutions.</p></div><div><Link href="/login">Log in</Link><Link href="/signup">Create account</Link><Link href="/community">Community</Link></div><small>© 2026 UMUNOTA. Safe, legal everyday tasks only.</small></footer>
  </main>
}
