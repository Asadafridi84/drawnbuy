import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const CSS = `.pw{max-width:960px;margin:0 auto;padding-bottom:2rem}.cover{position:relative;height:240px;background:linear-gradient(135deg,#7c3aed 0%,#4c1d95 50%,#1e1b4b 100%);border-radius:16px 16px 0 0;overflow:hidden}.cover-edit{position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,.55);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px}.profile-card{background:#fff;border-radius:0 0 16px 16px;padding:0 2rem 1.5rem;box-shadow:0 4px 24px rgba(124,58,237,.1);margin-bottom:1.25rem}.avatar-wrap{position:relative;display:inline-block;margin-top:-52px;margin-bottom:.6rem}.av{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:2.2rem;font-weight:800;display:flex;align-items:center;justify-content:center;border:4px solid #fff;box-shadow:0 2px 16px rgba(124,58,237,.35)}.av-cam{position:absolute;bottom:4px;right:4px;width:30px;height:30px;border-radius:50%;background:#7c3aed;color:#fff;border:2px solid #fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800}.live-ring{position:absolute;inset:-4px;border-radius:50%;border:3px solid #ef4444;animation:lp 1.5s infinite}@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.06)}}.profile-top{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-top:.5rem}.profile-info{flex:1;min-width:200px}.profile-name{font-size:1.45rem;font-weight:800;color:#1a0a3e;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.verified{color:#7c3aed;font-size:1.1rem}.live-badge{background:#ef4444;color:#fff;font-size:.62rem;font-weight:800;padding:2px 9px;border-radius:20px;letter-spacing:.06em;animation:lp 1.5s infinite}.handle{font-size:.82rem;color:#6b7280;margin:.2rem 0 .75rem}.pstats{display:flex;gap:1.5rem;flex-wrap:wrap;margin-bottom:.85rem}.pstat{text-align:center;cursor:pointer}.pstat:hover .pstat-num{color:#7c3aed}.pstat-num{font-size:1.15rem;font-weight:800;color:#1a0a3e;transition:.15s}.pstat-lbl{font-size:.7rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em}.pactions{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center}.btn-pri{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:10px;padding:.55rem 1.1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s}.btn-pri:hover{opacity:.9}.btn-sec{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s}.btn-sec:hover{background:#ede9fe}.btn-live{background:linear-gradient(90deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:10px;padding:.55rem 1.1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem}.btn-end{background:#f4f0ff;color:#ef4444;border:1.5px solid #fca5a5;border-radius:10px;padding:.55rem 1.1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem}.tab-wrap{position:relative;margin-bottom:1.25rem}.tab-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:32px;height:32px;border-radius:50%;background:#fff;border:1.5px solid #ede9fe;color:#7c3aed;font-size:.85rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(124,58,237,.15);transition:.15s}.tab-arrow:hover{background:#f4f0ff}.tab-arrow-l{left:0}.tab-arrow-r{right:0}.ptabs{display:flex;gap:0;background:#fff;border-radius:12px;padding:.4rem;box-shadow:0 2px 12px rgba(124,58,237,.08);overflow-x:auto;scroll-behavior:smooth;scrollbar-width:none;margin:0 40px}.ptabs::-webkit-scrollbar{display:none}.ptab{display:flex;align-items:center;gap:.35rem;padding:.55rem .85rem;border-radius:8px;border:none;background:transparent;color:#6b7280;font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:.15s;flex-shrink:0}.ptab:hover{background:#f4f0ff;color:#7c3aed}.ptab.on{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff}.pc{background:#fff;border-radius:16px;padding:1.5rem;box-shadow:0 2px 12px rgba(124,58,237,.08);margin-bottom:1rem}.st{font-size:1rem;font-weight:800;color:#1a0a3e;margin-bottom:.25rem}.ss{font-size:.8rem;color:#6b7280;margin-bottom:1.25rem}.fl{font-size:.8rem;font-weight:700;color:#374151;margin-bottom:.4rem;display:block}.fi{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:.65rem .9rem;font-family:inherit;font-size:.88rem;color:#1a0a3e;outline:none;transition:.15s;box-sizing:border-box}.fi:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12)}.fi:disabled{background:#f9fafb;color:#9ca3af}.bp{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:10px;padding:.65rem 1.4rem;font-family:inherit;font-size:.88rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s}.bd{background:#fee2e2;color:#b91c1c;border:1.5px solid #fca5a5;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem}.bg2{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:.4rem}.dv{border:none;border-top:1px solid #f3f4f6;margin:1.25rem 0}.ok{background:#d1fae5;color:#065f46;border-radius:8px;padding:.5rem .9rem;font-size:.82rem;font-weight:700;display:inline-flex;align-items:center;gap:.4rem}.fc{display:flex;align-items:center;gap:.9rem;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;background:#fafafa;margin-bottom:.6rem;transition:.15s}.fc:hover{border-color:#ede9fe;background:#f4f0ff}.fa{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:.88rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}.fn{font-size:.9rem;font-weight:700;color:#1a0a3e}.fe{font-size:.75rem;color:#9ca3af}.ftag{font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:20px}.tfam{background:#dbeafe;color:#1d4ed8}.tfri{background:#d1fae5;color:#065f46}.tinv{background:#fef3c7;color:#92400e}.sd{width:8px;height:8px;border-radius:50%;flex-shrink:0}.son{background:#22c55e}.sof{background:#d1d5db}.sin{background:#fbbf24}.nr{display:flex;align-items:center;justify-content:space-between;padding:.85rem 0;border-bottom:1px solid #f3f4f6}.nl{font-size:.88rem;font-weight:600;color:#1a0a3e}.ns{font-size:.75rem;color:#9ca3af}.tog{position:relative;width:44px;height:24px;cursor:pointer;display:inline-block}.tog input{opacity:0;width:0;height:0}.tsl{position:absolute;inset:0;border-radius:24px;background:#e5e7eb;transition:.2s}.tog input:checked + .tsl{background:#7c3aed}.tsl::before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}.tog input:checked + .tsl::before{transform:translateX(20px)}.feed-item{display:flex;gap:.75rem;padding:.85rem 0;border-bottom:1px solid #f3f4f6}.feed-av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:800;flex-shrink:0;color:#fff;background:linear-gradient(135deg,#7c3aed,#5b21b6)}.feed-text{font-size:.85rem;color:#374151;line-height:1.5}.feed-time{font-size:.72rem;color:#9ca3af;margin-top:.2rem}.wb-canvas{width:100%;height:340px;background:#fff;border-radius:12px;border:1.5px solid #ede9fe;cursor:crosshair;display:block}.wb-tools{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;margin-bottom:.75rem}.wb-color{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:.15s}.wb-color.active,.wb-color:hover{border-color:#7c3aed;transform:scale(1.15)}.wb-btn{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:8px;padding:5px 12px;font-size:.78rem;font-weight:700;cursor:pointer}.msg-list{height:300px;overflow-y:auto;padding:.5rem 0;margin-bottom:.75rem;border-bottom:1px solid #f3f4f6}.msg-row{display:flex;gap:.6rem;margin-bottom:.75rem;align-items:flex-end}.msg-row.me{flex-direction:row-reverse}.msg-bubble{max-width:70%;padding:.6rem .9rem;border-radius:14px;font-size:.85rem;line-height:1.5}.msg-row:not(.me) .msg-bubble{background:#f4f0ff;color:#1a0a3e;border-bottom-left-radius:4px}.msg-row.me .msg-bubble{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border-bottom-right-radius:4px}.msg-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:.72rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}.msg-input-row{display:flex;gap:.6rem}.live-card{background:linear-gradient(135deg,#1e1b4b,#4c1d95);border-radius:14px;padding:1.5rem;color:#fff;text-align:center;margin-bottom:1rem}.live-viewers{font-size:2rem;font-weight:800;color:#fbbf24}.past-session{display:flex;align-items:center;justify-content:space-between;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;margin-bottom:.6rem}.ps-name{font-size:.88rem;font-weight:700;color:#1a0a3e}.ps-meta{font-size:.75rem;color:#9ca3af}.badge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.75rem}.badge-card{background:#f4f0ff;border-radius:12px;padding:.85rem;text-align:center;border:1.5px solid #ede9fe;transition:.15s}.badge-card:hover{border-color:#7c3aed}.badge-icon{font-size:1.6rem;margin-bottom:.35rem}.badge-name{font-size:.72rem;font-weight:700;color:#7c3aed}.badge-desc{font-size:.65rem;color:#9ca3af;margin-top:.15rem}.stat-bar{display:flex;align-items:center;gap:.75rem;margin-bottom:.65rem}.stat-bar-label{font-size:.78rem;color:#374151;width:80px;flex-shrink:0}.stat-bar-track{flex:1;height:8px;background:#f3f4f6;border-radius:20px;overflow:hidden}.stat-bar-fill{height:100%;border-radius:20px;background:linear-gradient(90deg,#7c3aed,#5b21b6)}.stat-bar-val{font-size:.75rem;font-weight:700;color:#7c3aed;width:30px;text-align:right;flex-shrink:0}.ref-box{background:linear-gradient(135deg,#f4f0ff,#ede9fe);border-radius:12px;padding:1.25rem;border:1.5px solid #ddd6fe;text-align:center}.ref-link{font-size:.82rem;font-family:monospace;background:#fff;border:1.5px solid #ede9fe;border-radius:8px;padding:.5rem .9rem;color:#7c3aed;font-weight:700;display:inline-block;margin:.5rem 0}.room-card{display:flex;align-items:center;justify-content:space-between;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;background:#fafafa;margin-bottom:.6rem}.room-name{font-size:.9rem;font-weight:700;color:#1a0a3e}.room-meta{font-size:.75rem;color:#9ca3af}.rb{font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:20px}.rb-live{background:#fee2e2;color:#b91c1c}.rb-member{background:#d1fae5;color:#065f46}.rb-guest{background:#fef3c7;color:#92400e}.order-card{display:flex;align-items:center;gap:.9rem;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;margin-bottom:.6rem}.order-img{width:52px;height:52px;border-radius:8px;background:#f4f0ff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}.order-name{font-size:.88rem;font-weight:700;color:#1a0a3e}.order-meta{font-size:.75rem;color:#9ca3af}.order-price{font-size:.95rem;font-weight:800;color:#7c3aed;white-space:nowrap}@media(max-width:768px){.pstats{gap:1rem}.pactions{gap:.4rem}.ptabs{margin:0 36px}}`;

