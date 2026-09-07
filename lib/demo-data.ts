export type DemoTaskStatus = 'posted'|'funded'|'accepted'|'in_progress'|'completion_submitted'|'payment_requested'|'approved'|'disputed'|'paid'|'cancelled';
export type DemoTask = {id:string;title:string;description:string;budget:number;location:string;category:string;status:DemoTaskStatus;client:string;runner?:string;createdAt:string;deadline:string;proofRequirement:string;verifiedRunner:boolean;events:{label:string;time:string;note?:string}[]};
export type DemoPost = {id:string;author:string;avatar:string;body:string;rating:number;taskTitle?:string;verifiedTask:boolean;createdAt:string;helpful:number;comments:{id:string;author:string;body:string;createdAt:string}[]};
export type Runner = {id:string;name:string;initials:string;rating:number;tasks:number;distance:string;skills:string[];verified:boolean;online:boolean;trust:number};

export const runners:Runner[]=[
{id:'r1',name:'Jean Claude',initials:'JC',rating:4.9,tasks:120,distance:'0.8 km',skills:['Errands','Delivery','Shopping'],verified:true,online:true,trust:96},
{id:'r2',name:'Grace U.',initials:'GU',rating:4.8,tasks:96,distance:'1.2 km',skills:['Laundry','Documents','Shopping'],verified:true,online:true,trust:94},
{id:'r3',name:'Emmanuel N.',initials:'EN',rating:4.7,tasks:78,distance:'1.5 km',skills:['Repair','Pickup','Delivery'],verified:true,online:true,trust:91},
{id:'r4',name:'Ariane M.',initials:'AM',rating:4.9,tasks:143,distance:'2.0 km',skills:['Groceries','Events','Errands'],verified:true,online:false,trust:97},
];

export const initialTasks:DemoTask[]=[
{id:'t1',title:'Buy weekly groceries',description:'Buy vegetables, eggs, milk and fruit. Please upload the receipt before delivery.',budget:18500,location:'Kimironko, Kigali',category:'Market shopping',status:'payment_requested',client:'Aline M.',runner:'Jean Claude',createdAt:'Today, 16:20',deadline:'Today, 20:00',proofRequirement:'Receipt + delivery photo',verifiedRunner:true,events:[{label:'Task posted',time:'16:20'},{label:'Funds authorized',time:'16:24'},{label:'Jean Claude accepted',time:'16:31'},{label:'Task started',time:'16:42'},{label:'Completion proof submitted',time:'18:01',note:'Receipt and delivery photo uploaded'},{label:'Payment requested',time:'18:03',note:'18,500 RWF'}]},
{id:'t2',title:'Pick up printed documents',description:'Collect documents from Kacyiru and deliver them to Nyarutarama reception.',budget:4500,location:'Kacyiru → Nyarutarama',category:'Pickup & delivery',status:'in_progress',client:'Aline M.',runner:'Grace U.',createdAt:'Today, 17:05',deadline:'Today, 19:30',proofRequirement:'Pickup + handoff photo',verifiedRunner:true,events:[{label:'Task posted',time:'17:05'},{label:'Funds authorized',time:'17:07'},{label:'Grace U. accepted',time:'17:14'},{label:'Task started',time:'17:22'}]},
{id:'t3',title:'Take phone to repair shop',description:'Collect my phone, take it to the repair shop I selected and return it after diagnosis.',budget:7000,location:'Kibagabaga',category:'Repair',status:'posted',client:'Aline M.',createdAt:'Yesterday',deadline:'Tomorrow, 16:00',proofRequirement:'Shop receipt + photo',verifiedRunner:true,events:[{label:'Task posted',time:'Yesterday, 14:10'}]},
];

export const initialPosts:DemoPost[]=[
{id:'p1',author:'Aline M.',avatar:'AM',body:'My runner kept me updated from purchase to delivery and uploaded the receipt before requesting payment. Smooth experience.',rating:5,taskTitle:'Market shopping',verifiedTask:true,createdAt:'2h ago',helpful:28,comments:[{id:'c1',author:'Grace U.',body:'Clear instructions make errands much easier for everyone. 🙌',createdAt:'1h ago'}]},
{id:'p2',author:'Eric N.',avatar:'EN',body:'Completed three document pickup tasks this week. The timeline and proof steps make expectations very clear.',rating:5,taskTitle:'Document pickup',verifiedTask:true,createdAt:'5h ago',helpful:17,comments:[]},
];

export const services=[
{icon:'🛒',title:'Buy from market',desc:'Groceries, household items and market shopping'},
{icon:'📦',title:'Pick up & deliver',desc:'Documents, parcels and forgotten items'},
{icon:'🛠️',title:'Take to repair',desc:'Phones, electronics, shoes and clothes'},
{icon:'🧺',title:'Laundry & cleaning',desc:'Pickup, delivery and home help'},
{icon:'📄',title:'Print & collect',desc:'Documents, scans and school work'},
{icon:'•••',title:'Other tasks',desc:'Tell UMUNOTA exactly what you need'},
];
