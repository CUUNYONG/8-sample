'use client';
import { useId, useRef, useState } from 'react';

export default function ReservationNotice({ label = '예약하기 ↗', message = '홈페이지 준비중입니다', className = 'nav-book' }: { label?: string; message?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return (
    <><button ref={trigger} type="button" className={className} onClick={() => setOpen(true)}>
      {label}
    </button>
    {open && <div className="reservation-notice-overlay" onKeyDown={event => { if (event.key === 'Escape') close(); if (event.key === 'Tab') { event.preventDefault(); } }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby={titleId} className="reservation-notice-dialog">
        <p id={titleId}>{message}</p>
        <button type="button" autoFocus onClick={close}>확인</button>
      </div>
    </div>}</>
  );
}