const TABS = [
  { id:'feed',      label:'Activity',    icon:'📊' },
  { id:'whiteboard',label:'Whiteboard',  icon:'🎨' },
  { id:'profile',   label:'Profile',     icon:'✏️' },
  { id:'friends',   label:'Friends',     icon:'👥' },
  { id:'messages',  label:'Messages',    icon:'💬' },
  { id:'wishlist',  label:'Wishlist',    icon:'❤️' },
  { id:'live',      label:'Live',        icon:'🔴' },
  { id:'rooms',     label:'Rooms',       icon:'🚪' },
  { id:'orders',    label:'Orders',      icon:'🛒' },
  { id:'badges',    label:'Badges',      icon:'🏆' },
  { id:'stats',     label:'My Stats',    icon:'📈' },
  { id:'referral',  label:'Referral',    icon:'🎁' },
  { id:'notifs',    label:'Notifications',icon:'🔔' },
  { id:'security',  label:'Security',    icon:'🔒' },
  { id:'data',      label:'Your Data',   icon:'🗄️' },
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
  { id:4, av:'SB', name:'Sofia Berg',      text:'Went live! She\'s drawing her wishlist right now with 24 viewers.',          time:'2 hr ago'   },
  { id:5, av:'TU', name:'You',             text:'Created canvas room "My Wishlist" and added 4 products.',                    time:'3 hr ago'   },
];

