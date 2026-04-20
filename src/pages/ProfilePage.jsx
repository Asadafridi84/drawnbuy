import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
const IC = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>);
const IU = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const IK = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>);
const IM = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const IO = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const IT = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>);
const IS = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>);
const IH = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const IL = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const ID = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>);
const IB = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
const IW = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>);
const IP = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const TABS = [
  { id: "profile",  label: "Profile",          icon: IH },
  { id: "friends",  label: "Friends & Family",  icon: IU },
  { id: "wishlist", label: "Wishlist",           icon: IW },
  { id: "notifs",   label: "Notifications",      icon: IB },
  { id: "security", label: "Security",           icon: IL },
  { id: "data",     label: "Your Data",          icon: ID },
];
const FRIENDS = [
  { id:1, name:"Anna Lindqvist", email:"anna@example.com", av:"AL", rel:"Family",  status:"online",  cv:12 },
  { id:2, name:"Maja Eriksson",  email:"maja@example.com", av:"ME", rel:"Friend",  status:"offline", cv:7  },
  { id:3, name:"Erik Johansson", email:"erik@example.com", av:"EJ", rel:"Family",  status:"online",  cv:4  },
  { id:4, name:"Sofia Berg",     email:"sofia@example.com",av:"SB", rel:"Friend",  status:"offline", cv:19 },
];
const CSS = \n.ps{display:flex;flex-direction:column;gap:1rem}
.pc{background:#fff;border-radius:16px;padding:1.5rem;box-shadow:0 2px 12px rgba(124,58,237,.08)}
.av{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:1.5rem;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;border:3px solid #ede9fe}
.pn{font-size:1.1rem;font-weight:800;color:#1a0a3e;text-align:center}
.pe{font-size:.78rem;color:#6b7280;text-align:center;margin-bottom:.25rem}
.pm{font-size:.72rem;color:#9ca3af;text-align:center;margin-bottom:1rem}
.sr{display:flex;align-items:center;gap:.6rem;padding:.5rem .6rem;border-radius:8px;background:#f4f0ff;margin-bottom:.4rem}
.si{color:#7c3aed;display:flex;align-items:center}
.sl{font-size:.78rem;color:#6b7280;flex:1}
.sv{font-size:.88rem;font-weight:800;color:#1a0a3e}
.tb{display:flex;align-items:center;gap:.6rem;width:100%;padding:.65rem .9rem;border-radius:10px;border:none;background:transparent;color:#6b7280;font-family:inherit;font-size:.88rem;font-weight:600;cursor:pointer;transition:.15s;text-align:left}
.tb:hover{background:#f4f0ff;color:#7c3aed}
.tb.on{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff}
.st{font-size:1rem;font-weight:800;color:#1a0a3e;margin-bottom:.25rem}
.ss{font-size:.8rem;color:#6b7280;margin-bottom:1.25rem}
.fl{font-size:.8rem;font-weight:700;color:#374151;margin-bottom:.4rem;display:block}
.fi{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:.65rem .9rem;font-family:inherit;font-size:.88rem;color:#1a0a3e;outline:none;transition:.15s;box-sizing:border-box}
.fi:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12)}
.fi:disabled{background:#f9fafb;color:#9ca3af}
.bp{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:10px;padding:.65rem 1.4rem;font-family:inherit;font-size:.88rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s}
.bp:hover{opacity:.9}
.bd{background:#fee2e2;color:#b91c1c;border:1.5px solid #fca5a5;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s}
.bd:hover{background:#fca5a5}
.bg2{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:.4rem}
.bg2:hover{background:#ede9fe}
.dv{border:none;border-top:1px solid #f3f4f6;margin:1.25rem 0}
.fc{display:flex;align-items:center;gap:.9rem;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;background:#fafafa;margin-bottom:.6rem;transition:.15s}
.fc:hover{border-color:#ede9fe;background:#f4f0ff}
.fa{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:.88rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fn{font-size:.9rem;font-weight:700;color:#1a0a3e}
.fe{font-size:.75rem;color:#9ca3af}
.ftag{font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
.tfam{background:#dbeafe;color:#1d4ed8}
.tfri{background:#d1fae5;color:#065f46}
.tinv{background:#fef3c7;color:#92400e}
.sd{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.son{background:#22c55e}.sof{background:#d1d5db}.sin{background:#fbbf24}
.nr{display:flex;align-items:center;justify-content:space-between;padding:.85rem 0;border-bottom:1px solid #f3f4f6}
.nl{font-size:.88rem;font-weight:600;color:#1a0a3e}
.ns{font-size:.75rem;color:#9ca3af}
.tog{position:relative;width:44px;height:24px;cursor:pointer;display:inline-block}
.tog input{opacity:0;width:0;height:0}
.tsl{position:absolute;inset:0;border-radius:24px;background:#e5e7eb;transition:.2s}
.tog input:checked + .tsl{background:#7c3aed}
.tsl::before{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}
.tog input:checked + .tsl::before{transform:translateX(20px)}
.ok{background:#d1fae5;color:#065f46;border-radius:8px;padding:.5rem .9rem;font-size:.82rem;font-weight:700;display:inline-flex;align-items:center;gap:.4rem}
@media(max-width:768px){.pw{grid-template-columns:1fr}}.pw{display:grid;grid-template-columns:260px 1fr;gap:1.5rem;max-width:960px;margin:0 auto;align-items:start}
`;

export default function ProfilePage() {
  const navigate   = useNavigate();
  const user       = useAuthStore(s => s.user);
  const logout     = useAuthStore(s => s.logout);
  const updateUser = useAuthStore(s => s.updateUser);
  const [tab,    setTab]    = useState('profile');
  const [name,   setName]   = useState(user?.name || '');
  const [bio,    setBio]    = useState(user?.bio  || '');
  const [saved,  setSaved]  = useState(false);
  const [friends,setFriends]= useState(FRIENDS);
  const [iEmail, setIEmail] = useState('');
  const [iRel,   setIRel]   = useState('Friend');
  const [iSent,  setISent]  = useState(false);
  const [notifs, setNotifs] = useState({deals:true,collabs:true,news:false,weekly:true});
  const [delConf,setDelConf]= useState(false);
  const initials = (user?.name||'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const since    = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB',{month:'long',year:'numeric'}) : 'April 2026';
  const stats    = [
    {label:'Canvases',        value:user?.stats?.canvases||0, Icon:IC},
    {label:'Collabs',         value:user?.stats?.collabs ||0, Icon:IU},
    {label:'Products placed', value:user?.stats?.products||0, Icon:IK},
    {label:'Messages sent',   value:user?.stats?.messages||0, Icon:IM},
  ];
  const doSave = () => { updateUser?.({name,bio}); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const doInvite = () => {
    if (!iEmail) return;
    setFriends(p=>[...p,{id:Date.now(),name:iEmail.split('@')[0],email:iEmail,av:iEmail[0].toUpperCase(),rel:iRel,status:'invited',cv:0}]);
    setIEmail(''); setISent(true); setTimeout(()=>setISent(false),2000);
  };
  return (
    <div style={{minHeight:'100vh',background:'#f4f0ff',padding:'2rem 1rem'}}>
      <style>{CSS}</style>
      <div className="pw">
        <div className="ps">
          <div className="pc" style={{textAlign:'center'}}>
            <div className="av">{initials}</div>
            <div className="pn">{user?.name||'User'}</div>
            <div className="pe">{user?.email}</div>
            <div className="pm">Member since {since}</div>
            <button className="bg2" style={{width:'100%',justifyContent:'center'}}><IH/> Upload Photo</button>
          </div>
          <div className="pc">
            <div style={{fontSize:'.75rem',fontWeight:'800',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.75rem'}}>Your Stats</div>
            {stats.map(({label,value,Icon})=>(
              <div key={label} className="sr">
                <span className="si"><Icon/></span>
                <span className="sl">{label}</span>
                <span className="sv">{value||'—'}</span>
              </div>
            ))}
          </div>
          <div className="pc" style={{padding:'.75rem'}}>
            {TABS.map(({id,label,icon:Icon})=>(
              <button key={id} className={`tb${tab===id?' on':''}`} onClick={()=>setTab(id)}>
                <span style={{display:'flex',alignItems:'center'}}><Icon/></span>{label}
              </button>
            ))}
          </div>
          <div className="pc" style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
            <button className="bg2" style={{width:'100%',justifyContent:'center'}} onClick={()=>{logout();navigate('/')}}><IO/> Log Out</button>
            <button className="bd"  style={{width:'100%',justifyContent:'center'}} onClick={()=>setDelConf(true)}><IT/> Delete Account</button>
          </div>
        </div>
        <div>
          {tab==='profile' && (
            <div className="pc">
              <div className="st">Profile Information</div>
              <div className="ss">Update your name and bio. Your email cannot be changed.</div>
              <div style={{marginBottom:'1rem'}}><label className="fl">Display Name</label><input className="fi" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
              <div style={{marginBottom:'1rem'}}><label className="fl">Email</label><input className="fi" value={user?.email||''} disabled/><div style={{fontSize:'.72rem',color:'#9ca3af',marginTop:'.3rem'}}>Email changes are not supported yet.</div></div>
              <div style={{marginBottom:'1.25rem'}}><label className="fl">Bio <span style={{color:'#9ca3af',fontWeight:400}}>{bio.length}/300</span></label><textarea className="fi" value={bio} onChange={e=>setBio(e.target.value.slice(0,300))} rows={4} placeholder="Tell people what you shop for..." style={{resize:'vertical'}}/></div>
              {saved ? <div className="ok"><IS/> Saved!</div> : <button className="bp" onClick={doSave}><IS/> Save Changes</button>}
              <hr className="dv"/>
              <div className="st">Shopping Preferences</div>
              <div className="ss">Help us show you more relevant products.</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
                {['Fashion','Tech','Home','Beauty','Sports','Food'].map(c=>(
                  <label key={c} style={{display:'flex',alignItems:'center',gap:'.5rem',cursor:'pointer',fontSize:'.85rem',fontWeight:600,color:'#374151'}}>
                    <input type="checkbox" style={{accentColor:'#7c3aed',width:16,height:16}}/> {c}
                  </label>
                ))}
              </div>
            </div>
          )}
          {tab==='friends' && (
            <div className="pc">
              <div className="st">Friends &amp; Family</div>
              <div className="ss">Add people so you can easily shop and draw together on shared canvases.</div>
              <div style={{background:'#f4f0ff',borderRadius:'12px',padding:'1rem',marginBottom:'1.25rem',border:'1.5px solid #ede9fe'}}>
                <div style={{fontSize:'.82rem',fontWeight:'700',color:'#7c3aed',marginBottom:'.75rem',display:'flex',alignItems:'center',gap:'.4rem'}}><IP/> Invite someone</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:'.6rem',alignItems:'end'}}>
                  <div><label className="fl">Email address</label><input className="fi" value={iEmail} onChange={e=>setIEmail(e.target.value)} placeholder="friend@example.com" type="email"/></div>
                  <div><label className="fl">Relation</label><select className="fi" value={iRel} onChange={e=>setIRel(e.target.value)} style={{width:'120px'}}><option>Friend</option><option>Family</option><option>Partner</option><option>Colleague</option></select></div>
                  <button className="bp" onClick={doInvite} style={{marginBottom:'1px'}}><IP/> Invite</button>
                </div>
                {iSent && <div className="ok" style={{marginTop:'.6rem'}}>Invitation sent!</div>}
              </div>
              <div style={{fontSize:'.75rem',fontWeight:'800',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.75rem'}}>{friends.length} connection{friends.length!==1?'s':''}</div>
              {friends.map(f=>(
                <div key={f.id} className="fc">
                  <div className="fa">{f.av}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'.4rem',flexWrap:'wrap'}}>
                      <div className="fn">{f.name}</div>
                      <span className={`ftag ${f.status==='invited'?'tinv':f.rel==='Family'?'tfam':'tfri'}`}>{f.status==='invited'?'Invited':f.rel}</span>
                    </div>
                    <div className="fe">{f.email}</div>
                    {f.cv>0 && <div style={{fontSize:'.72rem',color:'#9ca3af',marginTop:'.15rem'}}>{f.cv} shared canvases</div>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                    <div className={`sd ${f.status==='online'?'son':f.status==='invited'?'sin':'sof'}`} title={f.status}/>
                    {f.status!=='invited' && <button style={{background:'#f4f0ff',border:'1px solid #ede9fe',borderRadius:'8px',padding:'5px 10px',fontSize:'.75rem',fontWeight:700,color:'#7c3aed',cursor:'pointer'}}>Draw Together</button>}
                    <button onClick={()=>setFriends(p=>p.filter(x=>x.id!==f.id))} style={{background:'none',border:'none',cursor:'pointer',color:'#d1d5db',padding:'4px'}}><IT/></button>
                  </div>
                </div>
              ))}
              {friends.length===0 && <div style={{textAlign:'center',color:'#9ca3af',padding:'2rem',fontSize:'.88rem'}}>No connections yet. Invite friends and family above!</div>}
            </div>
          )}
          {tab==='wishlist' && (
            <div className="pc">
              <div className="st">Your Wishlist</div>
              <div className="ss">Products you have saved across DrawNBuy.</div>
              <div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}><IW/><div style={{marginTop:'1rem',fontSize:'.88rem'}}>Your saved products will appear here.</div><button className="bp" style={{marginTop:'1rem'}} onClick={()=>navigate('/')}>Browse Products</button></div>
            </div>
          )}
          {tab==='notifs' && (
            <div className="pc">
              <div className="st">Notifications</div>
              <div className="ss">Choose what emails and alerts you receive.</div>
              {[{key:'deals',label:'Flash Deals',sub:'Get notified when new deals drop'},{key:'collabs',label:'Canvas Invites',sub:'When someone invites you to draw together'},{key:'news',label:'Product Updates',sub:'New features and improvements'},{key:'weekly',label:'Weekly Digest',sub:'A summary of trending products each week'}].map(({key,label,sub})=>(
                <div key={key} className="nr">
                  <div><div className="nl">{label}</div><div className="ns">{sub}</div></div>
                  <label className="tog"><input type="checkbox" checked={notifs[key]} onChange={e=>setNotifs(n=>({...n,[key]:e.target.checked}))}/><span className="tsl"/></label>
                </div>
              ))}
              <div style={{marginTop:'1.25rem'}}><button className="bp" onClick={doSave}><IS/> Save Preferences</button></div>
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
              <div style={{padding:'.85rem',background:'#f9fafb',borderRadius:'10px',border:'1px solid #f3f4f6'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><div style={{fontSize:'.9rem',fontWeight:700,color:'#1a0a3e'}}>Two-Factor Authentication</div><div style={{fontSize:'.78rem',color:'#9ca3af'}}>Add an extra layer of security</div></div>
                  <span style={{fontSize:'.75rem',fontWeight:700,background:'#fef3c7',color:'#92400e',padding:'3px 10px',borderRadius:'20px'}}>Coming soon</span>
                </div>
              </div>
            </div>
          )}
          {tab==='data' && (
            <div className="pc">
              <div className="st">Your Data</div>
              <div className="ss">DrawNBuy stores your data in Sweden and complies with GDPR.</div>
              <div style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
                <button className="bg2"><ID/> Export My Data</button>
                <button className="bd"><IT/> Delete My Data</button>
              </div>
              <hr className="dv"/>
              <div style={{fontSize:'.8rem',color:'#6b7280',lineHeight:1.7}}>
                <strong>What we store:</strong> Your name, email, canvases, chat messages and product interactions.<br/>
                <strong>What we never do:</strong> Sell your data or share with third parties.<br/>
                <strong>Your rights:</strong> Under GDPR (IMY, Sweden) you can access, correct and delete your data.<br/>
                <strong>Contact:</strong> <a href="mailto:privacy@drawnbuy.com" style={{color:'#7c3aed'}}>privacy@drawnbuy.com</a>
              </div>
            </div>
          )}
        </div>
      </div>
      {delConf && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'2rem',maxWidth:'400px',width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{fontSize:'1.1rem',fontWeight:800,color:'#1a0a3e',marginBottom:'.5rem'}}>Delete Account?</div>
            <div style={{fontSize:'.88rem',color:'#6b7280',marginBottom:'1.5rem'}}>This will permanently delete your account. This cannot be undone.</div>
            <div style={{display:'flex',gap:'.75rem'}}>
              <button className="bg2" style={{flex:1,justifyContent:'center'}} onClick={()=>setDelConf(false)}>Cancel</button>
              <button className="bd"  style={{flex:1,justifyContent:'center'}} onClick={()=>{logout();navigate('/')}}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
