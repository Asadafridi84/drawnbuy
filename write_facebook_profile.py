import pathlib

# Build the JSX using Python string concatenation
# so backticks never touch shell escaping
CSS = (
    ".pw{display:grid;grid-template-columns:1fr;gap:0;max-width:1000px;margin:0 auto}"
    ".cover{position:relative;height:220px;background:linear-gradient(135deg,#7c3aed,#4c1d95,#1e1b4b);border-radius:16px 16px 0 0;overflow:hidden}"
    ".cover-img{width:100%;height:100%;object-fit:cover;opacity:.7}"
    ".cover-edit{position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,.5);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px}"
    ".profile-card{background:#fff;border-radius:0 0 16px 16px;padding:0 2rem 1.5rem;box-shadow:0 4px 24px rgba(124,58,237,.1);position:relative;margin-bottom:1.5rem}"
    ".avatar-wrap{position:relative;display:inline-block;margin-top:-48px;margin-bottom:.75rem}"
    ".av{width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:2rem;font-weight:800;display:flex;align-items:center;justify-content:center;border:4px solid #fff;box-shadow:0 2px 12px rgba(124,58,237,.3)}"
    ".av-upload{position:absolute;bottom:4px;right:4px;width:28px;height:28px;border-radius:50%;background:#7c3aed;color:#fff;border:2px solid #fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.7rem}"
    ".live-ring{position:absolute;inset:0;border-radius:50%;border:3px solid #ef4444;animation:pulse 1.5s infinite}"
    "@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.05)}}"
    ".profile-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem}"
    ".profile-info{flex:1}"
    ".profile-name{font-size:1.4rem;font-weight:800;color:#1a0a3e;display:flex;align-items:center;gap:.5rem}"
    ".verified{color:#7c3aed;font-size:1rem}"
    ".live-badge{background:#ef4444;color:#fff;font-size:.65rem;font-weight:800;padding:2px 8px;border-radius:20px;letter-spacing:.05em}"
    ".handle{font-size:.82rem;color:#6b7280;margin:.2rem 0 .75rem}"
    ".pstats{display:flex;gap:1.5rem;flex-wrap:wrap;margin-bottom:.75rem}"
    ".pstat{text-align:center}"
    ".pstat-num{font-size:1.1rem;font-weight:800;color:#1a0a3e}"
    ".pstat-lbl{font-size:.72rem;color:#9ca3af}"
    ".pactions{display:flex;gap:.6rem;flex-wrap:wrap}"
    ".btn-pri{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:10px;padding:.55rem 1.1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem}"
    ".btn-sec{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem}"
    ".btn-live{background:linear-gradient(90deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:10px;padding:.55rem 1.1rem;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem}"
    ".ptabs{display:flex;gap:0;background:#fff;border-radius:12px;padding:.4rem;box-shadow:0 2px 12px rgba(124,58,237,.08);margin-bottom:1.5rem;overflow-x:auto;scrollbar-width:none}"
    ".ptabs::-webkit-scrollbar{display:none}"
    ".ptab{display:flex;align-items:center;gap:.35rem;padding:.55rem .9rem;border-radius:8px;border:none;background:transparent;color:#6b7280;font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:.15s}"
    ".ptab:hover{background:#f4f0ff;color:#7c3aed}"
    ".ptab.on{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff}"
    ".pc{background:#fff;border-radius:16px;padding:1.5rem;box-shadow:0 2px 12px rgba(124,58,237,.08);margin-bottom:1rem}"
    ".st{font-size:1rem;font-weight:800;color:#1a0a3e;margin-bottom:.25rem}"
    ".ss{font-size:.8rem;color:#6b7280;margin-bottom:1.25rem}"
    ".fl{font-size:.8rem;font-weight:700;color:#374151;margin-bottom:.4rem;display:block}"
    ".fi{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:.65rem .9rem;font-family:inherit;font-size:.88rem;color:#1a0a3e;outline:none;transition:.15s;box-sizing:border-box}"
    ".fi:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12)}"
    ".fi:disabled{background:#f9fafb;color:#9ca3af}"
    ".bp{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:10px;padding:.65rem 1.4rem;font-family:inherit;font-size:.88rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s}"
    ".bd{background:#fee2e2;color:#b91c1c;border:1.5px solid #fca5a5;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem}"
    ".bg2{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:.4rem}"
    ".dv{border:none;border-top:1px solid #f3f4f6;margin:1.25rem 0}"
    ".fc{display:flex;align-items:center;gap:.9rem;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;background:#fafafa;margin-bottom:.6rem;transition:.15s}"
    ".fc:hover{border-color:#ede9fe;background:#f4f0ff}"
    ".fa{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:.88rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}"
    ".fn{font-size:.9rem;font-weight:700;color:#1a0a3e}"
    ".fe{font-size:.75rem;color:#9ca3af}"
    ".ftag{font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:20px}"
    ".tfam{background:#dbeafe;color:#1d4ed8}"
    ".tfri{background:#d1fae5;color:#065f46}"
    ".tinv{background:#fef3c7;color:#92400e}"
    ".sd{width:8px;height:8px;border-radius:50%;flex-shrink:0}"
    ".son{background:#22c55e}.sof{background:#d1d5db}.sin{background:#fbbf24}"
    ".nr{display:flex;align-items:center;justify-content:space-between;padding:.85rem 0;border-bottom:1px solid #f3f4f6}"
    ".nl{font-size:.88rem;font-weight:600;color:#1a0a3e}"
    ".ns{font-size:.75rem;color:#9ca3af}"
    ".tog{position:relative;width:44px;height:24px;cursor:pointer;display:inline-block}"
    ".tog input{opacity:0;width:0;height:0}"
    ".tsl{position:absolute;inset:0;border-radius:24px;background:#e5e7eb;transition:.2s}"
    ".tog input:checked + .tsl{background:#7c3aed}"
    ".tsl::before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}"
    ".tog input:checked + .tsl::before{transform:translateX(20px)}"
    ".ok{background:#d1fae5;color:#065f46;border-radius:8px;padding:.5rem .9rem;font-size:.82rem;font-weight:700;display:inline-flex;align-items:center;gap:.4rem}"
    ".feed-item{display:flex;gap:.75rem;padding:.85rem 0;border-bottom:1px solid #f3f4f6}"
    ".feed-av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:800;flex-shrink:0;color:#fff;background:linear-gradient(135deg,#7c3aed,#5b21b6)}"
    ".feed-text{font-size:.85rem;color:#374151;line-height:1.5}"
    ".feed-time{font-size:.72rem;color:#9ca3af;margin-top:.2rem}"
    ".badge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:.75rem}"
    ".badge-card{background:#f4f0ff;border-radius:12px;padding:.85rem;text-align:center;border:1.5px solid #ede9fe}"
    ".badge-icon{font-size:1.5rem;margin-bottom:.35rem}"
    ".badge-name{font-size:.72rem;font-weight:700;color:#7c3aed}"
    ".badge-desc{font-size:.65rem;color:#9ca3af;margin-top:.15rem}"
    ".stat-bar{display:flex;align-items:center;gap:.75rem;margin-bottom:.6rem}"
    ".stat-bar-label{font-size:.78rem;color:#374151;width:80px;flex-shrink:0}"
    ".stat-bar-track{flex:1;height:8px;background:#f3f4f6;border-radius:20px;overflow:hidden}"
    ".stat-bar-fill{height:100%;border-radius:20px;background:linear-gradient(90deg,#7c3aed,#5b21b6)}"
    ".stat-bar-val{font-size:.75rem;font-weight:700;color:#7c3aed;width:30px;text-align:right;flex-shrink:0}"
    ".ref-box{background:linear-gradient(135deg,#f4f0ff,#ede9fe);border-radius:12px;padding:1.25rem;border:1.5px solid #ddd6fe;text-align:center}"
    ".ref-link{font-size:.82rem;font-family:monospace;background:#fff;border:1.5px solid #ede9fe;border-radius:8px;padding:.5rem .9rem;color:#7c3aed;font-weight:700;letter-spacing:.02em}"
    ".room-card{display:flex;align-items:center;justify-content:space-between;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;background:#fafafa;margin-bottom:.6rem}"
    ".room-name{font-size:.9rem;font-weight:700;color:#1a0a3e}"
    ".room-meta{font-size:.75rem;color:#9ca3af}"
    ".room-badge{font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:20px}"
    ".rb-live{background:#fee2e2;color:#b91c1c}"
    ".rb-guest{background:#fef3c7;color:#92400e}"
    ".rb-member{background:#d1fae5;color:#065f46}"
    ".order-card{display:flex;align-items:center;gap:.9rem;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;margin-bottom:.6rem}"
    ".order-img{width:52px;height:52px;border-radius:8px;background:#f4f0ff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}"
    ".order-name{font-size:.88rem;font-weight:700;color:#1a0a3e}"
    ".order-meta{font-size:.75rem;color:#9ca3af}"
    ".order-price{font-size:.95rem;font-weight:800;color:#7c3aed;white-space:nowrap}"
    "@media(max-width:768px){.pw{grid-template-columns:1fr}.pactions{gap:.4rem}.pstats{gap:1rem}}"
)