const INIT_MSGS = [
  { id:1, from:'AL', name:'Anna',     text:'Hey! Did you see the new Nike drops? 👟',          me:false },
  { id:2, from:'me', name:'You',      text:'Yes! I added some to my canvas already 🎨',         me:true  },
  { id:3, from:'AL', name:'Anna',     text:'Let\'s do a collab canvas this weekend?',            me:false },
];

const BADGES = [
  { icon:'🎨', name:'First Canvas',   desc:'Created your first canvas',   earned:true  },
  { icon:'👥', name:'Social Shopper', desc:'Invited 3 friends',            earned:true  },
  { icon:'❤️', name:'Wishlist Pro',   desc:'Saved 10+ products',           earned:true  },
  { icon:'🔴', name:'Gone Live',      desc:'Hosted a live session',        earned:false },
  { icon:'🛒', name:'First Purchase', desc:'Bought via DrawNBuy',          earned:false },
  { icon:'⭐', name:'Power Shopper',  desc:'50+ products added',           earned:false },
  { icon:'🤝', name:'Collab King',    desc:'10 collaborative canvases',    earned:false },
  { icon:'🌍', name:'Global Shopper', desc:'Shopped from 5+ countries',    earned:false },
];

const ROOMS = [
  { id:1, name:'Spring Fashion Haul', members:3, type:'live',   privacy:'public',  last:'Now'        },
  { id:2, name:'My Wishlist',         members:1, type:'member', privacy:'private', last:'2 hrs ago'  },
  { id:3, name:'Family Shopping',     members:4, type:'member', privacy:'friends', last:'Yesterday'  },
  { id:4, name:'Guest Room #2841',    members:0, type:'guest',  privacy:'public',  last:'3 days ago' },
];

