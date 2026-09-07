import {DemoTaskStatus} from '@/lib/demo-data';
const labels:Record<DemoTaskStatus,string>={posted:'Posted',funded:'Funds protected',accepted:'Accepted',in_progress:'In progress',completion_submitted:'Proof submitted',payment_requested:'Payment requested',approved:'Approved',disputed:'Disputed',paid:'Paid',cancelled:'Cancelled'};
export default function StatusBadge({status}:{status:DemoTaskStatus}){return <span className={`statusBadge status-${status}`}>{labels[status]}</span>}
