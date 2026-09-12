import {BadgeCheck,BriefcaseBusiness,Clock3,MapPin,ShieldCheck,UsersRound} from 'lucide-react';

const slides=[
 {icon:ShieldCheck,kicker:'TRUST BEFORE TRANSACTION',title:'Know who you are working with.',body:'Identity-aware participation, task records, completion proof and ratings help make everyday local work easier to trust.'},
 {icon:Clock3,kicker:'YOUR TIME HAS VALUE',title:'Turn spare time into useful opportunity.',body:'Runner mode helps eligible people discover work that fits their schedule, location and abilities without promising guaranteed earnings.'},
 {icon:MapPin,kicker:'LOCAL BY DESIGN',title:'Find help closer to where the task happens.',body:'Location-aware discovery can surface nearby verified runners and nearby open tasks when people choose to share active-session location.'},
 {icon:BriefcaseBusiness,kicker:'ONE MARKETPLACE RECORD',title:'Less confusion. Better accountability.',body:'Task scope, budget, progress, proof, payment actions and ratings stay connected instead of disappearing across informal chats.'}
];
export default function AuthTrustPanel(){return <aside className="authTrustPanel"><div className="authTrustBrand"><img src="/umunota-logo-official.png" alt="UMUNOTA"/><span>Tasks. People. A Better Tomorrow.</span></div><div className="authStoryRail">{slides.map(({icon:Icon,kicker,title,body},i)=><article className="authStory" key={title} style={{animationDelay:`${i*5}s`}}><span className="authStoryIcon"><Icon size={24}/></span><div><small>{kicker}</small><h2>{title}</h2><p>{body}</p></div></article>)}</div><div className="authTrustProof"><span><BadgeCheck size={16}/> Verification-aware access</span><span><UsersRound size={16}/> Local people and reputation</span><span><ShieldCheck size={16}/> Safety and dispute rules</span></div></aside>}
