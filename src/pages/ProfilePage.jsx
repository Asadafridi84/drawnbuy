import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useWishlistStore } from '../store';
import { useSocket } from '../hooks/useSocket';

const CSS = `.pw{max-width:960px;margin:0 auto;padding-bottom:2rem}.cover{position:relative;height:240px;background:linear-gradient(135deg,#7c3aed 0%,#4c1d95 50%,#1e1b4b 100%);border-radius:16px 16px 0 0;overflow:hidden}.cover-edit{position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,.55);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px}.profile-card{background:#fff;border-radius:0 0 16px 16px;padding:0 2rem 1.5rem;box-shadow:0 4px 24px rgba(124,58,237,.1);margin-bottom:1.25rem}.avatar-wrap{position:relative;display:inline-block;margin-top:-52px;margin-bottom:.6rem}.av{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:2.2rem;font-weight:800;display:flex;align-items:center;justify-content:center;border:4px solid #fff;box-shadow:0 2px 16px rgba(124,58,237,.35);overflow:hidden}.av img{width:100%;height:100%;object-fit:cover}.av-cam{position:absolute;bottom:4px;right:4px;width:30px;height:30px;border-radius:50%;background:#7c3aed;color:#fff;border:2px solid #fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800}.live-ring{position:absolute;inset:-4px;border-radius:50%;border:3px solid #ef4444;animation:lp 1.5s infinite}@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.06)}}.profile-top{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-top:.5rem}.profile-info{flex:1;min-width:200px}.profile-name{font-size:1.45rem;font-weight:800;color:#1a0a3e;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.verified{color:#7c3aed;font-size:1.1rem}.live-badge{background:#ef4444;color:#fff;font-size:.62rem;font-weight:800;padding:2px 9px;border-radius:20px;letter-spacing:.06em;animation:lp 1.5s infinite}.handle{font-size:.82rem;color:#6b7280;margin:.2rem 0 .75rem}.pstats{display:flex;gap:1.5rem;flex-wrap:wrap;margin-bottom:.85rem}.pstat{text-align:center;cursor:pointer}.pstat:hover .pstat-num{color:#7c3aed}.pstat-num{font-size:1.15rem;font-weight:800;color:#1a0a3e;transition:.15s}.pstat-lbl{font-size:.7rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em}.pactions{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center}.btn-pri{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:10px;padding:.55rem 1.1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s;border:1.5px solid #fbbf24}.btn-pri:hover{opacity:.9}.btn-sec{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s;border:1.5px solid #fbbf24}.btn-sec:hover{background:#ede9fe}.btn-live{background:linear-gradient(90deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:10px;padding:.55rem 1.1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;border:1.5px solid #fbbf24}.btn-end{background:#f4f0ff;color:#ef4444;border:1.5px solid #fca5a5;border-radius:10px;padding:.55rem 1.1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;border:1.5px solid #fbbf24}.tab-wrap{position:relative;margin-bottom:1.25rem}.tab-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:32px;height:32px;border-radius:50%;background:#fff;border:1.5px solid #ede9fe;color:#7c3aed;font-size:.85rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(124,58,237,.15);transition:.15s}.tab-arrow:hover{background:#f4f0ff}.tab-arrow-l{left:0}.tab-arrow-r{right:0}.ptabs{display:flex;gap:0;background:#fff;border-radius:12px;padding:.4rem;box-shadow:0 2px 12px rgba(124,58,237,.08);overflow-x:auto;scroll-behavior:smooth;scrollbar-width:none;margin:0 40px}.ptabs::-webkit-scrollbar{display:none}.ptab{display:flex;align-items:center;gap:.35rem;padding:.55rem .85rem;border-radius:8px;border:none;background:transparent;color:#6b7280;font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:.15s;flex-shrink:0;border:1px solid transparent}.ptab:hover{background:#f4f0ff;color:#7c3aed;border:1px solid #fbbf24}.ptab.on{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:1.5px solid #fbbf24}.pc{background:#fff;border-radius:16px;padding:1.5rem;box-shadow:0 2px 12px rgba(124,58,237,.08);margin-bottom:1rem}.st{font-size:1rem;font-weight:800;color:#1a0a3e;margin-bottom:.25rem}.ss{font-size:.8rem;color:#6b7280;margin-bottom:1.25rem}.fl{font-size:.8rem;font-weight:700;color:#374151;margin-bottom:.4rem;display:block}.fi{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:.65rem .9rem;font-family:inherit;font-size:.88rem;color:#1a0a3e;outline:none;transition:.15s;box-sizing:border-box}.fi:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12)}.fi:disabled{background:#f9fafb;color:#9ca3af}.bp{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:10px;padding:.65rem 1.4rem;font-family:inherit;font-size:.88rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s;border:1.5px solid #fbbf24}.bd{background:#fee2e2;color:#b91c1c;border:1.5px solid #fca5a5;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;border:1.5px solid #fbbf24}.bg2{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:.4rem;border:1.5px solid #fbbf24}.dv{border:none;border-top:1px solid #f3f4f6;margin:1.25rem 0}.ok{background:#d1fae5;color:#065f46;border-radius:8px;padding:.5rem .9rem;font-size:.82rem;font-weight:700;display:inline-flex;align-items:center;gap:.4rem}.fc{display:flex;align-items:center;gap:.9rem;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;background:#fafafa;margin-bottom:.6rem;transition:.15s}.fc:hover{border-color:#ede9fe;background:#f4f0ff}.fa{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:.88rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}.fn{font-size:.9rem;font-weight:700;color:#1a0a3e}.fe{font-size:.75rem;color:#9ca3af}.ftag{font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:20px}.tfam{background:#dbeafe;color:#1d4ed8}.tfri{background:#d1fae5;color:#065f46}.tinv{background:#fef3c7;color:#92400e}.sd{width:8px;height:8px;border-radius:50%;flex-shrink:0}.son{background:#22c55e}.sof{background:#d1d5db}.sin{background:#fbbf24}.nr{display:flex;align-items:center;justify-content:space-between;padding:.85rem 0;border-bottom:1px solid #f3f4f6}.nl{font-size:.88rem;font-weight:600;color:#1a0a3e}.ns{font-size:.75rem;color:#9ca3af}.tog{position:relative;width:44px;height:24px;cursor:pointer;display:inline-block}.tog input{opacity:0;width:0;height:0}.tsl{position:absolute;inset:0;border-radius:24px;background:#e5e7eb;transition:.2s}.tog input:checked + .tsl{background:#7c3aed}.tsl::before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}.tog input:checked + .tsl::before{transform:translateX(20px)}.feed-item{display:flex;gap:.75rem;padding:.85rem 0;border-bottom:1px solid #f3f4f6}.feed-av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:800;flex-shrink:0;color:#fff;background:linear-gradient(135deg,#7c3aed,#5b21b6)}.feed-text{font-size:.85rem;color:#374151;line-height:1.5}.feed-time{font-size:.72rem;color:#9ca3af;margin-top:.2rem}.wb-canvas{width:100%;height:340px;background:#fff;border-radius:12px;border:1.5px solid #ede9fe;cursor:crosshair;display:block}.wb-tools{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;margin-bottom:.75rem}.wb-color{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:.15s}.wb-color.active,.wb-color:hover{border-color:#7c3aed;transform:scale(1.15)}.wb-btn{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:8px;padding:5px 12px;font-size:.78rem;font-weight:700;cursor:pointer;border:1.5px solid #fbbf24}.msg-list{height:300px;overflow-y:auto;padding:.5rem 0;margin-bottom:.75rem;border-bottom:1px solid #f3f4f6}.msg-row{display:flex;gap:.6rem;margin-bottom:.75rem;align-items:flex-end}.msg-row.me{flex-direction:row-reverse}.msg-bubble{max-width:70%;padding:.6rem .9rem;border-radius:14px;font-size:.85rem;line-height:1.5}.msg-row:not(.me) .msg-bubble{background:#f4f0ff;color:#1a0a3e;border-bottom-left-radius:4px}.msg-row.me .msg-bubble{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border-bottom-right-radius:4px}.msg-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:.72rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}.msg-input-row{display:flex;gap:.6rem}.live-card{background:linear-gradient(135deg,#1e1b4b,#4c1d95);border-radius:14px;padding:1.5rem;color:#fff;text-align:center;margin-bottom:1rem}.live-viewers{font-size:2rem;font-weight:800;color:#fbbf24}.past-session{display:flex;align-items:center;justify-content:space-between;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;margin-bottom:.6rem}.ps-name{font-size:.88rem;font-weight:700;color:#1a0a3e}.ps-meta{font-size:.75rem;color:#9ca3af}.badge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.75rem}.badge-card{background:#f4f0ff;border-radius:12px;padding:.85rem;text-align:center;border:1.5px solid #ede9fe;transition:.15s}.badge-card:hover{border-color:#7c3aed}.badge-img{width:48px;height:48px;margin:0 auto .35rem;border-radius:50%;object-fit:cover;background:#ede9fe}.badge-name{font-size:.72rem;font-weight:700;color:#7c3aed}.badge-desc{font-size:.65rem;color:#9ca3af;margin-top:.15rem}.stat-bar{display:flex;align-items:center;gap:.75rem;margin-bottom:.65rem}.stat-bar-label{font-size:.78rem;color:#374151;width:80px;flex-shrink:0}.stat-bar-track{flex:1;height:8px;background:#f3f4f6;border-radius:20px;overflow:hidden}.stat-bar-fill{height:100%;border-radius:20px;background:linear-gradient(90deg,#7c3aed,#5b21b6)}.stat-bar-val{font-size:.75rem;font-weight:700;color:#7c3aed;width:30px;text-align:right;flex-shrink:0}.ref-box{background:linear-gradient(135deg,#f4f0ff,#ede9fe);border-radius:12px;padding:1.25rem;border:1.5px solid #ddd6fe;text-align:center}.ref-link{font-size:.82rem;font-family:monospace;background:#fff;border:1.5px solid #ede9fe;border-radius:8px;padding:.5rem .9rem;color:#7c3aed;font-weight:700;display:inline-block;margin:.5rem 0}.room-card{display:flex;align-items:center;justify-content:space-between;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;background:#fafafa;margin-bottom:.6rem}.room-name{font-size:.9rem;font-weight:700;color:#1a0a3e}.room-meta{font-size:.75rem;color:#9ca3af}.rb{font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:20px}.rb-live{background:#fee2e2;color:#b91c1c}.rb-member{background:#d1fae5;color:#065f46}.rb-guest{background:#fef3c7;color:#92400e}.order-card{display:flex;align-items:center;gap:.9rem;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;margin-bottom:.6rem}.order-img{width:64px;height:64px;border-radius:10px;object-fit:cover;flex-shrink:0;background:#f4f0ff}.order-name{font-size:.88rem;font-weight:700;color:#1a0a3e}.order-meta{font-size:.75rem;color:#9ca3af}.order-price{font-size:.95rem;font-weight:800;color:#7c3aed;white-space:nowrap}.prod-card{background:#fff;border-radius:12px;border:1.5px solid #ede9fe;overflow:hidden;transition:.15s;cursor:pointer}.prod-card:hover{border-color:#7c3aed;box-shadow:0 4px 16px rgba(124,58,237,.12)}.prod-img{width:100%;height:130px;object-fit:cover}.prod-info{padding:.7rem}.prod-name{font-size:.8rem;font-weight:700;color:#1a0a3e;margin-bottom:.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.prod-price{font-size:.88rem;font-weight:800;color:#7c3aed}.prod-store{font-size:.68rem;color:#9ca3af}.prod-btn{width:100%;background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:0 0 10px 10px;padding:.5rem;font-size:.75rem;font-weight:700;cursor:pointer;transition:.15s;border:1.5px solid #fbbf24}.prod-btn:hover{opacity:.9}.sponsored-label{font-size:.65rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem}.toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#1a0a3e;color:#fff;padding:.6rem 1.4rem;border-radius:20px;font-size:.82rem;font-weight:700;z-index:2000;animation:fadeIn .2s ease}@keyframes fadeIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@media(max-width:768px){.pstats{gap:1rem}.pactions{gap:.4rem}.ptabs{margin:0 36px}.wb-outer-grid{grid-template-columns:1fr !important}.wb-canvas{height:min(60vw,300px) !important}}
@media(max-width:480px){.pw{padding-bottom:1rem}.cover{height:160px !important}.profile-card{padding:0 1rem 1rem}.profile-name{font-size:1.15rem}.pactions{flex-wrap:wrap}.pactions button{font-size:.75rem;padding:.45rem .8rem}}`;

