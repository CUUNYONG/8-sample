export const PRICE = 100000;
export const HOUR = 3600000;
export const approvalDeadline = now => now + 24 * HOUR;
export function canPay(r, now = Date.now()) {
 return r.status === 'awaiting_payment' && Number.isFinite(r.expires_at) && now < r.expires_at;
}
// Exclusive boundary: midnight one day before service, in Korean time.
export function refundDeadline(startAt) {
 const date = new Date(startAt + 9 * HOUR).toISOString().slice(0,10);
 return Date.parse(date + 'T00:00:00+09:00') - 24 * HOUR;
}
export const canRefund = (r, now = Date.now()) => r.status === 'confirmed' && now < refundDeadline(r.start_at);
export const overlaps = (a,b) => a.start_at < b.end_at && b.start_at < a.end_at;
export function paymentDecision(r,event,seen,now=Date.now()) {
 if(seen) return 'duplicate';
 if(event.amount !== PRICE || event.currency !== 'KRW' || !event.verified) return 'invalid';
 if(!canPay(r,now)) return 'refund_required';
 return event.success ? 'confirm' : 'retry';
}
