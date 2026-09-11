import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import {isPaypackConfigured,paypackHealthcheck} from '@/lib/paypack';

export async function GET(){
 try{await requireAdmin();if(!isPaypackConfigured())return NextResponse.json({ok:false,configured:false,error:'Paypack credentials are not configured'},{status:503});const result=await paypackHealthcheck();return NextResponse.json({ok:true,configured:true,mode:result.mode,expires:result.expires});}catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Unable to verify Paypack'},{status:500})}
}