/* ─── SVG ICONS FOR TABS (no emojis) ─── */
const IC = {
  canvas:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 17l4-4 3 3 2-2 1 3"/></svg>,
  activity:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  profile:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  friends:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  messages:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  wishlist:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  live:      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path fill="none" stroke="currentColor" strokeWidth="2" d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/></svg>,
  rooms:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  orders:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  badges:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  stats:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  referral:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  notifs:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  security:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  data:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  journal:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
};

const TABS = [
  { id:'whiteboard', label:'Collab-Canvas Drawing', icon: IC.canvas   },
  { id:'feed',       label:'Activity',              icon: IC.activity  },
  { id:'profile',    label:'Profile',               icon: IC.profile   },
  { id:'friends',    label:'Friends',               icon: IC.friends   },
  { id:'messages',   label:'Messages',              icon: IC.messages  },
  { id:'wishlist',   label:'Wishlist',              icon: IC.wishlist  },
  { id:'journal',    label:'Journal',               icon: IC.journal   },
  { id:'live',       label:'Live',                  icon: IC.live      },
  { id:'rooms',      label:'Rooms',                 icon: IC.rooms     },
  { id:'orders',     label:'Orders',                icon: IC.orders    },
  { id:'badges',     label:'Badges',                icon: IC.badges    },
  { id:'stats',      label:'My Stats',              icon: IC.stats     },
  { id:'referral',   label:'Referral',              icon: IC.referral  },
  { id:'notifs',     label:'Notifications',         icon: IC.notifs    },
  { id:'security',   label:'Security',              icon: IC.security  },
  { id:'data',       label:'Your Data',             icon: IC.data      },
];

const FRIENDS = [
  { id:1, name:'Anna Lindqvist',  email:'anna@example.com',  av:'AL', rel:'Family', status:'online',  cv:12 },
  { id:2, name:'Maja Eriksson',   email:'maja@example.com',  av:'ME', rel:'Friend', status:'offline', cv:7  },
  { id:3, name:'Erik Johansson',  email:'erik@example.com',  av:'EJ', rel:'Family', status:'online',  cv:4  },
  { id:4, name:'Sofia Berg',      email:'sofia@example.com', av:'SB', rel:'Friend', status:'offline', cv:19 },
];

const FEED = [
  { id:1, av:'AL', name:'Anna Lindqvist',  text:'Added Nike Air Max 2024 to her wishlist and invited you to draw together.', time:'2 min ago'  },
  { id:2, av:'ME', name:'Maja Eriksson',   text:'Started a new canvas room "Spring Fashion Haul" — 3 people drawing now.',   time:'15 min ago' },
  { id:3, av:'EJ', name:'Erik Johansson',  text:'Shared an IKEA sofa to the Family canvas. Click to see it.',                 time:'1 hr ago'   },
  { id:4, av:'SB', name:'Sofia Berg',      text:"Went live! She's drawing her wishlist right now with 24 viewers.",           time:'2 hr ago'   },
  { id:5, av:'TU', name:'You',             text:'Created canvas room "My Wishlist" and added 4 products.',                    time:'3 hr ago'   },
];

const INIT_MSGS = [
  { id:1, from:'AL', name:'Anna', text:'Hey! Did you see the new Nike drops?', me:false },
  { id:2, from:'me', name:'You',  text:'Yes! I added some to my canvas already', me:true  },
  { id:3, from:'AL', name:'Anna', text:"Let's do a collab canvas this weekend?",  me:false },
];

