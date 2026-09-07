export type TaskStatus='draft'|'posted'|'funding_pending'|'funded'|'accepted'|'in_progress'|'completion_submitted'|'payment_requested'|'approved'|'disputed'|'paid'|'cancelled';
export type KycStatus='not_started'|'pending'|'needs_review'|'verified'|'rejected';
export interface Task { id:string; clientId:string; runnerId?:string; title:string; description:string; budgetRwf:number; status:TaskStatus; proofRequirement:string; createdAt:string; }
export interface ExperiencePost { id:string; authorId:string; taskId?:string; body:string; rating?:1|2|3|4|5; verifiedTask:boolean; createdAt:string; }
