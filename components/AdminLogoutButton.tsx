'use client';
import {LogOut} from 'lucide-react';import {createClient} from '@/lib/supabase';
export default function AdminLogoutButton(){async function logout(){const s=createClient();await s.auth.signOut();location.href='/login'}return <button className="btn btn-dark btn-wide" onClick={logout}><LogOut size={16}/> Log out</button>}