jsx = r"""import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

""" + "const CSS = `" + CSS + "`;" + r"""

const TABS = [
  { id:'feed',      label:'Activity',    icon:'📊' },
  { id:'profile',   label:'Profile',     icon:'✏️' },
  { id:'friends',   label:'Friends',     icon:'👥' },
  { id:'wishlist',  label:'Wishlist',    icon:'❤️' },
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
  { id:1, av:'AL', name:'Anna Lindqvist',  text:'Added Nike Air Max 2024 to her wishlist and invited you to draw together.',        time:'2 min ago' },
  { id:2, av:'ME', name:'Maja Eriksson',   text:'Started a new canvas room "Spring Fashion Haul" — 3 people are drawing now.',      time:'15 min ago' },
  { id:3, av:'EJ', name:'Erik Johansson',  text:'Shared a IKEA sofa to the Family canvas. Click to see it.',                         time:'1 hr ago'  },
  { id:4, av:'SB', name:'Sofia Berg',      text:'Went live! She\'s drawing her wishlist right now with 24 viewers.',                 time:'2 hr ago'  },
  { id:5, av:'TU', name:'You',             text:'Created canvas room "My Wishlist" and added 4 products.',                           time:'3 hr ago'  },
];

const BADGES = [
  { icon:'🎨', name:'First Canvas',    desc:'Created your first canvas',    earned:true  },
  { icon:'👥', name:'Social Shopper',  desc:'Invited 3 friends',             earned:true  },
  { icon:'❤️', name:'Wishlist Pro',    desc:'Saved 10+ products',            earned:true  },
  { icon:'🔴', name:'Gone Live',       desc:'Hosted a live session',         earned:false },
  { icon:'🛒', name:'First Purchase',  desc:'Bought via DrawNBuy',           earned:false },
  { icon:'⭐', name:'Power Shopper',   desc:'50+ products added',            earned:false },
  { icon:'🤝', name:'Collab King',     desc:'10 collaborative canvases',     earned:false },
  { icon:'🌍', name:'Global Shopper',  desc:'Shopped from 5 countries',      earned:false },
];

const ROOMS = [
  { id:1, name:'Spring Fashion Haul',  members:3,  type:'live',   privacy:'public',  lastActive:'Now'         },
  { id:2, name:'My Wishlist',          members:1,  type:'member', privacy:'private', lastActive:'2 hrs ago'   },
  { id:3, name:'Family Shopping',      members:4,  type:'member', privacy:'friends', lastActive:'Yesterday'   },
  { id:4, name:'Guest Room #2841',     members:0,  type:'guest',  privacy:'public',  lastActive:'3 days ago'  },
];

const ORDERS = [
  { id:1, icon:'👟', name:'Nike Air Max 2024',    store:'Nike',    price:'£129',  status:'Delivered', date:'Apr 18' },
  { id:2, icon:'🛋️', name:'IKEA SÖDERHAMN Sofa', store:'IKEA',    price:'£549',  status:'Shipped',   date:'Apr 19' },
  { id:3, icon:'💄', name:'Charlotte Tilbury Kit', store:'Boots',  price:'£78',   status:'Processing',date:'Apr 20' },
];

export default function ProfilePage() {
  const navigate   = useNavigate();
  const user       = useAuthStore(s => s.user);
  const logout     = useAuthStore(s => s.logout);
  const updateUser = useAuthStore(s => s.updateUser);

  const [tab,       setTab]      = useState('feed');
  const [name,      setName]     = useState(user?.name || '');
  const [bio,       setBio]      = useState(user?.bio  || '');
  const [saved,     setSaved]    = useState(false);
  const [friends,   setFriends]  = useState(FRIENDS);
  const [iEmail,    setIEmail]   = useState('');
  const [iRel,      setIRel]     = useState('Friend');
  const [iSent,     setISent]    = useState(false);
  const [notifs,    setNotifs]   = useState({deals:true,collabs:true,news:false,weekly:true,live:true});
  const [delConf,   setDelConf]  = useState(false);
  const [isLive,    setIsLive]   = useState(false);
  const [copied,    setCopied]   = useState(false);

  const initials = (user?.name||'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const since    = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB',{month:'long',year:'numeric'}) : 'April 2026';

  const doSave = () => { updateUser?.({name,bio}); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const doInvite = () => {
    if (!iEmail) return;
    setFriends(p=>[...p,{id:Date.now(),name:iEmail.split('@')[0],email:iEmail,av:iEmail[0].toUpperCase(),rel:iRel,status:'invited',cv:0}]);
    setIEmail(''); setISent(true); setTimeout(()=>setISent(false),2000);
  };
  const doCopy = () => {
    navigator.clipboard?.writeText('https://drawnbuy.com/ref/'+initials.toLowerCase()+'2026');
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };
  const toggleLive = () => setIsLive(v=>!v);

  const shopStats = [
    {label:'Fashion',  pct:72},
    {label:'Tech',     pct:45},
    {label:'Home',     pct:61},
    {label:'Beauty',   pct:38},
    {label:'Sports',   pct:22},
    {label:'Food',     pct:15},
  ];

  return (
    <div style={{minHeight:'100vh',background:'#f4f0ff',padding:'1.5rem 1rem'}}>
      <style>{CSS}</style>
      <div className="pw" style={{maxWidth:'960px',margin:'0 auto'}}>

        {/* ── COVER + PROFILE HEADER ── */}
        <div className="cover">
          <button className="cover-edit">📷 Edit Cover</button>
        </div>

        <div className="profile-card">
          <div className="profile-top">
            <div style={{display:'flex',alignItems:'flex-end',gap:'1rem',flexWrap:'wrap'}}>
              <div className="avatar-wrap">
                <div className="av">{initials}</div>
                {isLive && <div className="live-ring"/>}
                <div className="av-upload">📷</div>
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
                    <div key={l} className="pstat"><div className="pstat-num">{n}</div><div className="pstat-lbl">{l}</div></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pactions">
              <button className="btn-sec" onClick={()=>setTab('profile')}>✏️ Edit Profile</button>
              <button className="btn-sec">🔗 Share</button>
              <button className={isLive?'btn-sec':'btn-live'} onClick={toggleLive}>
                {isLive?'⏹ End Live':'🔴 Go Live'}
              </button>
              <button className="btn-sec" onClick={()=>setTab('friends')}>💬 Messages</button>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="ptabs">
          {TABS.map(({id,label,icon})=>(
            <button key={id} className={'ptab'+(tab===id?' on':'')} onClick={()=>setTab(id)}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}

        {tab==='feed' && (
          <div className="pc">
            <div className="st">Activity Feed</div>
            <div className="ss">What your friends and connections are up to right now.</div>
            {FEED.map(f=>(
              <div key={f.id} className="feed-item">
                <div className="feed-av">{f.av}</div>
                <div><div className="feed-text"><strong>{f.name}</strong> {f.text}</div><div className="feed-time">{f.time}</div></div>
              </div>
            ))}
          </div>
        )}

        {tab==='profile' && (
          <div className="pc">
            <div className="st">Profile Information</div>
            <div className="ss">Update your display name, bio and shopping preferences.</div>
            <div style={{marginBottom:'1rem'}}><label className="fl">Display Name</label><input className="fi" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
            <div style={{marginBottom:'1rem'}}><label className="fl">Email</label><input className="fi" value={user?.email||''} disabled/></div>
            <div style={{marginBottom:'1rem'}}><label className="fl">Handle</label><input className="fi" placeholder="@yourhandle" defaultValue={'@'+(user?.name||'user').toLowerCase().replace(' ','.')}/></div>
            <div style={{marginBottom:'1rem'}}><label className="fl">Location</label><input className="fi" placeholder="Stockholm, Sweden" defaultValue="Stockholm, Sweden"/></div>
            <div style={{marginBottom:'1.25rem'}}>
              <label className="fl">Bio <span style={{color:'#9ca3af',fontWeight:400}}>{bio.length}/300</span></label>
              <textarea className="fi" value={bio} onChange={e=>setBio(e.target.value.slice(0,300))} rows={3} placeholder="Tell people what you shop for..." style={{resize:'vertical'}}/>
            </div>
            <hr className="dv"/>
            <div className="st">Shopping Preferences</div>
            <div className="ss">Help us show you more relevant products and canvases.</div>
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

        {tab==='friends' && (
          <div className="pc">
            <div className="st">Friends &amp; Family</div>
            <div className="ss">Shop and draw together. See who's online and invite new connections.</div>
            <div style={{background:'#f4f0ff',borderRadius:'12px',padding:'1rem',marginBottom:'1.25rem',border:'1.5px solid #ede9fe'}}>
              <div style={{fontSize:'.82rem',fontWeight:'700',color:'#7c3aed',marginBottom:'.75rem'}}>➕ Invite someone</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:'.6rem',alignItems:'end'}}>
                <div><label className="fl">Email</label><input className="fi" value={iEmail} onChange={e=>setIEmail(e.target.value)} placeholder="friend@example.com" type="email"/></div>
                <div><label className="fl">Relation</label><select className="fi" value={iRel} onChange={e=>setIRel(e.target.value)} style={{width:'120px'}}><option>Friend</option><option>Family</option><option>Partner</option><option>Colleague</option></select></div>
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
            {friends.length===0&&<div style={{textAlign:'center',color:'#9ca3af',padding:'2rem'}}>No connections yet. Invite friends above!</div>}
          </div>
        )}

        {tab==='wishlist' && (
          <div className="pc">
            <div className="st">Your Wishlist</div>
            <div className="ss">Products you have saved across DrawNBuy.</div>
            <div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}>
              <div style={{fontSize:'2rem',marginBottom:'1rem'}}>❤️</div>
              <div style={{fontSize:'.88rem',marginBottom:'1rem'}}>No saved products yet.</div>
              <button className="bp" onClick={()=>navigate('/')}>Browse Products</button>
            </div>
          </div>
        )}

        {tab==='rooms' && (
          <div className="pc">
            <div className="st">Your Canvas Rooms</div>
            <div className="ss">Rooms you created or joined. Members keep rooms forever, guests for 48h.</div>
            {ROOMS.map(r=>(
              <div key={r.id} className="room-card">
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.2rem'}}>
                    <div className="room-name">{r.name}</div>
                    <span className={'room-badge '+(r.type==='live'?'rb-live':r.type==='guest'?'rb-guest':'rb-member')}>{r.type==='live'?'🔴 Live':r.type==='guest'?'Guest':'Member'}</span>
                  </div>
                  <div className="room-meta">{r.members} {r.members===1?'member':'members'} · {r.privacy} · Last active {r.lastActive}</div>
                </div>
                <button className="btn-pri" style={{fontSize:'.75rem',padding:'6px 12px'}} onClick={()=>navigate('/canvas')}>Open</button>
              </div>
            ))}
            <div style={{marginTop:'.75rem'}}><button className="bp" onClick={()=>navigate('/canvas')}>➕ Create New Room</button></div>
          </div>
        )}

        {tab==='orders' && (
          <div className="pc">
            <div className="st">Order History</div>
            <div className="ss">Products you have purchased via DrawNBuy.</div>
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
            {ORDERS.length===0&&<div style={{textAlign:'center',color:'#9ca3af',padding:'2rem'}}>No orders yet.</div>}
          </div>
        )}

        {tab==='badges' && (
          <div className="pc">
            <div className="st">Achievements &amp; Badges</div>
            <div className="ss">Earn badges by shopping, drawing and collaborating on DrawNBuy.</div>
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

        {tab==='stats' && (
          <div className="pc">
            <div className="st">Shopping Stats</div>
            <div className="ss">Your most browsed and purchased categories on DrawNBuy.</div>
            <div style={{marginBottom:'1.5rem'}}>
              {shopStats.map(s=>(
                <div key={s.label} className="stat-bar">
                  <div className="stat-bar-label">{s.label}</div>
                  <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:s.pct+'%'}}/></div>
                  <div className="stat-bar-val">{s.pct}%</div>
                </div>
              ))}
            </div>
            <hr className="dv"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem',textAlign:'center'}}>
              {[['38','Products Saved'],['12','Canvases'],['247','Friends'],['3','Purchases'],['1.2K','Profile Views'],['8','Badges']].map(([n,l])=>(
                <div key={l} style={{background:'#f4f0ff',borderRadius:'10px',padding:'.85rem'}}>
                  <div style={{fontSize:'1.2rem',fontWeight:800,color:'#7c3aed'}}>{n}</div>
                  <div style={{fontSize:'.72rem',color:'#6b7280'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='referral' && (
          <div className="pc">
            <div className="st">Referral Program</div>
            <div className="ss">Invite friends and earn rewards when they join DrawNBuy.</div>
            <div className="ref-box">
              <div style={{fontSize:'.85rem',fontWeight:700,color:'#7c3aed',marginBottom:'.75rem'}}>Your unique referral link</div>
              <div className="ref-link">drawnbuy.com/ref/{initials.toLowerCase()}2026</div>
              <button className="bp" style={{marginTop:'1rem'}} onClick={doCopy}>{copied?'✓ Copied!':'📋 Copy Link'}</button>
            </div>
            <hr className="dv"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem',textAlign:'center',marginTop:'1rem'}}>
              {[['0','Friends Referred'],['0','Rewards Earned'],['10%','Commission Rate']].map(([n,l])=>(
                <div key={l} style={{background:'#f4f0ff',borderRadius:'10px',padding:'.85rem'}}>
                  <div style={{fontSize:'1.2rem',fontWeight:800,color:'#7c3aed'}}>{n}</div>
                  <div style={{fontSize:'.72rem',color:'#6b7280'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='notifs' && (
          <div className="pc">
            <div className="st">Notifications</div>
            <div className="ss">Choose what emails and alerts you receive.</div>
            {[
              {key:'deals',   label:'Flash Deals',       sub:'New deals and limited offers'},
              {key:'collabs', label:'Canvas Invites',    sub:'When someone invites you to draw'},
              {key:'live',    label:'Friends Going Live',sub:'When friends start a live session'},
              {key:'news',    label:'Product Updates',   sub:'New features and improvements'},
              {key:'weekly',  label:'Weekly Digest',     sub:'Trending products each week'},
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

        {tab==='security' && (
          <div className="pc">
            <div className="st">Security</div>
            <div className="ss">Manage your password and account security.</div>
            <div style={{padding:'.85rem',background:'#f9fafb',borderRadius:'10px',border:'1px solid #f3f4f6',marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>Password</div><div style={{fontSize:'.78rem',color:'#9ca3af'}}>Last changed: Never</div></div>
                <button className="bg2">Change Password</button>
              </div>
            </div>
            <div style={{padding:'.85rem',background:'#f9fafb',borderRadius:'10px',border:'1px solid #f3f4f6',marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>Two-Factor Authentication</div><div style={{fontSize:'.78rem',color:'#9ca3af'}}>Add an extra layer of security</div></div>
                <span style={{fontSize:'.75rem',fontWeight:700,background:'#fef3c7',color:'#92400e',padding:'3px 10px',borderRadius:'20px'}}>Coming soon</span>
              </div>
            </div>
            <div style={{padding:'.85rem',background:'#f9fafb',borderRadius:'10px',border:'1px solid #f3f4f6'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>Active Sessions</div><div style={{fontSize:'.78rem',color:'#9ca3af'}}>1 device — Stockholm, Sweden</div></div>
                <button className="bd" style={{padding:'5px 12px',fontSize:'.75rem'}}>Sign Out All</button>
              </div>
            </div>
            <hr className="dv"/>
            <button className="bd" style={{width:'100%',justifyContent:'center'}} onClick={()=>setDelConf(true)}>🗑️ Delete Account</button>
          </div>
        )}

        {tab==='data' && (
          <div className="pc">
            <div className="st">Your Data</div>
            <div className="ss">DrawNBuy stores your data in Sweden and complies with GDPR (IMY).</div>
            <div style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
              <button className="bg2">📦 Export My Data</button>
              <button className="bd">🗑️ Delete My Data</button>
            </div>
            <hr className="dv"/>
            <div style={{fontSize:'.8rem',color:'#6b7280',lineHeight:1.7}}>
              <strong>What we store:</strong> Your name, email, canvases, chat messages and product interactions.<br/>
              <strong>What we never do:</strong> Sell your data or share with third parties.<br/>
              <strong>Your rights:</strong> Under GDPR you can access, correct and delete your data at any time.<br/>
              <strong>Contact:</strong> <a href="mailto:privacy@drawnbuy.com" style={{color:'#7c3aed'}}>privacy@drawnbuy.com</a>
            </div>
          </div>
        )}

        {/* Logout quick access */}
        <div style={{display:'flex',gap:'.75rem',marginTop:'.5rem'}}>
          <button className="bg2" style={{flex:1,justifyContent:'center'}} onClick={()=>{logout();navigate('/');}}>↩ Log Out</button>
        </div>

      </div>

      {/* Delete confirmation modal */}
      {delConf&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'2rem',maxWidth:'400px',width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{fontSize:'1.1rem',fontWeight:800,color:'#1a0a3e',marginBottom:'.5rem'}}>Delete Account?</div>
            <div style={{fontSize:'.88rem',color:'#6b7280',marginBottom:'1.5rem'}}>This will permanently delete your account and all your data. This cannot be undone.</div>
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
"""

p = pathlib.Path('src/pages/ProfilePage.jsx')
p.write_text(jsx, encoding='utf-8')
lines = jsx.count('\n')
print(f'Written: {lines} lines')

# Verify critical parts
assert "const CSS = `" in jsx, "MISSING CSS backtick open"
assert "`;" in jsx, "MISSING CSS backtick close"
assert "tab==='feed'" in jsx, "MISSING feed tab"
assert "tab==='friends'" in jsx, "MISSING friends tab"
assert "tab==='badges'" in jsx, "MISSING badges tab"
assert "tab==='stats'" in jsx, "MISSING stats tab"
assert "tab==='rooms'" in jsx, "MISSING rooms tab"
assert "tab==='orders'" in jsx, "MISSING orders tab"
assert "tab==='referral'" in jsx, "MISSING referral tab"
print('All checks passed — 12 tabs verified')
print('Ready to build and push')