const ORDERS = [
  { id:1, icon:'👟', name:'Nike Air Max 2024',      store:'Nike',  price:'£129', status:'Delivered',  date:'Apr 18' },
  { id:2, icon:'🛋️', name:'IKEA SÖDERHAMN Sofa',   store:'IKEA',  price:'£549', status:'Shipped',    date:'Apr 19' },
  { id:3, icon:'💄', name:'Charlotte Tilbury Kit',  store:'Boots', price:'£78',  status:'Processing', date:'Apr 20' },
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

export default function ProfilePage() {
  const navigate   = useNavigate();
  const user       = useAuthStore(s => s.user);
  const logout     = useAuthStore(s => s.logout);
  const updateUser = useAuthStore(s => s.updateUser);

  const [tab,      setTab]      = useState('feed');
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

  const tabsRef  = useRef(null);
  const canvasRef= useRef(null);
  const lastPos  = useRef(null);

  const initials = (user?.name||'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const since    = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB',{month:'long',year:'numeric'}) : 'April 2026';

  const doSave   = () => { updateUser?.({name,bio}); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const doInvite = () => {
    if (!iEmail) return;
    setFriends(p=>[...p,{id:Date.now(),name:iEmail.split('@')[0],email:iEmail,av:iEmail[0].toUpperCase(),rel:iRel,status:'invited',cv:0}]);
    setIEmail(''); setISent(true); setTimeout(()=>setISent(false),2000);
  };
  const doCopy   = () => {
    navigator.clipboard?.writeText('https://drawnbuy.com/ref/'+initials.toLowerCase()+'2026');
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };
  const doSendMsg = () => {
    if (!msgText.trim()) return;
    setMsgs(p=>[...p,{id:Date.now(),from:'me',name:'You',text:msgText,me:true}]);
    setMsgText('');
  };

  // Tab scroll arrows
  const scrollTabs = (dir) => {
    if (tabsRef.current) tabsRef.current.scrollBy({left: dir*150, behavior:'smooth'});
  };

  // Whiteboard canvas drawing
  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {x: src.clientX - r.left, y: src.clientY - r.top};
  };
  const wbStart = (e) => {
    e.preventDefault();
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    const pos = getPos(e, c);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
    setDrawing(true);
  };
  const wbMove = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    const pos = getPos(e, c);
    ctx.strokeStyle = wbColor;
    ctx.lineWidth   = wbSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
  };
  const wbEnd = () => setDrawing(false);
  const wbClear = () => {
    const c = canvasRef.current; if (!c) return;
    c.getContext('2d').clearRect(0,0,c.width,c.height);
  };
  const wbSave = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement('a');
    a.download = 'drawnbuy-canvas.png';
    a.href = c.toDataURL();
    a.click();
  };

  return (
    <div style={{minHeight:'100vh',background:'#f4f0ff',padding:'1.5rem 1rem'}}>
      <style>{CSS}</style>
      <div className="pw">

        {/* COVER */}
        <div className="cover">
          <button className="cover-edit">📷 Edit Cover</button>
        </div>

        {/* PROFILE CARD */}
        <div className="profile-card">
          <div className="profile-top">
            <div style={{display:'flex',alignItems:'flex-end',gap:'1.25rem',flexWrap:'wrap'}}>
              <div className="avatar-wrap">
                <div className="av">{initials}</div>
                {isLive && <div className="live-ring"/>}
                <div className="av-cam">📷</div>
              </div>
              <div className="profile-info">
                <div className="profile-name">
                  {user?.name||'Test User'}
                  <span className="verified">✓</span>
                  {isLive && <span className="live-badge">🔴 LIVE</span>}
                </div>
                <div className="handle">@{(user?.name||'testuser').toLowerCase().replace(' ','.')} · Stockholm, Sweden 🇸🇪</div>
                <div className="pstats">
                  {[['247','Friends'],['38','Wishlist'],['12','Sessions'],['1.2K','Viewers'],['8','Badges']].map(([n,l])=>(
                    <div key={l} className="pstat">
                      <div className="pstat-num">{n}</div>
                      <div className="pstat-lbl">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pactions">
              <button className="btn-sec" onClick={()=>setTab('profile')}>✏️ Edit Profile</button>
              <button className="btn-sec">🔗 Share</button>
              <button className={isLive?'btn-end':'btn-live'} onClick={()=>setIsLive(v=>!v)}>
                {isLive?'⏹ End Live':'🔴 Go Live'}
              </button>
              <button className="btn-sec" onClick={()=>setTab('messages')}>💬 Messages</button>
            </div>
          </div>
        </div>

        {/* TAB BAR WITH SCROLL ARROWS */}
        <div className="tab-wrap">
          <button className="tab-arrow tab-arrow-l" onClick={()=>scrollTabs(-1)}>‹</button>
          <div className="ptabs" ref={tabsRef}>
            {TABS.map(({id,label,icon})=>(
              <button key={id} className={'ptab'+(tab===id?' on':'')} onClick={()=>setTab(id)}>
                {icon} {label}
              </button>
            ))}
          </div>
          <button className="tab-arrow tab-arrow-r" onClick={()=>scrollTabs(1)}>›</button>
        </div>

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

        {/* ── WHITEBOARD ── */}
        {tab==='whiteboard' && (
          <div className="pc">
            <div className="st">Your Whiteboard</div>
            <div className="ss">Draw your wishlist, plan your shopping, share with friends.</div>
            <div className="wb-tools">
              {WB_COLORS.map(c=>(
                <div key={c} className={'wb-color'+(wbColor===c?' active':'')} style={{background:c}} onClick={()=>setWbColor(c)}/>
              ))}
              <input type="range" min={1} max={20} value={wbSize} onChange={e=>setWbSize(+e.target.value)} style={{width:'80px',accentColor:'#7c3aed'}}/>
              <span style={{fontSize:'.75rem',color:'#6b7280'}}>Size {wbSize}</span>
              <button className="wb-btn" onClick={wbClear}>🗑 Clear</button>
              <button className="wb-btn" onClick={wbSave}>💾 Save PNG</button>
              <button className="wb-btn" onClick={()=>navigate('/canvas')}>🚀 Open Full Canvas</button>
            </div>
            <canvas
              ref={canvasRef}
              className="wb-canvas"
              width={900}
              height={340}
              onMouseDown={wbStart}
              onMouseMove={wbMove}
              onMouseUp={wbEnd}
              onMouseLeave={wbEnd}
              onTouchStart={wbStart}
              onTouchMove={wbMove}
              onTouchEnd={wbEnd}
            />
          </div>
        )}

        {/* ── PROFILE EDIT ── */}
        {tab==='profile' && (
          <div className="pc">
            <div className="st">Profile Information</div>
            <div className="ss">Update your display name, bio, handle and shopping preferences.</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
              <div><label className="fl">Display Name</label><input className="fi" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
              <div><label className="fl">Handle</label><input className="fi" placeholder="@yourhandle" defaultValue={'@'+(user?.name||'user').toLowerCase().replace(' ','.')}/></div>
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
            {saved?<div className="ok">✓ Saved!</div>:<button className="bp" onClick={doSave}>💾 Save Changes</button>}
          </div>
        )}

        {/* ── FRIENDS ── */}
        {tab==='friends' && (
          <div className="pc">
            <div className="st">Friends &amp; Family</div>
            <div className="ss">Shop and draw together. Invite new connections by email.</div>
            <div style={{background:'#f4f0ff',borderRadius:'12px',padding:'1rem',marginBottom:'1.25rem',border:'1.5px solid #ede9fe'}}>
              <div style={{fontSize:'.82rem',fontWeight:'700',color:'#7c3aed',marginBottom:'.75rem'}}>➕ Invite someone</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:'.6rem',alignItems:'end'}}>
                <div><label className="fl">Email</label><input className="fi" value={iEmail} onChange={e=>setIEmail(e.target.value)} placeholder="friend@example.com" type="email"/></div>
                <div><label className="fl">Relation</label>
                  <select className="fi" value={iRel} onChange={e=>setIRel(e.target.value)} style={{width:'120px'}}>
                    <option>Friend</option><option>Family</option><option>Partner</option><option>Colleague</option>
                  </select>
                </div>
                <button className="bp" onClick={doInvite} style={{marginBottom:'1px'}}>Invite</button>
              </div>
              {iSent&&<div className="ok" style={{marginTop:'.6rem'}}>✓ Invitation sent!</div>}
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
                  {f.status!=='invited'&&<button className="bg2" style={{padding:'4px 10px',fontSize:'.72rem'}} onClick={()=>navigate('/canvas')}>Draw Together</button>}
                  <button onClick={()=>setFriends(p=>p.filter(x=>x.id!==f.id))} style={{background:'none',border:'none',cursor:'pointer',color:'#d1d5db',padding:'4px'}}>✕</button>
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
                <div key={f.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'.25rem',cursor:'pointer',flex:'0 0 auto'}}>
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
              <button className="bp" onClick={doSendMsg}>Send ➤</button>
            </div>
          </div>
        )}

        {/* ── WISHLIST ── */}
        {tab==='wishlist' && (
          <div className="pc">
            <div className="st">Your Wishlist</div>
            <div className="ss">Products you have saved across DrawNBuy.</div>
            <div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>❤️</div>
              <div style={{fontSize:'.88rem',marginBottom:'1rem'}}>No saved products yet.</div>
              <button className="bp" onClick={()=>navigate('/')}>Browse Products</button>
            </div>
          </div>
        )}

        {/* ── LIVE ── */}
        {tab==='live' && (
          <div>
            <div className="live-card">
              {isLive ? (
                <>
                  <div style={{fontSize:'.82rem',fontWeight:700,color:'#fbbf24',marginBottom:'.5rem'}}>🔴 YOU ARE LIVE</div>
                  <div className="live-viewers">24</div>
                  <div style={{fontSize:'.82rem',color:'rgba(255,255,255,.7)',marginBottom:'1rem'}}>viewers watching</div>
                  <button className="btn-end" onClick={()=>setIsLive(false)}>⏹ End Live Session</button>
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
                  <button className="btn-live" onClick={()=>setIsLive(true)}>🔴 Start Live Session</button>
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
                  <button className="bg2" style={{fontSize:'.75rem',padding:'5px 12px'}}>▶ Replay</button>
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
                      {r.type==='live'?'🔴 Live':r.type==='guest'?'Guest':'Member'}
                    </span>
                  </div>
                  <div className="room-meta">{r.members} {r.members===1?'member':'members'} · {r.privacy} · {r.last}</div>
                </div>
                <button className="btn-pri" style={{fontSize:'.75rem',padding:'6px 12px'}} onClick={()=>navigate('/canvas')}>Open</button>
              </div>
            ))}
            <div style={{marginTop:'.75rem'}}><button className="bp" onClick={()=>navigate('/canvas')}>➕ Create New Room</button></div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab==='orders' && (
          <div className="pc">
            <div className="st">Order History</div>
            <div className="ss">Products you purchased via DrawNBuy.</div>
            {ORDERS.map(o=>(
              <div key={o.id} className="order-card">
                <div className="order-img">{o.icon}</div>
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
                  <div className="badge-icon">{b.icon}</div>
                  <div className="badge-name">{b.name}</div>
                  <div className="badge-desc">{b.desc}</div>
                  {b.earned&&<div style={{fontSize:'.65rem',color:'#065f46',fontWeight:700,marginTop:'.35rem'}}>✓ Earned</div>}
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
              <div className="ref-link">drawnbuy.com/ref/{initials.toLowerCase()}2026</div>
              <div><button className="bp" style={{marginTop:'.75rem'}} onClick={doCopy}>{copied?'✓ Copied!':'📋 Copy Link'}</button></div>
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
            <div style={{marginTop:'1.25rem'}}><button className="bp" onClick={doSave}>💾 Save Preferences</button></div>
          </div>
        )}

        {/* ── SECURITY ── */}
        {tab==='security' && (
          <div className="pc">
            <div className="st">Security</div>
            <div className="ss">Manage your password and account security.</div>
            {[
              {title:'Password',                  sub:'Last changed: Never',                  action:<button className="bg2">Change Password</button>},
              {title:'Two-Factor Authentication', sub:'Add an extra layer of security',       action:<span style={{fontSize:'.75rem',fontWeight:700,background:'#fef3c7',color:'#92400e',padding:'3px 10px',borderRadius:'20px'}}>Coming soon</span>},
              {title:'Active Sessions',           sub:'1 device — Stockholm, Sweden',         action:<button className="bd" style={{padding:'5px 12px',fontSize:'.75rem'}}>Sign Out All</button>},
            ].map(({title,sub,action})=>(
              <div key={title} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.85rem',background:'#f9fafb',borderRadius:'10px',border:'1px solid #f3f4f6',marginBottom:'.75rem'}}>
                <div><div style={{fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>{title}</div><div style={{fontSize:'.78rem',color:'#9ca3af'}}>{sub}</div></div>
                {action}
              </div>
            ))}
            <hr className="dv"/>
            <button className="bd" style={{width:'100%',justifyContent:'center'}} onClick={()=>setDelConf(true)}>🗑️ Delete Account</button>
          </div>
        )}

        {/* ── YOUR DATA ── */}
        {tab==='data' && (
          <div className="pc">
            <div className="st">Your Data</div>
            <div className="ss">DrawNBuy stores your data in Sweden and complies with GDPR (IMY).</div>
            <div style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
              <button className="bg2">📦 Export My Data</button>
              <button className="bd">🗑️ Delete My Data</button>
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
          <button className="bg2" style={{flex:1,justifyContent:'center'}} onClick={()=>{logout();navigate('/');}}>↩ Log Out</button>
        </div>

      </div>

      {/* DELETE MODAL */}
      {delConf&&(
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
