import { NextResponse } from 'next/server';
export async function POST(){return NextResponse.json({ok:true,status:'pending',message:'KYC provider integration required. Do not mark verified until provider/manual review confirms identity.'},{status:202})}