const BADGES = [
  { img:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=80&h=80&fit=crop', name:'First Canvas',   desc:'Created your first canvas',   earned:true  },
  { img:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=80&h=80&fit=crop', name:'Social Shopper', desc:'Invited 3 friends',            earned:true  },
  { img:'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=80&h=80&fit=crop', name:'Wishlist Pro',   desc:'Saved 10+ products',           earned:true  },
  { img:'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=80&h=80&fit=crop', name:'Gone Live',      desc:'Hosted a live session',        earned:false },
  { img:'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=80&h=80&fit=crop',    name:'First Purchase', desc:'Bought via DrawNBuy',          earned:false },
  { img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop',    name:'Power Shopper',  desc:'50+ products added',           earned:false },
  { img:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=80&h=80&fit=crop', name:'Collab King',    desc:'10 collaborative canvases',    earned:false },
  { img:'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=80&h=80&fit=crop', name:'Global Shopper', desc:'Shopped from 5+ countries',    earned:false },
];

const ROOMS = [
  { id:1, name:'Spring Fashion Haul', members:3, type:'live',   privacy:'public',  last:'Now'        },
  { id:2, name:'My Wishlist',         members:1, type:'member', privacy:'private', last:'2 hrs ago'  },
  { id:3, name:'Family Shopping',     members:4, type:'member', privacy:'friends', last:'Yesterday'  },
  { id:4, name:'Guest Room #2841',    members:0, type:'guest',  privacy:'public',  last:'3 days ago' },
];

const ORDERS = [
  { id:1, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop', name:'Nike Air Max 2024',     store:'Nike',  price:'£129', status:'Delivered',  date:'Apr 18', url:'https://www.amazon.co.uk/s?k=nike+air+max+2024&tag=drawnbuy-21' },
  { id:2, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&h=120&fit=crop', name:'IKEA SODERHAMN Sofa',   store:'IKEA',  price:'£549', status:'Shipped',    date:'Apr 19', url:'https://www.ikea.com/gb/en/p/soederhamn-sofa/' },
  { id:3, img:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=120&h=120&fit=crop',name:'Charlotte Tilbury Kit', store:'Boots', price:'£78',  status:'Processing', date:'Apr 20', url:'https://www.amazon.co.uk/s?k=charlotte+tilbury&tag=drawnbuy-21' },
];

const WISHLIST_PRODUCTS = [
  { id:1, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', name:'Nike Air Max 2024',      price:'£129', store:'Amazon',  url:'https://www.amazon.co.uk/s?k=nike+air+max+2024&tag=drawnbuy-21' },
  { id:2, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',name:'Sony WH-1000XM5',       price:'£279', store:'Amazon',  url:'https://www.amazon.co.uk/s?k=sony+wh1000xm5&tag=drawnbuy-21' },
  { id:3, img:'https://images.unsplash.com/photo-1555041469-a586c71ea9bc?w=400&h=300&fit=crop', name:'IKEA POANG Armchair',    price:'£149', store:'IKEA',    url:'https://www.ikea.com/gb/en/p/poang-armchair/' },
  { id:4, img:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=300&fit=crop',name:'Charlotte Tilbury Kit',  price:'£78',  store:'Boots',   url:'https://www.amazon.co.uk/s?k=charlotte+tilbury&tag=drawnbuy-21' },
];

const SPONSORED_PRODUCTS = [
  { id:1, img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', name:'Apple Watch Series 9', price:'£399', store:'Amazon',  url:'https://www.amazon.co.uk/s?k=apple+watch+series+9&tag=drawnbuy-21' },
  { id:2, img:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop', name:'Nike React Infinity',  price:'£109', store:'Amazon',  url:'https://www.amazon.co.uk/s?k=nike+react+infinity&tag=drawnbuy-21' },
  { id:3, img:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=300&fit=crop', name:'Dyson Airwrap',        price:'£479', store:'Currys',  url:'https://www.amazon.co.uk/s?k=dyson+airwrap&tag=drawnbuy-21' },
  { id:4, img:'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop', name:'Instant Camera Kit',   price:'£79',  store:'Amazon',  url:'https://www.amazon.co.uk/s?k=instax+camera&tag=drawnbuy-21' },
];

const PAST_SESSIONS = [
  { id:1, name:'Spring Fashion Haul', viewers:24, duration:'42 min', date:'Apr 19' },
  { id:2, name:'IKEA Home Tour',      viewers:11, duration:'28 min', date:'Apr 15' },
  { id:3, name:'Sneaker Drop Watch',  viewers:38, duration:'1h 5min',date:'Apr 10' },
];

const SHOP_STATS = [
  {label:'Fashion', pct:72},
  {label:'Tech',    pct:45},
  {label:'Home',    pct:61},
  {label:'Beauty',  pct:38},
  {label:'Sports',  pct:22},
  {label:'Food',    pct:15},
];

const WB_COLORS = ['#7c3aed','#ef4444','#f59e0b','#22c55e','#3b82f6','#ec4899','#000000'];

const safeOpen = (url) => {
  if (!url) return;
  const trusted = ['amazon.co.uk','amazon.com','ikea.com','boots.com','currys.co.uk'];
  try {
    const host = new URL(url).hostname.replace('www.','');
    if (trusted.some(d => host.endsWith(d))) window.open(url,'_blank','noopener,noreferrer');
  } catch(e) {}
};

export default function ProfilePage() {
  const navigate   = useNavigate();
  const user       = useAuthStore(s => s.user);
  const logout     = useAuthStore(s => s.logout);
  const updateUser = useAuthStore(s => s.updateUser);

  const [tab,      setTab]      = useState('whiteboard');
  const [name,     setName]     = useState(user?.name || '');
  const [bio,      setBio]      = useState(user?.bio  || '');
  const [saved,    setSaved]    = useState(false);
  const [friends,  setFriends]  = useState(FRIENDS);
  const [iEmail,   setIEmail]   = useState('');
  const [iRel,     setIRel]     = useState('Friend');
  const [iSent,    setISent]    = useState(false);
  const [notifs,   setNotifs]   = useState({deals:true,collabs:true,news:false,weekly:true,live:true});
  const [delConf,  setDelConf]  = useState(false);
  const [isLive,   setIsLive]   = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [msgs,     setMsgs]     = useState(INIT_MSGS);
  const [msgText,  setMsgText]  = useState('');
  const [wbColor,  setWbColor]  = useState('#7c3aed');
  const [wbSize,   setWbSize]   = useState(3);
  const [drawing,  setDrawing]  = useState(false);
  const [toast,    setToast]    = useState('');
  const [avatarImg,setAvatarImg]= useState(null);
  const [coverImg, setCoverImg]  = useState(null);
  const [coverPicker, setCoverPicker] = useState(false);
  const [avatarPicker, setAvatarPicker] = useState(false);
  const [droppedProducts, setDroppedProducts] = useState([]);
  const [journalEntries, setJournalEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dnb_journal') || '[]'); } catch { return []; }
  });
  const [journalModal, setJournalModal] = useState(false);
  const [journalText, setJournalText] = useState('');

  const [chatText, setChatText] = useState('');
  const [chatMsgs, setChatMsgs] = useState([
    {av:'M',bg:'#22c55e',name:'Maja',text:'Love your canvas! The sofa sketch is so good',time:'14:20',me:false},
    {av:'L',bg:'#0ea5e9',name:'Lars',text:'Added this from your wishlist!',time:'14:21',me:false},
    {av:'A',bg:'#7c3aed',name:'You', text:'Yes! Amazing quality from IKEA',time:'14:22',me:true},
  ]);
  const wishlist    = useWishlistStore(s => s.items);
  const wishlistAdd = useWishlistStore(s => s.addItem);
  const wishlistRm  = useWishlistStore(s => s.removeItem);
  const wishlistHas = useWishlistStore(s => s.hasItem);

  const { connect, sendDraw, sendMessage, onRemoteDraw } = useSocket();
  const profileRoomId = 'profile-' + (user?.name || 'guest').toLowerCase().replace(/\s+/g,'').slice(0,10);

  // Seed default wishlist items once on first load
  useEffect(() => {
    if (wishlist.length === 0) {
      WISHLIST_PRODUCTS.forEach(p => wishlistAdd(p));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bug 1: Join profile socket room and sync whiteboard strokes
  useEffect(() => {
    if (tab !== 'whiteboard') return;
    connect(profileRoomId, user?.name || 'Anonymous');
    const unsub = onRemoteDraw((d) => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(d.x1, d.y1);
      ctx.lineTo(d.x2, d.y2);
      ctx.strokeStyle = d.color || '#7c3aed';
      ctx.lineWidth = d.width || 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const [pwForm,   setPwForm]   = useState(false);
  const [pwOld,    setPwOld]    = useState('');
  const [pwNew,    setPwNew]    = useState('');

  const tabsRef    = useRef(null);
  const canvasRef  = useRef(null);
  const lastPosRef = useRef(null);
  const fileRef    = useRef(null);
  const coverFileRef    = useRef(null);
  const coverCamRef     = useRef(null);
  const avatarCamRef    = useRef(null);
  const coverRef  = useRef(null);

  const initials = (user?.name||'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const refCode  = initials.toLowerCase()+'2026';

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''),2200); };

  const doSave   = () => { updateUser?.({name,bio}); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const doInvite = () => {
    if (!iEmail) return;
    setFriends(p=>[...p,{id:Date.now(),name:iEmail.split('@')[0],email:iEmail,av:iEmail[0].toUpperCase(),rel:iRel,status:'invited',cv:0}]);
    setIEmail(''); setISent(true); setTimeout(()=>setISent(false),2000);
  };
  const doCopy = () => {
    navigator.clipboard?.writeText('https://drawnbuy.com/ref/'+refCode).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
    showToast('Referral link copied!');
  };
  const doCopyProfile = () => {
    navigator.clipboard?.writeText('https://drawnbuy.com/u/'+refCode).catch(()=>{});
    showToast('Profile link copied!');
  };
  const doSendMsg = () => {
    if (!msgText.trim()) return;
    setMsgs(p=>[...p,{id:Date.now(),from:'me',name:'You',text:msgText,me:true}]);
    setMsgText('');
  };
  const doSendChat = () => {
    if (!chatText.trim()) return;
    const now = new Date();
    const t = now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');
    setChatMsgs(p=>[...p,{av:'A',bg:'#7c3aed',name:'You',text:chatText,time:t,me:true}]);
    sendMessage(chatText);
    setChatText('');
  };
  const doAvatarCamChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarImg(URL.createObjectURL(f));
    showToast('Profile photo updated!');
    setAvatarPicker(false);
  };
  const doCoverChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setCoverImg(url);
    showToast('Cover photo updated!');
    setCoverPicker(false);
  };
  const doAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarImg(url);
    showToast('Profile photo updated!');
  };
  const doExportData = () => {
    const data = JSON.stringify({user,exportedAt:new Date().toISOString()},null,2);
    const blob = new Blob([data],{type:'application/json'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='drawnbuy-my-data.json'; a.click();
    showToast('Data exported!');
  };
  const doChangePw = () => {
    if (!pwOld||!pwNew) return;
    showToast('Password updated!');
    setPwForm(false); setPwOld(''); setPwNew('');
  };
  const addToWishlist = (prod) => {
    const added = wishlistAdd(prod);
    showToast(added ? '♡ Added to wishlist!' : 'Already in wishlist');
  };

  const saveJournalEntry = () => {
    if (!journalText.trim()) return;
    const entry = { id: Date.now(), text: journalText.trim(), date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) };
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem('dnb_journal', JSON.stringify(updated));
    setJournalText('');
    setJournalModal(false);
    showToast('Journal entry saved!');
  };

  const scrollTabs = (dir) => {
    if (tabsRef.current) tabsRef.current.scrollBy({left:dir*150,behavior:'smooth'});
  };

  const getPos = (e,c) => {
    const r=c.getBoundingClientRect();
    const scaleX=c.width/r.width;
    const scaleY=c.height/r.height;
    const s=e.touches?e.touches[0]:e;
    return {x:(s.clientX-r.left)*scaleX,y:(s.clientY-r.top)*scaleY};
  };
  const wbStart=(e)=>{e.preventDefault();const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');const pos=getPos(e,c);ctx.beginPath();ctx.moveTo(pos.x,pos.y);lastPosRef.current=pos;setDrawing(true);};
  const wbMove=(e)=>{e.preventDefault();if(!drawing)return;const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');const pos=getPos(e,c);ctx.strokeStyle=wbColor;ctx.lineWidth=wbSize;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineTo(pos.x,pos.y);ctx.stroke();ctx.beginPath();ctx.moveTo(pos.x,pos.y);if(lastPosRef.current){sendDraw({x1:lastPosRef.current.x,y1:lastPosRef.current.y,x2:pos.x,y2:pos.y,color:wbColor,width:wbSize});}lastPosRef.current=pos;};
  const wbEnd=()=>{setDrawing(false);lastPosRef.current=null;};
  const wbClear=()=>{const c=canvasRef.current;if(!c)return;c.getContext('2d').clearRect(0,0,c.width,c.height);showToast('Canvas cleared');};
  const wbSave=()=>{const c=canvasRef.current;if(!c)return;const a=document.createElement('a');a.download='drawnbuy-canvas.png';a.href=c.toDataURL();a.click();showToast('Canvas saved!');};

  const ProdCard = ({p}) => {
    const isWishlisted = wishlistHas(p.id);
    return (
      <div className="prod-card" onClick={()=>safeOpen(p.url)}
        draggable
        onDragStart={e => {
          e.stopPropagation();
          e.dataTransfer.setData('application/drawnbuy-product', JSON.stringify({
            name: p.name, price: p.price, img: p.img,
            url: p.url || `https://www.amazon.co.uk/s?k=${encodeURIComponent(p.name)}&tag=drawnbuy-21`
          }));
          e.dataTransfer.effectAllowed = 'copy';
        }}
      >
        <img className="prod-img" src={p.img} alt={p.name} onError={e=>{e.target.style.background='#f4f0ff';e.target.style.display='none';}}/>
        <div className="prod-info">
          <div className="prod-name">{p.name}</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div className="prod-price">{p.price}</div>
            <div className="prod-store">{p.store}</div>
          </div>
        </div>
        <button className="prod-btn" onClick={e => {
          e.stopPropagation();
          if (isWishlisted) { wishlistRm(p.id); showToast('♡ Removed from wishlist'); }
          else { addToWishlist(p); }
        }}>
          {isWishlisted ? '♥ Remove' : '♡ + Wishlist'}
        </button>
      </div>
    );
  };

  return (
    <div style={{minHeight:'100vh',background:'#f4f0ff',padding:'1.5rem 1rem'}}>
      <style>{CSS}</style>
      <div className="pw">

        {/* COVER */}
        <div className="cover" style={coverImg ? {backgroundImage:`url(${coverImg})`,backgroundSize:'cover',backgroundPosition:'center'} : {}}>
          <button className="cover-edit" onClick={()=>setCoverPicker(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Edit Cover
          </button>
          <input ref={coverFileRef} type="file" accept="image/*" style={{display:'none'}} onChange={doCoverChange}/>
          <input ref={coverCamRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={doCoverChange}/>
        </div>

        {/* PROFILE CARD */}
        <div className="profile-card">
          <div className="profile-top">
            <div style={{display:'flex',alignItems:'flex-end',gap:'1.25rem',flexWrap:'wrap'}}>
              <div className="avatar-wrap">
                <div className="av" onClick={()=>setAvatarPicker(true)} style={{cursor:'pointer'}}>
                  {avatarImg ? <img src={avatarImg} alt="avatar"/> : initials}
                </div>
                {isLive && <div className="live-ring"/>}
                <div className="av-cam" onClick={()=>setAvatarPicker(true)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={doAvatarChange}/>
                <input ref={avatarCamRef} type="file" accept="image/*" capture="user" style={{display:'none'}} onChange={doAvatarCamChange}/>
              </div>
              <div className="profile-info">
                <div className="profile-name">
                  {user?.name||'Asad Afridi'}
                  <span className="verified">✓</span>
                  {isLive && <span className="live-badge">LIVE</span>}
                </div>
                <div className="handle">@{(user?.name||'asad.afridi').toLowerCase().replace(' ','.')} · Stockholm, Sweden</div>
                <div className="pstats">
                  {[['247','Friends'],['38','Wishlist'],['12','Sessions'],['1.2K','Viewers'],['8','Badges']].map(([n,l])=>(
                    <div key={l} className="pstat"><div className="pstat-num">{n}</div><div className="pstat-lbl">{l}</div></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pactions">
              <button className="btn-sec" onClick={()=>setTab('profile')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Profile
              </button>
              <button className="btn-sec" onClick={doCopyProfile}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Share
              </button>
              <button className={isLive?'btn-end':'btn-live'} onClick={()=>setIsLive(v=>!v)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
                {isLive?'End Live':'Go Live'}
              </button>
              <button className="btn-sec" onClick={()=>setTab('messages')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Messages
              </button>
            </div>
          </div>
        </div>

        {/* TAB BAR */}
        <div className="tab-wrap">
          <button className="tab-arrow tab-arrow-l" onClick={()=>scrollTabs(-1)}>&#8249;</button>
          <div className="ptabs" ref={tabsRef}>
            {TABS.map(({id,label,icon})=>(
              <button key={id} className={'ptab'+(tab===id?' on':'')} onClick={()=>setTab(id)}>
                {icon} {label}
              </button>
            ))}
          </div>
          <button className="tab-arrow tab-arrow-r" onClick={()=>scrollTabs(1)}>&#8250;</button>
        </div>

        {/* ── COLLAB-CANVAS DRAWING ── */}
        {tab==='whiteboard' && (
          <div>
            <div className="wb-outer-grid" style={{display:'grid',gridTemplateColumns:'220px 1fr 260px',gap:'1rem',alignItems:'start',marginBottom:'1.25rem'}}>
              <div>
                <div className="pc" style={{marginBottom:'1rem'}}>
                  <div className="st" style={{fontSize:'.85rem',marginBottom:'.75rem'}}>Who sees my canvas?</div>
                  {[['Everyone','8 people'],['Friends only','5 people'],['Family only','3 people']].map(([l,c],i)=>(
                    <label key={i} style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.5rem',borderRadius:'8px',cursor:'pointer',marginBottom:'.3rem',background:i===0?'#f4f0ff':'transparent'}}>
                      <input type="radio" name="canvPriv" defaultChecked={i===0} style={{accentColor:'#7c3aed'}}/>
                      <span style={{fontSize:'.8rem',fontWeight:700,color:'#1a0a3e',flex:1}}>{l}</span>
                      <span style={{fontSize:'.7rem',color:'#9ca3af'}}>{c}</span>
                    </label>
                  ))}
                </div>
                <div className="pc">
                  <div className="st" style={{fontSize:'.85rem',marginBottom:'.75rem'}}>Friends Online</div>
                  {[['AL','Anna Lindqvist','#7c3aed','Family',true],['ME','Maja Eriksson','#22c55e','Friend',true],['EJ','Erik Johansson','#fbbf24','Family',false],['SB','Sofia Berg','#ef4444','Friend',false]].map(([av,n,bg,tag,online])=>(
                    <div key={n} style={{display:'flex',alignItems:'center',gap:'.6rem',marginBottom:'.6rem'}}>
                      <div style={{width:34,height:34,borderRadius:'50%',background:bg,color:bg==='#fbbf24'?'#3b0764':'#fff',fontSize:'.72rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative'}}>
                        {av}
                        <div style={{position:'absolute',bottom:0,right:0,width:9,height:9,borderRadius:'50%',background:online?'#22c55e':'#d1d5db',border:'2px solid #fff'}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'.78rem',fontWeight:700,color:'#1a0a3e',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{n}</div>
                        <span style={{fontSize:'.65rem',fontWeight:700,padding:'1px 6px',borderRadius:20,background:tag==='Family'?'#dbeafe':'#d1fae5',color:tag==='Family'?'#1d4ed8':'#065f46'}}>{tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pc" style={{padding:'1rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'.6rem',marginBottom:'.75rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.4rem',background:'#ef4444',color:'#fff',fontSize:'.65rem',fontWeight:800,padding:'3px 9px',borderRadius:20}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:'#fff',opacity:.85}}/>LIVE
                  </div>
                  <span style={{fontSize:'.9rem',fontWeight:800,color:'#1a0a3e',flex:1}}>My Profile Canvas <span style={{fontSize:'.68rem',fontWeight:600,color:'#9ca3af',fontFamily:'monospace'}}>#{profileRoomId}</span></span>
                  <div style={{display:'flex'}}>
                    {[['#7c3aed','A'],['#fbbf24','M'],['#22c55e','J']].map(([bg,l])=>(
                      <div key={l} style={{width:26,height:26,borderRadius:'50%',background:bg,color:bg==='#fbbf24'?'#3b0764':'#fff',fontSize:'.7rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #fff',marginLeft:'-6px'}}>{l}</div>
                    ))}
                  </div>
                </div>
                <div className="wb-tools">
                  {WB_COLORS.map(c=>(
                    <div key={c} className={'wb-color'+(wbColor===c?' active':'')} style={{background:c}} onClick={()=>setWbColor(c)}/>
                  ))}
                  <input type="range" min={1} max={20} value={wbSize} onChange={e=>setWbSize(+e.target.value)} style={{width:'70px',accentColor:'#7c3aed'}}/>
                  <button className="wb-btn" onClick={wbClear}>Clear</button>
                  <button className="wb-btn" onClick={wbSave}>Save PNG</button>
                  <button className="wb-btn" onClick={()=>navigate('/?room='+profileRoomId)}>Full Canvas</button>
                </div>
                <div style={{position:'relative',width:'100%'}}>
                <canvas ref={canvasRef} className="wb-canvas" width={900} height={380}
                  onMouseDown={wbStart} onMouseMove={wbMove} onMouseUp={wbEnd} onMouseLeave={wbEnd}
                  onTouchStart={wbStart} onTouchMove={wbMove} onTouchEnd={wbEnd}
                  onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';}}
                  onDrop={e=>{
                    e.preventDefault();
                    const raw=e.dataTransfer.getData('application/drawnbuy-product');
                    if(!raw)return;
                    try{
                      const pd=JSON.parse(raw);
                      const c=canvasRef.current;if(!c)return;
                      const rect=c.getBoundingClientRect();
                      const x=e.clientX-rect.left;
                      const y=e.clientY-rect.top;
                      setDroppedProducts(prev=>[...prev,{...pd,x,y,id:Date.now()}]);
                      showToast(`${pd.name} added to canvas!`);
                    }catch(_){}
                  }}/>
                {droppedProducts.map(dp=>(
                  <div key={dp.id} style={{position:'absolute',left:dp.x,top:dp.y,transform:'translate(-50%,-50%)',background:'#fff',border:'2px solid #fbbf24',borderRadius:10,boxShadow:'0 4px 16px rgba(124,58,237,.2)',width:120,overflow:'hidden',zIndex:10,pointerEvents:'auto'}}>
                    <img src={dp.img} alt={dp.name} style={{width:'100%',height:70,objectFit:'cover',display:'block'}} onError={e=>{e.target.style.display='none';}}/>
                    <div style={{padding:'5px 7px'}}>
                      <div style={{fontSize:'.68rem',fontWeight:700,color:'#1a0a3e',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{dp.name}</div>
                      <div style={{fontSize:'.75rem',fontWeight:800,color:'#7c3aed'}}>{dp.price}</div>
                    </div>
                    <button onClick={()=>setDroppedProducts(prev=>prev.filter(d=>d.id!==dp.id))} style={{position:'absolute',top:2,right:2,background:'rgba(0,0,0,.55)',color:'#fff',border:'none',borderRadius:4,width:18,height:18,fontSize:'.6rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>✕</button>
                  </div>
                ))}
                </div>
              </div>
              <div style={{background:'linear-gradient(135deg,#1e1b4b,#4c1d95)',borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',height:'100%',minHeight:500}}>
                <div style={{padding:'1rem',display:'flex',alignItems:'center',gap:'.5rem',borderBottom:'1px solid rgba(255,255,255,.1)'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e'}}/>
                  <span style={{color:'#fff',fontWeight:800,fontSize:'.88rem',flex:1}}>Canvas Chat</span>
                </div>
                <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:'.75rem'}}>
                  {chatMsgs.map((m,i)=>(
                    <div key={i} style={{display:'flex',gap:'.5rem',flexDirection:m.me?'row-reverse':'row',alignItems:'flex-end'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:m.bg,color:'#fff',fontSize:'.7rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{m.av}</div>
                      <div style={{background:m.me?'linear-gradient(90deg,#7c3aed,#5b21b6)':'rgba(255,255,255,.1)',borderRadius:12,padding:'.5rem .75rem',maxWidth:'75%'}}>
                        {!m.me&&<div style={{fontSize:'.65rem',fontWeight:700,color:'rgba(255,255,255,.5)',marginBottom:'.15rem'}}>{m.name}</div>}
                        <div style={{fontSize:'.82rem',color:'#fff',lineHeight:1.4}}>{m.text}</div>
                        <div style={{fontSize:'.62rem',color:'rgba(255,255,255,.4)',marginTop:'.2rem',textAlign:m.me?'right':'left'}}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{padding:'.75rem',borderTop:'1px solid rgba(255,255,255,.1)',display:'flex',gap:'.5rem'}}>
                  <input value={chatText} onChange={e=>setChatText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSendChat()} placeholder="Say something..." style={{flex:1,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',borderRadius:10,padding:'.5rem .75rem',color:'#fff',fontSize:'.82rem',outline:'none'}}/>
                  <button onClick={doSendChat} style={{background:'linear-gradient(90deg,#7c3aed,#5b21b6)',border:'none',borderRadius:10,width:38,height:38,color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
            </div>
            {/* SPONSORED PRODUCTS BELOW CANVAS */}
            <div className="pc">
              <div className="sponsored-label">Sponsored — Products to add to your canvas</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem'}}>
                {SPONSORED_PRODUCTS.map(p=><ProdCard key={p.id} p={p}/>)}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY FEED ── */}
        {tab==='feed' && (
          <div className="pc">
            <div className="st">Activity Feed</div>
            <div className="ss">What your friends and connections are up to right now.</div>
            {FEED.map(f=>(
              <div key={f.id} className="feed-item">
                <div className="feed-av">{f.av}</div>
                <div>
                  <div className="feed-text"><strong>{f.name}</strong> {f.text}</div>
                  <div className="feed-time">{f.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROFILE EDIT ── */}
        {tab==='profile' && (
          <div className="pc">
            <div className="st">Profile Information</div>
            <div className="ss">Update your display name, bio, handle and shopping preferences.</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
              <div><label className="fl">Display Name</label><input className="fi" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
              <div><label className="fl">Handle</label><input className="fi" placeholder="@yourhandle" defaultValue={'@'+(user?.name||'user').toLowerCase().replace(' ','.').replace(/[^a-z0-9.]/g,'')}/></div>
              <div><label className="fl">Location</label><input className="fi" defaultValue="Stockholm, Sweden" placeholder="Your city"/></div>
              <div><label className="fl">Email</label><input className="fi" value={user?.email||''} disabled/></div>
            </div>
            <div style={{marginBottom:'1.25rem'}}>
              <label className="fl">Bio <span style={{color:'#9ca3af',fontWeight:400}}>{bio.length}/300</span></label>
              <textarea className="fi" value={bio} onChange={e=>setBio(e.target.value.slice(0,300))} rows={3} placeholder="Tell people what you shop for..." style={{resize:'vertical'}}/>
            </div>
            <hr className="dv"/>
            <div className="st">Shopping Preferences</div>
            <div className="ss">Help us show you more relevant products.</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',marginBottom:'1.25rem'}}>
              {['Fashion','Tech','Home','Beauty','Sports','Food','Travel','Books'].map(c=>(
                <label key={c} style={{display:'flex',alignItems:'center',gap:'.5rem',cursor:'pointer',fontSize:'.85rem',fontWeight:600,color:'#374151'}}>
                  <input type="checkbox" defaultChecked={['Fashion','Home','Tech'].includes(c)} style={{accentColor:'#7c3aed',width:16,height:16}}/> {c}
                </label>
              ))}
            </div>
            {saved?<div className="ok">&#10003; Saved!</div>:<button className="bp" onClick={doSave}>Save Changes</button>}
          </div>
        )}

        {/* ── FRIENDS ── */}
        {tab==='friends' && (
          <div className="pc">
            <div className="st">Friends &amp; Family</div>
            <div className="ss">Shop and draw together. Invite new connections by email.</div>
            <div style={{background:'#f4f0ff',borderRadius:'12px',padding:'1rem',marginBottom:'1.25rem',border:'1.5px solid #ede9fe'}}>
              <div style={{fontSize:'.82rem',fontWeight:'700',color:'#7c3aed',marginBottom:'.75rem'}}>Invite someone</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:'.6rem',alignItems:'end'}}>
                <div><label className="fl">Email</label><input className="fi" value={iEmail} onChange={e=>setIEmail(e.target.value)} placeholder="friend@example.com" type="email"/></div>
                <div><label className="fl">Relation</label>
                  <select className="fi" value={iRel} onChange={e=>setIRel(e.target.value)} style={{width:'120px'}}>
                    <option>Friend</option><option>Family</option><option>Partner</option><option>Colleague</option>
                  </select>
                </div>
                <button className="bp" onClick={doInvite} style={{marginBottom:'1px'}}>Invite</button>
              </div>
              {iSent&&<div className="ok" style={{marginTop:'.6rem'}}>&#10003; Invitation sent!</div>}
            </div>
            <div style={{fontSize:'.75rem',fontWeight:'800',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.75rem'}}>{friends.length} connections</div>
            {friends.map(f=>(
              <div key={f.id} className="fc">
                <div className="fa">{f.av}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.4rem',flexWrap:'wrap'}}>
                    <div className="fn">{f.name}</div>
                    <span className={'ftag '+(f.status==='invited'?'tinv':f.rel==='Family'?'tfam':'tfri')}>{f.status==='invited'?'Invited':f.rel}</span>
                  </div>
                  <div className="fe">{f.email}</div>
                  {f.cv>0&&<div style={{fontSize:'.72rem',color:'#9ca3af'}}>{f.cv} shared canvases</div>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                  <div className={'sd '+(f.status==='online'?'son':f.status==='invited'?'sin':'sof')} title={f.status}/>
                  {f.status!=='invited'&&<button className="bg2" style={{padding:'4px 10px',fontSize:'.72rem'}} onClick={()=>navigate('/?room=friend-'+f.id)}>Draw Together</button>}
                  <button onClick={()=>setFriends(p=>p.filter(x=>x.id!==f.id))} style={{background:'none',border:'none',cursor:'pointer',color:'#d1d5db',padding:'4px'}}>&#x2715;</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab==='messages' && (
          <div className="pc">
            <div className="st">Messages</div>
            <div className="ss">Chat with your friends and collaborators.</div>
            <div style={{display:'flex',gap:'.75rem',marginBottom:'.75rem',paddingBottom:'.75rem',borderBottom:'1px solid #f3f4f6',overflowX:'auto'}}>
              {FRIENDS.map(f=>(
                <div key={f.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'.25rem',cursor:'pointer',flex:'0 0 auto'}} onClick={()=>showToast('Chat with '+f.name.split(' ')[0]+' — coming soon!')}>
                  <div style={{position:'relative'}}>
                    <div className="fa" style={{width:'46px',height:'46px'}}>{f.av}</div>
                    <div className={'sd '+(f.status==='online'?'son':'sof')} style={{position:'absolute',bottom:2,right:2,border:'2px solid #fff'}}/>
                  </div>
                  <div style={{fontSize:'.7rem',color:'#374151',fontWeight:600}}>{f.name.split(' ')[0]}</div>
                </div>
              ))}
            </div>
            <div className="msg-list">
              {msgs.map(m=>(
                <div key={m.id} className={'msg-row'+(m.me?' me':'')}>
                  {!m.me&&<div className="msg-av">{m.from}</div>}
                  <div className="msg-bubble">{m.text}</div>
                  {m.me&&<div className="msg-av">TU</div>}
                </div>
              ))}
            </div>
            <div className="msg-input-row">
              <input className="fi" value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Type a message..." onKeyDown={e=>e.key==='Enter'&&doSendMsg()} style={{flex:1}}/>
              <button className="bp" onClick={doSendMsg}>Send</button>
            </div>
          </div>
        )}

        {/* ── WISHLIST ── */}
        {tab==='wishlist' && (
          <div>
            <div className="pc">
              <div className="st">Your Wishlist</div>
              <div className="ss">Products you have saved across DrawNBuy.</div>
              {wishlist.length===0 ? (
                <div style={{textAlign:'center',padding:'3rem 1.5rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
                  {/* Illustrated empty state */}
                  <div style={{width:96,height:96,borderRadius:'50%',background:'linear-gradient(135deg,#f4f0ff,#ede9fe)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(124,58,237,.12)'}}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{fontSize:'1rem',fontWeight:'800',color:'#1a0a3e',marginBottom:'.35rem'}}>Your wishlist is empty</div>
                    <div style={{fontSize:'.85rem',color:'#6b7280',lineHeight:1.6,maxWidth:'280px',margin:'0 auto'}}>
                      Drag products from the canvas to save them here 🛍️
                    </div>
                  </div>
                  <button className="bp" onClick={()=>navigate('/')} style={{marginTop:'.25rem'}}>
                    Browse Products
                  </button>
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'1rem'}}>
                  {wishlist.map(p=><ProdCard key={p.id} p={p}/>)}
                </div>
              )}
            </div>
            <div className="pc">
              <div className="st">Trending — Add to your wishlist</div>
              <div className="ss">Products popular with people like you.</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'1rem'}}>
                {WISHLIST_PRODUCTS.map(p=><ProdCard key={p.id} p={p}/>)}
              </div>
            </div>
          </div>
        )}

        {/* ── JOURNAL ── */}
        {tab==='journal' && (
          <div className="pc">
            {journalModal && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:900,display:'flex',alignItems:'center',justifyContent:'center'}}
                onClick={()=>setJournalModal(false)}>
                <div style={{background:'#fff',borderRadius:16,padding:'1.5rem',maxWidth:480,width:'90%',position:'relative',boxShadow:'0 20px 60px rgba(0,0,0,.3)'}}
                  onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>setJournalModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:18,cursor:'pointer',color:'#9ca3af'}}>✕</button>
                  <div style={{fontSize:'1rem',fontWeight:800,color:'#1a0a3e',marginBottom:'.75rem'}}>📓 New Journal Entry</div>
                  <textarea className="fi" value={journalText} onChange={e=>setJournalText(e.target.value)} rows={5} placeholder="What are you looking for? What caught your eye today? Any wishlist ideas..." style={{resize:'vertical',marginBottom:'1rem'}}/>
                  <button className="bp" onClick={saveJournalEntry}>Save Entry</button>
                </div>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.25rem'}}>
              <div className="st">Your Shopping Journal</div>
              <button className="bp" style={{fontSize:'.78rem',padding:'6px 14px'}} onClick={()=>setJournalModal(true)}>+ Add Entry</button>
            </div>
            <div className="ss">Notes, ideas, and wishlist moments.</div>
            {journalEntries.length===0 ? (
              <div style={{textAlign:'center',padding:'3rem 1.5rem',color:'#9ca3af'}}>
                <div style={{fontSize:'2.5rem',marginBottom:'.75rem'}}>📓</div>
                <div style={{fontWeight:800,color:'#1a0a3e',marginBottom:'.35rem'}}>Start your journal</div>
                <div style={{fontSize:'.85rem',lineHeight:1.6}}>Note what you love, what you are looking for, what you want to draw next 🎨</div>
                <button className="bp" style={{marginTop:'1rem'}} onClick={()=>setJournalModal(true)}>Write First Entry</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
                {journalEntries.map(e=>(
                  <div key={e.id} style={{background:'#f4f0ff',borderRadius:12,padding:'1rem',border:'1.5px solid #ede9fe',position:'relative'}}>
                    <div style={{fontSize:'.7rem',color:'#9ca3af',fontWeight:700,marginBottom:'.4rem'}}>{e.date}</div>
                    <div style={{fontSize:'.88rem',color:'#1a0a3e',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{e.text}</div>
                    <button onClick={()=>{const u=journalEntries.filter(x=>x.id!==e.id);setJournalEntries(u);localStorage.setItem('dnb_journal',JSON.stringify(u));}} style={{position:'absolute',top:10,right:10,background:'none',border:'none',color:'#d1d5db',cursor:'pointer',fontSize:'.8rem'}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LIVE ── */}
        {tab==='live' && (
          <div>
            <div className="live-card">
              {isLive ? (
                <>
                  <div style={{fontSize:'.82rem',fontWeight:700,color:'#fbbf24',marginBottom:'.5rem'}}>YOU ARE LIVE</div>
                  <div className="live-viewers">24</div>
                  <div style={{fontSize:'.82rem',color:'rgba(255,255,255,.7)',marginBottom:'1rem'}}>viewers watching</div>
                  <button className="btn-end" onClick={()=>setIsLive(false)}>End Live Session</button>
                </>
              ) : (
                <>
                  <div style={{fontSize:'1.1rem',fontWeight:800,marginBottom:'.5rem'}}>Go Live on DrawNBuy</div>
                  <div style={{fontSize:'.82rem',color:'rgba(255,255,255,.7)',marginBottom:'1rem'}}>Let friends watch you draw your wishlist in real time</div>
                  <div style={{display:'flex',gap:'.75rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'1rem'}}>
                    {['Public','Friends only','Invite only'].map(opt=>(
                      <label key={opt} style={{display:'flex',alignItems:'center',gap:'.35rem',fontSize:'.78rem',color:'rgba(255,255,255,.8)',cursor:'pointer'}}>
                        <input type="radio" name="live-privacy" defaultChecked={opt==='Public'} style={{accentColor:'#fbbf24'}}/> {opt}
                      </label>
                    ))}
                  </div>
                  <button className="btn-live" onClick={()=>setIsLive(true)}>Start Live Session</button>
                </>
              )}
            </div>
            <div className="pc">
              <div className="st">Past Live Sessions</div>
              <div className="ss">Your live session history and viewer counts.</div>
              {PAST_SESSIONS.map(s=>(
                <div key={s.id} className="past-session">
                  <div>
                    <div className="ps-name">{s.name}</div>
                    <div className="ps-meta">{s.date} · {s.duration} · {s.viewers} viewers</div>
                  </div>
                  <button className="bg2" style={{fontSize:'.75rem',padding:'5px 12px'}} onClick={()=>showToast('Replay coming soon!')}>Replay</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ROOMS ── */}
        {tab==='rooms' && (
          <div className="pc">
            <div className="st">Your Canvas Rooms</div>
            <div className="ss">Rooms you created or joined. Members keep rooms forever, guests for 48h.</div>
            {ROOMS.map(r=>(
              <div key={r.id} className="room-card">
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.2rem'}}>
                    <div className="room-name">{r.name}</div>
                    <span className={'rb '+(r.type==='live'?'rb-live':r.type==='guest'?'rb-guest':'rb-member')}>
                      {r.type==='live'?'Live':r.type==='guest'?'Guest':'Member'}
                    </span>
                  </div>
                  <div className="room-meta">{r.members} {r.members===1?'member':'members'} · {r.privacy} · {r.last}</div>
                </div>
                <button className="btn-pri" style={{fontSize:'.75rem',padding:'6px 12px'}} onClick={()=>navigate('/?room=ROOM' + r.id)}>Open</button>
              </div>
            ))}
            <div style={{marginTop:'.75rem'}}><button className="bp" onClick={()=>{ const code=Math.random().toString(36).slice(2,8).toUpperCase(); navigate('/?room='+code); }}>Create New Room</button></div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab==='orders' && (
          <div className="pc">
            <div className="st">Order History</div>
            <div className="ss">Products you purchased via DrawNBuy.</div>
            {ORDERS.map(o=>(
              <div key={o.id} className="order-card" style={{cursor:'pointer'}} onClick={()=>safeOpen(o.url)}>
                <img className="order-img" src={o.img} alt={o.name} onError={e=>{e.target.style.background='#f4f0ff';e.target.style.visibility='hidden';}}/>
                <div style={{flex:1}}>
                  <div className="order-name">{o.name}</div>
                  <div className="order-meta">{o.store} · {o.date} · <span style={{color:o.status==='Delivered'?'#065f46':o.status==='Shipped'?'#1d4ed8':'#92400e',fontWeight:700}}>{o.status}</span></div>
                </div>
                <div className="order-price">{o.price}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── BADGES ── */}
        {tab==='badges' && (
          <div className="pc">
            <div className="st">Achievements &amp; Badges</div>
            <div className="ss">Earn badges by shopping, drawing and collaborating.</div>
            <div className="badge-grid">
              {BADGES.map(b=>(
                <div key={b.name} className="badge-card" style={{opacity:b.earned?1:.4}}>
                  <img className="badge-img" src={b.img} alt={b.name} onError={e=>{e.target.style.display='none';}}/>
                  <div className="badge-name">{b.name}</div>
                  <div className="badge-desc">{b.desc}</div>
                  {b.earned&&<div style={{fontSize:'.65rem',color:'#065f46',fontWeight:700,marginTop:'.35rem'}}>&#10003; Earned</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        {tab==='stats' && (
          <div className="pc">
            <div className="st">My Shopping Stats</div>
            <div className="ss">Your most browsed and purchased categories.</div>
            <div style={{marginBottom:'1.5rem'}}>
              {SHOP_STATS.map(s=>(
                <div key={s.label} className="stat-bar">
                  <div className="stat-bar-label">{s.label}</div>
                  <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:s.pct+'%'}}/></div>
                  <div className="stat-bar-val">{s.pct}%</div>
                  <button className="bg2" style={{padding:'3px 8px',fontSize:'.68rem',marginLeft:'.5rem'}} onClick={()=>navigate('/')}>Browse</button>
                </div>
              ))}
            </div>
            <hr className="dv"/>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',textAlign:'center'}}>
              {[['38','Products Saved'],['12','Canvases'],['247','Friends'],['3','Purchases'],['1.2K','Profile Views'],['8','Badges']].map(([n,l])=>(
                <div key={l} style={{background:'#f4f0ff',borderRadius:'10px',padding:'.85rem'}}>
                  <div style={{fontSize:'1.2rem',fontWeight:800,color:'#7c3aed'}}>{n}</div>
                  <div style={{fontSize:'.72rem',color:'#6b7280'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REFERRAL ── */}
        {tab==='referral' && (
          <div className="pc">
            <div className="st">Referral Program</div>
            <div className="ss">Invite friends and earn rewards when they join DrawNBuy.</div>
            <div className="ref-box">
              <div style={{fontSize:'.85rem',fontWeight:700,color:'#7c3aed',marginBottom:'.5rem'}}>Your unique referral link</div>
              <div className="ref-link">drawnbuy.com/ref/{refCode}</div>
              <div><button className="bp" style={{marginTop:'.75rem'}} onClick={doCopy}>{copied?'Copied!':'Copy Link'}</button></div>
            </div>
            <hr className="dv"/>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',textAlign:'center',marginTop:'1rem'}}>
              {[['0','Friends Referred'],['0','Rewards Earned'],['10%','Commission']].map(([n,l])=>(
                <div key={l} style={{background:'#f4f0ff',borderRadius:'10px',padding:'.85rem'}}>
                  <div style={{fontSize:'1.2rem',fontWeight:800,color:'#7c3aed'}}>{n}</div>
                  <div style={{fontSize:'.72rem',color:'#6b7280'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab==='notifs' && (
          <div className="pc">
            <div className="st">Notifications</div>
            <div className="ss">Choose what emails and alerts you receive.</div>
            {[
              {key:'deals',   label:'Flash Deals',        sub:'New deals and limited offers'},
              {key:'collabs', label:'Canvas Invites',     sub:'When someone invites you to draw'},
              {key:'live',    label:'Friends Going Live', sub:'When friends start a live session'},
              {key:'news',    label:'Product Updates',    sub:'New features and improvements'},
              {key:'weekly',  label:'Weekly Digest',      sub:'Trending products each week'},
            ].map(({key,label,sub})=>(
              <div key={key} className="nr">
                <div><div className="nl">{label}</div><div className="ns">{sub}</div></div>
                <label className="tog">
                  <input type="checkbox" checked={notifs[key]} onChange={e=>setNotifs(n=>({...n,[key]:e.target.checked}))}/>
                  <span className="tsl"/>
                </label>
              </div>
            ))}
            <div style={{marginTop:'1.25rem'}}><button className="bp" onClick={()=>{ showToast('Preferences saved!'); }}>Save Preferences</button></div>
          </div>
        )}

        {/* ── SECURITY ── */}
        {tab==='security' && (
          <div className="pc">
            <div className="st">Security</div>
            <div className="ss">Manage your password and account security.</div>
            {!pwForm ? (
              <>
                {[
                  {title:'Password', sub:'Last changed: Never', action:<button className="bg2" onClick={()=>setPwForm(true)}>Change Password</button>},
                  {title:'Two-Factor Authentication', sub:'Add an extra layer of security', action:<span style={{fontSize:'.75rem',fontWeight:700,background:'#fef3c7',color:'#92400e',padding:'3px 10px',borderRadius:'20px'}}>Coming soon</span>},
                  {title:'Active Sessions', sub:'1 device — Stockholm, Sweden', action:<button className="bd" style={{padding:'5px 12px',fontSize:'.75rem'}} onClick={()=>showToast('All other sessions signed out!')}>Sign Out All</button>},
                ].map(({title,sub,action})=>(
                  <div key={title} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.85rem',background:'#f9fafb',borderRadius:'10px',border:'1px solid #f3f4f6',marginBottom:'.75rem'}}>
                    <div><div style={{fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>{title}</div><div style={{fontSize:'.78rem',color:'#9ca3af'}}>{sub}</div></div>
                    {action}
                  </div>
                ))}
              </>
            ) : (
              <div style={{background:'#f9fafb',borderRadius:'10px',padding:'1rem',marginBottom:'.75rem',border:'1px solid #f3f4f6'}}>
                <div style={{fontSize:'.9rem',fontWeight:700,color:'#1a0a3e',marginBottom:'.75rem'}}>Change Password</div>
                <div style={{marginBottom:'.6rem'}}><label className="fl">Current Password</label><input className="fi" type="password" value={pwOld} onChange={e=>setPwOld(e.target.value)} placeholder="Current password"/></div>
                <div style={{marginBottom:'.75rem'}}><label className="fl">New Password</label><input className="fi" type="password" value={pwNew} onChange={e=>setPwNew(e.target.value)} placeholder="New password (min 8 chars)"/></div>
                <div style={{display:'flex',gap:'.6rem'}}>
                  <button className="bp" onClick={doChangePw}>Update Password</button>
                  <button className="bg2" onClick={()=>{setPwForm(false);setPwOld('');setPwNew('');}}>Cancel</button>
                </div>
              </div>
            )}
            <hr className="dv"/>
            <button className="bd" style={{width:'100%',justifyContent:'center'}} onClick={()=>setDelConf(true)}>Delete Account</button>
          </div>
        )}

        {/* ── YOUR DATA ── */}
        {tab==='data' && (
          <div className="pc">
            <div className="st">Your Data</div>
            <div className="ss">DrawNBuy stores your data in Sweden and complies with GDPR (IMY).</div>
            <div style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
              <button className="bg2" onClick={doExportData}>Export My Data</button>
              <button className="bd" onClick={()=>setDelConf(true)}>Delete My Data</button>
            </div>
            <hr className="dv"/>
            <div style={{fontSize:'.8rem',color:'#6b7280',lineHeight:1.8}}>
              <strong>What we store:</strong> Your name, email, canvases, chat messages and product interactions.<br/>
              <strong>What we never do:</strong> Sell your data or share with third parties.<br/>
              <strong>Your rights:</strong> Under GDPR you can access, correct and delete your data at any time.<br/>
              <strong>Contact:</strong> <a href="mailto:privacy@drawnbuy.com" style={{color:'#7c3aed'}}>privacy@drawnbuy.com</a>
            </div>
          </div>
        )}

        {/* LOG OUT */}
        <div style={{display:'flex',gap:'.75rem',marginTop:'.25rem'}}>
          <button className="bg2" style={{flex:1,justifyContent:'center'}} onClick={()=>{logout();navigate('/');}}>Log Out</button>
        </div>
      </div>

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}



      {/* COVER PHOTO PICKER */}
      {coverPicker && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setCoverPicker(false)}>
          <div style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:'1.5rem',width:'100%',maxWidth:'480px'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:'#e5e7eb',borderRadius:4,margin:'0 auto .75rem'}}/>
            <div style={{fontSize:'1rem',fontWeight:800,color:'#1a0a3e',marginBottom:'1rem',textAlign:'center'}}>Edit Cover Photo</div>
            <div style={{display:'flex',flexDirection:'column',gap:'.6rem',marginBottom:'1rem'}}>
              <button onClick={()=>{setCoverPicker(false);setTimeout(()=>coverCamRef.current?.click(),100);}} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'1rem',borderRadius:12,border:'1.5px solid #ede9fe',background:'#f4f0ff',cursor:'pointer',fontFamily:'inherit',fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Take a Photo
                <span style={{marginLeft:'auto',fontSize:'.75rem',color:'#9ca3af'}}>Camera</span>
              </button>
              <button onClick={()=>{setCoverPicker(false);setTimeout(()=>coverFileRef.current?.click(),100);}} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'1rem',borderRadius:12,border:'1.5px solid #ede9fe',background:'#f4f0ff',cursor:'pointer',fontFamily:'inherit',fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Choose from Gallery
                <span style={{marginLeft:'auto',fontSize:'.75rem',color:'#9ca3af'}}>Photos</span>
              </button>
              <button onClick={()=>setCoverPicker(false)} style={{padding:'.85rem',borderRadius:12,border:'1.5px solid #f3f4f6',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:'.88rem',fontWeight:600,color:'#6b7280'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AVATAR PHOTO PICKER */}
      {avatarPicker && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setAvatarPicker(false)}>
          <div style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:'1.5rem',width:'100%',maxWidth:'480px'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:'#e5e7eb',borderRadius:4,margin:'0 auto .75rem'}}/>
            <div style={{fontSize:'1rem',fontWeight:800,color:'#1a0a3e',marginBottom:'1rem',textAlign:'center'}}>Edit Profile Photo</div>
            <div style={{display:'flex',flexDirection:'column',gap:'.6rem',marginBottom:'1rem'}}>
              <button onClick={()=>{setAvatarPicker(false);setTimeout(()=>avatarCamRef.current?.click(),100);}} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'1rem',borderRadius:12,border:'1.5px solid #ede9fe',background:'#f4f0ff',cursor:'pointer',fontFamily:'inherit',fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Take a Selfie
                <span style={{marginLeft:'auto',fontSize:'.75rem',color:'#9ca3af'}}>Front camera</span>
              </button>
              <button onClick={()=>{setAvatarPicker(false);setTimeout(()=>fileRef.current?.click(),100);}} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'1rem',borderRadius:12,border:'1.5px solid #ede9fe',background:'#f4f0ff',cursor:'pointer',fontFamily:'inherit',fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Choose from Gallery
                <span style={{marginLeft:'auto',fontSize:'.75rem',color:'#9ca3af'}}>Photos</span>
              </button>
              <button onClick={()=>setAvatarPicker(false)} style={{padding:'.85rem',borderRadius:12,border:'1.5px solid #f3f4f6',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:'.88rem',fontWeight:600,color:'#6b7280'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {delConf && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'2rem',maxWidth:'400px',width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{fontSize:'1.1rem',fontWeight:800,color:'#1a0a3e',marginBottom:'.5rem'}}>Delete Account?</div>
            <div style={{fontSize:'.88rem',color:'#6b7280',marginBottom:'1.5rem'}}>This will permanently delete your account and all data. Cannot be undone.</div>
            <div style={{display:'flex',gap:'.75rem'}}>
              <button className="bg2" style={{flex:1,justifyContent:'center'}} onClick={()=>setDelConf(false)}>Cancel</button>
              <button className="bd"  style={{flex:1,justifyContent:'center'}} onClick={()=>{logout();navigate('/');}}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
