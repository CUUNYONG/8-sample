import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { EXPIRE_SQL } from './sql.mjs';
export function db(){if(!env.DB) throw new Error('DB_NOT_CONFIGURED'); return env.DB;}
export function config(){return env as unknown as Record<string,string|undefined>;}
export async function identity(){const user=await getChatGPTUser();if(!user) throw new Error('UNAUTHORIZED');return user;}
export async function admin(){const user=await identity();const allowed=(config().ADMIN_EMAILS||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);if(!allowed.includes((user.email||'').toLowerCase()))throw new Error('FORBIDDEN');return user;}
export function sameOrigin(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)throw new Error('FORBIDDEN');}
export function failure(error:unknown){const msg=error instanceof Error?error.message:'ERROR';const status=msg==='UNAUTHORIZED'?401:msg==='FORBIDDEN'?403:msg==='DB_NOT_CONFIGURED'?503:400;return Response.json({error:msg==='UNAUTHORIZED'?'로그인 후 이용해주세요.':msg==='FORBIDDEN'?'접근 권한이 없거나 요청이 허용되지 않습니다.':msg==='DB_NOT_CONFIGURED'?'예약 데이터베이스를 준비 중입니다.':msg}, {status});}
export async function expire(){await db().prepare(EXPIRE_SQL).bind(Date.now()).run();}
