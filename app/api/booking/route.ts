import { db, identity, admin, sameOrigin, failure, expire } from '@/lib/server';
import { approvalDeadline, canPay, canRefund, PRICE } from '@/lib/policy.mjs';
import { APPROVE_SQL } from '@/lib/sql.mjs';
export async function GET(req:Request){try{
 const isAdmin=new URL(req.url).searchParams.get('admin')==='1';const user=isAdmin?await admin():await identity();await expire();
 const slots=await db().prepare(`SELECT s.* FROM slots s WHERE active=1 AND start_at>? AND NOT EXISTS (SELECT 1 FROM reservations r JOIN slots x ON r.slot_id=x.id WHERE r.status IN ('awaiting_payment','confirmed','refund_requested') AND x.start_at<s.end_at AND s.start_at<x.end_at) ORDER BY start_at`).bind(Date.now()).all();
 const query=`SELECT r.*,s.start_at,s.end_at FROM reservations r JOIN slots s ON r.slot_id=s.id ${isAdmin?'':'WHERE r.user_id=?'} ORDER BY r.created_at DESC`;
 const stmt=db().prepare(query);const bookings=await (isAdmin?stmt:stmt.bind(user.userId)).all();
 return Response.json({slots:slots.results,bookings:bookings.results,amount:PRICE,paymentReady:false},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return failure(e);}}
export async function POST(req:Request){try{
 sameOrigin(req);const user=await identity();const body=await req.json() as Record<string,string>;await expire();const {action,id}=body;
 if(action==='create'){
  const name=(body.name||'').trim(),phone=(body.phone||'').replace(/[^0-9]/g,'');
  if(name.length<1||name.length>50||!/^01[0-9]{8,9}$/.test(phone)||body.consent!=='yes')throw new Error('이름, 휴대전화 번호와 동의 항목을 확인해주세요.');
  const key=crypto.randomUUID();const result=await db().prepare(`INSERT INTO reservations (id,user_id,slot_id,name,phone,status,created_at,amount) SELECT ?,?,?,?,?,'pending',?,? WHERE EXISTS (SELECT 1 FROM slots WHERE id=? AND active=1 AND start_at>?) AND NOT EXISTS (SELECT 1 FROM reservations WHERE user_id=? AND slot_id=? AND status IN ('pending','awaiting_payment','confirmed','refund_requested'))`).bind(key,user.userId,body.slotId,name,phone,Date.now(),PRICE,body.slotId,Date.now(),user.userId,body.slotId).run();
  if(!result.meta.changes)throw new Error('신청할 수 없는 시간이거나 이미 신청한 예약입니다.');return Response.json({ok:true,id:key});
 }
 if(action==='slot'){
  await admin();const start=Date.parse(body.start);if(!Number.isFinite(start)||start<=Date.now())throw new Error('미래 날짜와 시간을 선택해주세요.');
  const result=await db().prepare(`INSERT INTO slots (id,start_at,end_at,active) SELECT ?,?,?,1 WHERE NOT EXISTS (SELECT 1 FROM slots WHERE active=1 AND start_at<? AND end_at>?)`).bind(crypto.randomUUID(),start,start+3600000,start+3600000,start).run();
  if(!result.meta.changes)throw new Error('기존 운영 시간과 겹칩니다.');return Response.json({ok:true});
 }
 if(action==='approve'||action==='reject'){
  await admin();let changes=0;
  if(action==='approve'){
   const now=Date.now();const result=await db().prepare(APPROVE_SQL).bind(now,approvalDeadline(now),id,now).run();changes=result.meta.changes;
  }else{const result=await db().prepare("UPDATE reservations SET status='rejected' WHERE id=? AND status='pending'").bind(id).run();changes=result.meta.changes;}
  if(!changes)throw new Error('다른 예약이 시간을 확보했거나 이미 처리된 예약입니다.');return Response.json({ok:true});
 }
 const r=await db().prepare('SELECT r.*,s.start_at FROM reservations r JOIN slots s ON s.id=r.slot_id WHERE r.id=? AND r.user_id=?').bind(id,user.userId).first<any>();
 if(!r)throw new Error('예약을 찾을 수 없습니다.');
 if(action==='pay'){
  if(!canPay(r))throw new Error('승인된 예약만 결제할 수 있습니다. 결제 기한도 확인해주세요.');
  return Response.json({error:'결제 서비스 연결 준비 중입니다. 현재 실제 결제는 진행되지 않습니다.'},{status:503});
 }
 if(action==='cancel'){
  const result=await db().prepare("UPDATE reservations SET status='cancelled' WHERE id=? AND user_id=? AND status IN ('pending','awaiting_payment')").bind(id,user.userId).run();if(!result.meta.changes)throw new Error('결제된 예약은 환불 요청을 이용해주세요.');return Response.json({ok:true});
 }
 if(action==='refund'){
  if(!canRefund(r))throw new Error('환불 요청은 이용일 2일 전까지 가능합니다.');
  const result=await db().prepare("UPDATE reservations SET status='refund_requested',refund_requested_at=? WHERE id=? AND user_id=? AND status='confirmed'").bind(Date.now(),id,user.userId).run();if(!result.meta.changes)throw new Error('이미 처리된 요청입니다.');return Response.json({ok:true});
 }
 throw new Error('지원하지 않는 요청입니다.');
 }catch(e){return failure(e);}}
