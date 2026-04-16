import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const IEye   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IUsers = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IPen   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>;
const IErase = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 20H7L3 16l10-10 7 7-1.5 1.5"/><path d="M6.5 17.5l4-4"/></svg>;
const ITrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>;
const ISend  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IHeart = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const ILock  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IShare = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IEditI = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IPlus  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IBell  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IData  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IDown  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IClose = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ICam   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IImg   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>;

const Logo = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" style={{flexShrink:0}}>
    <defs>
      <linearGradient id="ppg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#3b0764"/></linearGradient>
      <linearGradient id="ppg2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
      <linearGradient id="ppg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f4f0ff"/><stop offset="100%" stopColor="#ede9fe"/></linearGradient>
    </defs>
    <rect x="1.5" y="2" width="21" height="15" rx="3" fill="url(#ppg1)"/>
    <rect x="3" y="3.5" width="18" height="12" rx="1.8" fill="url(#ppg3)"/>
    <text x="5.2" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#7c3aed">D</text>
    <text x="10.8" y="11.8" fontFamily="Georgia,serif" fontSize="5" fill="#5b21b6">n</text>
    <text x="14.8" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#67e8f9">B</text>
    <rect x="11" y="17" width="2" height="2.5" rx="0.5" fill="#5b21b6"/>
    <rect x="6.5" y="19.5" width="11" height="3" rx="1.5" fill="url(#ppg2)"/>
    <circle cx="9.5" cy="22.8" r="0.85" fill="#3b0764"/><circle cx="14.5" cy="22.8" r="0.85" fill="#3b0764"/>
    <circle cx="9.5" cy="22.8" r="0.35" fill="#fbbf24"/><circle cx="14.5" cy="22.8" r="0.35" fill="#fbbf24"/>
  </svg>
);

const FRIENDS_DATA = [
  {id:1,name:'Anna Lindqvist',handle:'@anna.l', av:'AL',rel:'Family',online:true, col:'linear-gradient(135deg,#7c3aed,#5b21b6)',canSee:true},
  {id:2,name:'Maja Eriksson', handle:'@maja.e', av:'ME',rel:'Friend',online:true, col:'linear-gradient(135deg,#22c55e,#16a34a)',canSee:true},
  {id:3,name:'Erik Johansson',handle:'@erikj',  av:'EJ',rel:'Family',online:false,col:'linear-gradient(135deg,#fbbf24,#f59e0b)',canSee:true},
  {id:4,name:'Sofia Berg',    handle:'@sofia.b', av:'SB',rel:'Friend',online:false,col:'linear-gradient(135deg,#ef4444,#dc2626)',canSee:false},
  {id:5,name:'Lars Holm',     handle:'@larsholm',av:'LH',rel:'Friend',online:true, col:'linear-gradient(135deg,#0ea5e9,#0284c7)',canSee:true},
];
const WISHLIST_INIT = [
  {id:1,name:'IKEA KALLAX',  price:'649 kr',  img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=70'},
  {id:2,name:'Dyson V15',    price:'6 499 kr',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=70'},
  {id:3,name:'KitchenAid',   price:'5 299 kr',img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=70'},
];
const ALL_USERS = [
  {id:10,name:'Sofia Berg', handle:'@sofia.b', av:'SB',col:'#ef4444'},
  {id:11,name:'Karin Ahl',  handle:'@karin.a', av:'KA',col:'#8b5cf6'},
  {id:12,name:'Peter Jens', handle:'@peterj',  av:'PJ',col:'#0ea5e9'},
  {id:13,name:'Lisa Nord',  handle:'@lisanord',av:'LN',col:'#f59e0b'},
];
const CHAT_INIT = [
  {id:1,av:'M',name:'Maja',text:'Love your canvas! The sofa sketch looks amazing',time:'14:20',col:'#22c55e',me:false,prod:null},
  {id:2,av:'L',name:'Lars',text:'Added this from your wishlist!',time:'14:21',col:'#0ea5e9',me:false,
   prod:{name:'IKEA SÃ–DERHAMN',price:'4 295 kr',img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=70'}},
  {id:3,av:'A',name:'You', text:'Yes! Amazing quality from IKEA',time:'14:22',col:'#7c3aed',me:true,prod:null},
];
const COLORS = ['#7c3aed','#fbbf24','#67e8f9','#ef4444','#22c55e','#000'];

function Toggle({checked,onChange}){
  return(
    <label style={{position:'relative',width:'36px',height:'20px',flexShrink:0,cursor:'pointer',display:'inline-block'}}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{opacity:0,width:0,height:0,position:'absolute'}}/>
      <span style={{position:'absolute',inset:0,borderRadius:'20px',background:checked?'#7c3aed':'#e5e7eb',transition:'.2s',cursor:'pointer'}}>
        <span style={{position:'absolute',width:'14px',height:'14px',left:'3px',top:'3px',borderRadius:'50%',background:'#fff',transition:'.2s',transform:checked?'translateX(16px)':'none',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
      </span>
    </label>
  );
}

function Modal({open,onClose,title,subtitle,children,width=430}){
  if(!open)return null;
  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <div style={{background:'#fff',borderRadius:'20px',padding:'1.75rem',maxWidth:`px,width:'90%',position:'relative',animation:'ppPopIn .25s ease both'}}>
        <button onClick={onClose} style={{position:'absolute',top:'1rem',right:'1rem',background:'none',border:'none',cursor:'pointer',color:'#9ca3af',padding:'4px',borderRadius:'6px',display:'flex'}}><IClose/></button>
        <div style={{fontSize:'1.05rem',fontWeight:800,color:'#1a0a3e',marginBottom:'.2rem'}}>{title}</div>
        {subtitle&&<div style={{fontSize:'.8rem',color:'#6b7280',marginBottom:'1rem'}}>{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage(){
  const navigate=useNavigate();
  const user=useAuthStore(s=>s.user);
  const logout=useAuthStore(s=>s.logout);

  const [tab,setTab]=useState('canvas');
  const [privacy,setPrivacy]=useState('all');
  const [friends,setFriends]=useState(FRIENDS_DATA);
  const [wishlist,setWishlist]=useState(WISHLIST_INIT);
  const [msgs,setMsgs]=useState(CHAT_INIT);
  const [chatInput,setChatInput]=useState('');
  const [drawn,setDrawn]=useState(false);
  const [stickers,setStickers]=useState([]);
  const [syncNote,setSyncNote]=useState(null);
  const [avatarSrc,setAvatarSrc]=useState(null);
  const [coverSrc,setCoverSrc]=useState(null);
  const [drawColor,setDrawColor]=useState('#7c3aed');
  const [drawTool,setDrawTool]=useState('draw');
  const [userSearch,setUserSearch]=useState('');
  const [shareOpen,setShareOpen]=useState(false);
  const [editOpen,setEditOpen]=useState(false);
  const [addOpen,setAddOpen]=useState(false);
  const [editName,setEditName]=useState(user?.name||'User');
  const [editEmail,setEditEmail]=useState(user?.email||'');
  const [editLoc,setEditLoc]=useState('Stockholm, Sweden');
  const [editBio,setEditBio]=useState('Drawing wishlists since 2024');
  const [copied,setCopied]=useState(false);

  const cvRef=useRef(null);
  const drawingRef=useRef(false);
  const lastRef=useRef(null);
  const toolRef=useRef('draw');
  const colorRef=useRef('#7c3aed');
  const msgsRef=useRef(null);
  const avInRef=useRef(null);
  const covInRef=useRef(null);

  useEffect(()=>{
    const resize=()=>{
      const cv=cvRef.current;if(!cv)return;
      const r=cv.parentElement.getBoundingClientRect();
      cv.width=r.width;cv.height=r.height;
    };
    window.addEventListener('resize',resize);
    setTimeout(resize,100);
    return()=>window.removeEventListener('resize',resize);
  },[]);

  useEffect(()=>{
    if(msgsRef.current)msgsRef.current.scrollTop=msgsRef.current.scrollHeight;
  },[msgs]);

  useEffect(()=>{
    const h=e=>syncProduct(e.detail);
    window.addEventListener('drawnbuy:syncProduct',h);
    return()=>window.removeEventListener('drawnbuy:syncProduct',h);
  },[wishlist]);

  const syncProduct=(prod)=>{
    setSyncNote("${prod.name}" synced from main page);
    setTimeout(()=>setSyncNote(null),4500);
    setStickers(s=>[...s,{...prod,sid:Date.now(),x:50+Math.random()*200,y:30+Math.random()*160}]);
    setDrawn(true);
    setWishlist(w=>w.find(x=>x.name===prod.name)?w:[{...prod,id:Date.now(),_new:true},...w]);
    setTimeout(()=>setWishlist(w=>w.map(x=>({...x,_new:false}))),2500);
    addChatMsg('A','You',"${prod.name}" added to canvas,prod,'#7c3aed',true);
  };

  const addChatMsg=(av,name,text,prod,col,me)=>{
    const now=new Date(),time=`:${String(now.getMinutes()).padStart(2,'0')};
    setMsgs(m=>[...m,{id:Date.now(),av,name,text,prod:prod||null,col,me,time}]);
  };

  const getPos=(e)=>{
    const cv=cvRef.current;if(!cv)return{x:0,y:0};
    const r=cv.getBoundingClientRect(),s=e.touches?e.touches[0]:e;
    return{x:s.clientX-r.left,y:s.clientY-r.top};
  };

  const onCvDown=(e)=>{drawingRef.current=true;lastRef.current=getPos(e);};
  const onCvUp=()=>{drawingRef.current=false;};
  const onCvMove=(e)=>{
    if(!drawingRef.current)return;
    const cv=cvRef.current;if(!cv)return;
    const ctx=cv.getContext('2d'),p=getPos(e);
    ctx.beginPath();
    if(toolRef.current==='erase'){ctx.globalCompositeOperation='destination-out';ctx.lineWidth=22;}
    else{ctx.globalCompositeOperation='source-over';ctx.strokeStyle=colorRef.current;ctx.lineWidth=3;}
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.moveTo(lastRef.current.x,lastRef.current.y);ctx.lineTo(p.x,p.y);ctx.stroke();
    lastRef.current=p;
    if(!drawn)setDrawn(true);
  };
  const clearCanvas=()=>{
    const cv=cvRef.current;if(!cv)return;
    cv.getContext('2d').clearRect(0,0,cv.width,cv.height);
    setDrawn(false);setStickers([]);
  };

  const handleAvUpload=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setAvatarSrc(ev.target.result);r.readAsDataURL(f);};
  const handleCovUpload=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCoverSrc(ev.target.result);r.readAsDataURL(f);};
  const toggleFriendSee=(id)=>setFriends(f=>f.map(x=>x.id===id?{...x,canSee:!x.canSee}:x));
  const addUser=(u)=>{if(friends.find(f=>f.id===u.id))return;setFriends(f=>[...f,{...u,rel:'Friend',online:false,canSee:true}]);setAddOpen(false);setUserSearch('');};
  const copyLink=()=>{navigator.clipboard?.writeText('drawnbuy.com/u/asad').catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const sendChat=()=>{if(!chatInput.trim())return;addChatMsg('A','You',chatInput,null,'#7c3aed',true);setChatInput('');};

  const filteredUsers=ALL_USERS.filter(u=>!friends.find(f=>f.id===u.id)&&(u.name.toLowerCase().includes(userSearch.toLowerCase())||u.handle.includes(userSearch.toLowerCase())));
  const displayName=editName||user?.name||'User';
  const initials=displayName.slice(0,2).toUpperCase();

  const S=
    @keyframes ppFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @keyframes ppFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
    @keyframes ppBlink{0%,100%{opacity:1}50%{opacity:.2}}
    @keyframes ppSlide{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
    @keyframes ppPopIn{from{opacity:0;transform:scale(.88) translateY(-8px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes ppDrop{from{opacity:0;transform:translateY(-20px) scale(.88)}to{opacity:1;transform:none}}
    .ppbody{font-family:'Space Grotesk',sans-serif;background:#f4f0ff;color:#1a0a3e;min-height:100vh}
    .ppnav{background:linear-gradient(90deg,#3b0764,#5b21b6);height:56px;display:flex;align-items:center;padding:0 1.5rem;gap:.75rem;position:sticky;top:0;z-index:200;box-shadow:0 2px 24px rgba(59,7,100,.5)}
    .ppnb{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;padding:6px 14px;border-radius:8px;font-family:inherit;font-size:.78rem;font-weight:700;cursor:pointer;transition:.15s}
    .ppnb:hover{background:rgba(255,255,255,.2)}
    .ppcover{height:200px;position:relative;overflow:hidden;cursor:pointer}
    .pporb{position:absolute;border-radius:50%;pointer-events:none}
    .ppo1{width:320px;height:320px;top:-90px;right:-60px;background:radial-gradient(circle,rgba(103,232,249,.18),transparent 70%);animation:ppFloat 8s ease-in-out infinite}
    .ppo2{width:240px;height:240px;bottom:-90px;left:18%;background:radial-gradient(circle,rgba(251,191,36,.12),transparent 70%);animation:ppFloat 10s ease-in-out infinite 2s}
    .ppo3{width:180px;height:180px;top:20%;left:5%;background:radial-gradient(circle,rgba(124,58,237,.2),transparent 70%);animation:ppFloat 7s ease-in-out infinite 4s}
    .ppcovaov{position:absolute;inset:0;background:rgba(0,0,0,.5);display:none;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;color:#fff;font-size:.85rem;font-weight:700}
    .ppcover:hover .ppcovaov{display:flex}
    .pphead{background:#fff;border-bottom:2px solid #ede9fe;position:relative;animation:ppFadeUp .4s ease both}
    .ppavw{position:absolute;top:-50px;left:2rem;cursor:pointer}
    .ppavr{width:100px;height:100px;border-radius:50%;border:4px solid #fff;box-shadow:0 4px 24px rgba(124,58,237,.25);background:linear-gradient(135deg,#7c3aed,#3b0764);overflow:hidden;display:flex;align-items:center;justify-content:center;transition:.2s}
    .ppavr:hover{transform:scale(1.06)}
    .ppavhov{position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;flex-direction:column;gap:3px;color:#fff;font-size:.58rem;font-weight:700;text-align:center}
    .ppavw:hover .ppavhov{display:flex}
    .pphi{padding:1rem 1.5rem .85rem 10rem;display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:.75rem}
    .ppps{display:flex;gap:1.1rem;margin-top:.25rem;flex-wrap:wrap}
    .ppps span{font-size:.77rem;color:#6b7280}
    .ppps strong{color:#7c3aed;font-weight:800}
    .ppbp{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;padding:8px 18px;border-radius:10px;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.2s}
    .ppbp:hover{opacity:.9;transform:translateY(-1px)}
    .ppbg{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;padding:7px 16px;border-radius:10px;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.2s}
    .ppbg:hover{background:#ede9fe}
    .pptabs{background:#fff;display:flex;padding:0 1.5rem;border-bottom:2px solid #ede9fe;overflow-x:auto;scrollbar-width:none}
    .pptabs::-webkit-scrollbar{display:none}
    .pptab{padding:.72rem 1rem;font-size:.83rem;font-weight:700;color:#6b7280;border:none;background:none;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;font-family:inherit;display:flex;align-items:center;gap:5px;white-space:nowrap;transition:.15s;flex-shrink:0}
    .pptab:hover{color:#7c3aed}
    .pptab.on{color:#7c3aed;border-bottom-color:#7c3aed}
    .pptpriv{color:#9ca3af;font-size:.78rem}
    .pptpriv:hover{color:#7c3aed}
    .ppgrid{max-width:1440px;margin:1.1rem auto;padding:0 1rem;display:grid;grid-template-columns:250px 1fr 280px;gap:1rem;align-items:start}
    .pplp{display:flex;flex-direction:column;gap:.75rem;animation:ppFadeUp .5s .05s ease both}
    .pppc{background:#fff;border-radius:14px;border:1.5px solid #ede9fe;overflow:hidden}
    .ppphd{padding:.7rem .9rem;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:.5rem}
    .ppphdt{font-size:.8rem;font-weight:800;color:#1a0a3e;flex:1}
    .ppphdct{font-size:.65rem;font-weight:700;background:#ede9fe;color:#7c3aed;padding:2px 8px;border-radius:20px}
    .pppo{display:flex;align-items:center;gap:.6rem;padding:.45rem .55rem;border-radius:8px;border:1.5px solid #f3f4f6;cursor:pointer;transition:.15s;margin-bottom:.35rem}
    .pppo:hover{border-color:#c4b5fd;background:#faf5ff}
    .pppo.on{border-color:#7c3aed;background:#f4f0ff}
    .pppol{font-size:.76rem;font-weight:700;color:#374151;flex:1}
    .pppo.on .pppol{color:#7c3aed}
    .pppoc{font-size:.62rem;color:#9ca3af}
    .ppfr{display:flex;align-items:center;gap:.6rem;padding:.55rem .85rem;border-bottom:1px solid #f9fafb;transition:.15s}
    .ppfr:last-child{border-bottom:none}
    .ppfr:hover{background:#faf5ff}
    .ppfav{width:32px;height:32px;border-radius:50%;color:#fff;font-size:.65rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative}
    .ppfst{position:absolute;bottom:0;right:0;width:8px;height:8px;border-radius:50%;border:2px solid #fff}
    .ppfn{font-size:.75rem;font-weight:700;color:#1a0a3e}
    .ppftag{font-size:.58rem;font-weight:700;padding:1px 6px;border-radius:20px}
    .pptfam{background:#dbeafe;color:#1d4ed8}
    .pptfri{background:#d1fae5;color:#065f46}
    .ppfsub{font-size:.62rem;color:#9ca3af}
    .ppaddf{display:flex;align-items:center;gap:.5rem;width:100%;background:none;border:none;color:#7c3aed;font-family:inherit;font-size:.76rem;font-weight:700;cursor:pointer;padding:.6rem .85rem;border-top:1px solid #f3f4f6;transition:.15s}
    .ppaddf:hover{background:#f4f0ff}
    .ppcc{display:flex;flex-direction:column;gap:1rem;animation:ppFadeUp .45s ease both}
    .ppcw{background:#fff;border-radius:16px;border:1.5px solid #ede9fe;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,.07)}
    .ppctop{background:linear-gradient(90deg,#1a0a3e,#2d1266);padding:.65rem 1rem;display:flex;align-items:center;gap:.75rem}
    .pplpill{background:#ef4444;color:#fff;font-size:.62rem;font-weight:800;padding:3px 10px;border-radius:20px;display:flex;align-items:center;gap:4px;flex-shrink:0}
    .ppld{width:6px;height:6px;border-radius:50%;background:#fff;animation:ppBlink 1s infinite}
    .ppctt{color:rgba(255,255,255,.75);font-size:.78rem;font-weight:700;flex:1}
    .ppcus{display:flex}
    .ppcu{width:26px;height:26px;border-radius:50%;border:2.5px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:800;color:#fff}
    .ppsbar{background:linear-gradient(90deg,rgba(124,58,237,.1),rgba(251,191,36,.07));border-bottom:1px solid rgba(124,58,237,.12);padding:.45rem .9rem;display:flex;align-items:center;gap:.5rem;font-size:.7rem;color:#5b21b6;font-weight:700}
    .ppsdot{width:6px;height:6px;border-radius:50%;background:#7c3aed;animation:ppBlink .8s infinite;flex-shrink:0}
    .ppca{background:#fafafa;height:360px;position:relative;cursor:crosshair;overflow:hidden}
    .ppcv{position:absolute;inset:0;width:100%;height:100%}
    .ppch{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.6rem;pointer-events:none}
    .ppcht{font-size:.85rem;color:rgba(124,58,237,.3);font-weight:700;text-align:center;max-width:260px}
    .ppsticker{position:absolute;background:#fff;border-radius:10px;border:2px solid #7c3aed;box-shadow:0 4px 16px rgba(124,58,237,.2);padding:.3rem .45rem;cursor:move;display:flex;flex-direction:column;align-items:center;gap:2px;animation:ppDrop .4s cubic-bezier(.34,1.56,.64,1) both;user-select:none;min-width:75px}
    .ppstimg{width:58px;height:42px;object-fit:cover;border-radius:5px;display:block}
    .ppstname{font-size:.58rem;font-weight:700;color:#1a0a3e;text-align:center;max-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ppstprice{font-size:.65rem;font-weight:800;color:#7c3aed}
    .ppctb{background:linear-gradient(90deg,#1a0a3e,#2d1266);padding:.5rem .85rem;display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}
    .pptb{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8);padding:4px 11px;border-radius:7px;font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;transition:.15s;display:flex;align-items:center;gap:4px}
    .pptb:hover,.pptb.on{background:rgba(251,191,36,.2);border-color:#fbbf24;color:#fbbf24}
    .ppcd{width:18px;height:18px;border-radius:50%;cursor:pointer;transition:.15s;border:3px solid transparent;flex-shrink:0}
    .ppcd.on{border-color:#fff;transform:scale(1.2)}
    .ppws{background:#fff;border-radius:16px;border:1.5px solid #ede9fe;padding:1.1rem}
    .ppwt{font-size:.88rem;font-weight:800;color:#1a0a3e;margin-bottom:.85rem;display:flex;align-items:center;gap:.5rem}
    .ppwg{display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:.6rem}
    .ppwi{border:1.5px solid #ede9fe;border-radius:10px;overflow:hidden;cursor:pointer;transition:.22s;background:#fafafa;position:relative}
    .ppwi:hover{border-color:#7c3aed;transform:translateY(-2px);box-shadow:0 4px 14px rgba(124,58,237,.1)}
    .ppwi.new{border-color:#7c3aed;animation:ppDrop .4s cubic-bezier(.34,1.56,.64,1) both}
    .ppwith{height:72px;overflow:hidden}
    .ppwith img{width:100%;height:100%;object-fit:cover;display:block}
    .ppwiin{padding:.38rem .48rem}
    .ppwin{font-size:.65rem;font-weight:700;color:#1a0a3e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ppwip{font-size:.72rem;font-weight:800;color:#7c3aed}
    .ppwinb{position:absolute;top:4px;left:4px;background:#7c3aed;color:#fff;font-size:.52rem;font-weight:800;padding:1px 5px;border-radius:3px}
    .ppchp{background:#fff;border-radius:16px;border:1.5px solid #ede9fe;overflow:hidden;display:flex;flex-direction:column;position:sticky;top:68px;animation:ppFadeUp .5s .1s ease both;max-height:calc(100vh - 80px)}
    .ppchd{background:linear-gradient(90deg,#1a0a3e,#2d1266);padding:.7rem 1rem;display:flex;align-items:center;gap:.6rem}
    .ppchdt{color:#fff;font-size:.8rem;font-weight:700;flex:1}
    .ppchdot{width:8px;height:8px;border-radius:50%;background:#22c55e}
    .ppchw{padding:.42rem .72rem;border-bottom:1px solid #f3f4f6;display:flex;gap:.4rem;flex-wrap:wrap}
    .ppchu{display:flex;align-items:center;gap:.25rem;font-size:.62rem;color:#6b7280;font-weight:600}
    .ppcms{overflow-y:auto;padding:.65rem;display:flex;flex-direction:column;gap:.5rem;flex:1;min-height:220px}
    .ppmsg{display:flex;gap:.42rem;align-items:flex-start;animation:ppSlide .2s ease both}
    .ppmav{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.58rem;font-weight:800;color:#fff;flex-shrink:0}
    .ppbub{background:#f4f0ff;border-radius:3px 10px 10px 10px;padding:.42rem .6rem;max-width:185px}
    .ppmn{font-size:.6rem;font-weight:700;color:#7c3aed;margin-bottom:2px}
    .ppmt{font-size:.72rem;color:#374151;line-height:1.4}
    .ppmti{font-size:.58rem;color:#9ca3af;margin-top:2px}
    .ppmsg.me{flex-direction:row-reverse}
    .ppmsg.me .ppbub{background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:10px 3px 10px 10px}
    .ppmsg.me .ppmn{color:rgba(255,255,255,.7)}
    .ppmsg.me .ppmt{color:#fff}
    .ppmprod{display:flex;align-items:center;gap:.45rem;background:#fff;border:1.5px solid #ede9fe;border-radius:7px;padding:.35rem .45rem;margin-top:3px;cursor:pointer}
    .ppmpi{width:32px;height:25px;object-fit:cover;border-radius:4px;flex-shrink:0;display:block}
    .ppmpn{font-size:.58rem;font-weight:700;color:#1a0a3e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ppmpp{font-size:.62rem;font-weight:800;color:#7c3aed}
    .ppchi{padding:.58rem;border-top:1px solid #ede9fe;display:flex;gap:.4rem}
    .ppchi input{flex:1;border:1.5px solid #ede9fe;border-radius:9px;padding:7px 10px;font-family:inherit;font-size:.75rem;outline:none;color:#1a0a3e;transition:.15s}
    .ppchi input:focus{border-color:#7c3aed}
    .ppchi button{background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:9px;padding:7px 12px;font-family:inherit;font-size:.75rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:3px}
    .pptc{background:#fff;border-radius:16px;border:1.5px solid #ede9fe;padding:1.2rem;margin-bottom:.75rem;animation:ppFadeUp .3s ease both}
    .pptc h3{font-size:.95rem;font-weight:800;color:#1a0a3e;margin-bottom:.25rem}
    .pptc p{font-size:.78rem;color:#6b7280;margin-bottom:1rem}
    .ppfi{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:.62rem .9rem;font-family:inherit;font-size:.83rem;color:#1a0a3e;outline:none;transition:.15s;margin-bottom:.65rem;box-sizing:border-box}
    .ppfi:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.1)}
    .pppb{display:inline-flex;align-items:center;gap:.5rem;background:#fef3c7;color:#92400e;border-radius:9px;padding:.4rem .9rem;font-size:.75rem;font-weight:700;margin-bottom:.9rem;border:1px solid #fde68a}
    .ppdz{background:#fff5f5;border:1.5px solid #fecaca;border-radius:12px;padding:.9rem;margin-top:.9rem}
    .ppdz h4{font-size:.82rem;font-weight:800;color:#b91c1c;margin-bottom:.3rem}
    .ppbtnd{background:#fee2e2;color:#b91c1c;border:1.5px solid #fca5a5;border-radius:9px;padding:.55rem 1.1rem;font-family:inherit;font-size:.8rem;font-weight:700;cursor:pointer;margin-top:.5rem}
    .ppsr{display:flex;gap:.5rem;margin-bottom:.75rem}
    .ppsr input{flex:1;border:1.5px solid #ede9fe;border-radius:9px;padding:8px 12px;font-family:inherit;font-size:.8rem;color:#6b7280;outline:none}
    .ppcpb{background:#7c3aed;color:#fff;border:none;border-radius:9px;padding:8px 16px;font-family:inherit;font-size:.8rem;font-weight:700;cursor:pointer}
    .ppsbs{display:flex;gap:.5rem;flex-wrap:wrap}
    .ppsbb{flex:1;min-width:75px;border:1.5px solid #ede9fe;background:#f9fafb;border-radius:9px;padding:7px;font-family:inherit;font-size:.7rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;color:#374151;transition:.15s}
    .ppsbb:hover{background:#f4f0ff;border-color:#c4b5fd}
    @media(max-width:1050px){.ppgrid{grid-template-columns:1fr!important}}
    @media(max-width:700px){.pphi{padding:3.5rem 1rem .85rem!important;flex-direction:column;align-items:flex-start}}
  ;

  return (
    <div className="ppbody">
      <style>{S}</style>

      {/* NAV */}
      <nav className="ppnav">
        <Logo/>
        <div>
          <div style={{fontSize:'1rem',fontWeight:800,color:'#fff',letterSpacing:'-.5px'}}>DrawNBuy</div>
          <span style={{fontSize:'.5rem',color:'rgba(255,255,255,.45)',letterSpacing:'.1em',display:'block'}}>Draw it. Find it. Buy it.</span>
        </div>
        <div style={{flex:1}}/>
        <button className="ppnb" onClick={()=>navigate('/')}>Home</button>
        <button className="ppnb" onClick={()=>navigate('/')}>Canvas</button>
        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#fbbf24,#f59e0b)',color:'#3b0764',fontSize:'.75rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',border:'2.5px solid rgba(255,255,255,.4)',cursor:'pointer',overflow:'hidden'}}>
          {avatarSrc?<img src={avatarSrc} alt="av" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initials}
        </div>
      </nav>

      {/* COVER */}
      <div className="ppcover" onClick={()=>covInRef.current?.click()}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#3b0764 0%,#5b21b6 55%,#7c3aed 100%)',opacity:coverSrc?.3:1}}/>
        {coverSrc&&<img src={coverSrc} alt="cover" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>}
        <div className="pporb ppo1"/><div className="pporb ppo2"/><div className="pporb ppo3"/>
        <div className="ppcovaov"><IImg/><span>Upload cover photo</span></div>
        <input ref={covInRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleCovUpload}/>
        <div
          contentEditable suppressContentEditableWarning
          style={{position:'absolute',bottom:'12px',left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,.45)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'10px',padding:'6px 18px',color:'rgba(255,255,255,.85)',fontSize:'.8rem',fontWeight:600,whiteSpace:'nowrap',minWidth:'180px',textAlign:'center',outline:'none',cursor:'text'}}
          onClick={e=>e.stopPropagation()}
        >Click to add a message or quote...</div>
        <button style={{position:'absolute',bottom:'12px',right:'12px',background:'rgba(0,0,0,.4)',backdropFilter:'blur(6px)',border:'1px solid rgba(255,255,255,.2)',color:'#fff',borderRadius:'8px',padding:'5px 12px',fontFamily:'inherit',fontSize:'.72rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}} onClick={e=>{e.stopPropagation();covInRef.current?.click();}}>
          <IEditI/> Edit cover
        </button>
      </div>

      {/* HEAD */}
      <div className="pphead">
        <div className="ppavw" onClick={()=>avInRef.current?.click()}>
          <div className="ppavr">
            {avatarSrc?<img src={avatarSrc} alt="av" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{color:'#fff',fontSize:'2.4rem',fontWeight:800}}>{initials}</div>}
          </div>
          <div className="ppavhov"><ICam/><span style={{fontSize:'.56rem',marginTop:'2px'}}>Upload photo</span></div>
          <input ref={avInRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvUpload}/>
        </div>
        <div className="pphi">
          <div>
            <div style={{fontSize:'1.4rem',fontWeight:800,color:'#1a0a3e'}}>{editName}</div>
            <div className="ppps">
              <span><strong>12</strong> canvases</span>
              <span><strong>{wishlist.length}</strong> products</span>
              <span><strong>{friends.length}</strong> friends</span>
              <span><strong>{editLoc}</strong></span>
            </div>
          </div>
          <div style={{display:'flex',gap:'.6rem',flexShrink:0}}>
            <button className="ppbg" onClick={()=>setShareOpen(true)}><IShare/> Share Profile</button>
            <button className="ppbp" onClick={()=>setEditOpen(true)}><IEditI/> Edit Profile</button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="pptabs">
        {[{id:'canvas',label:'My Canvas',icon:<IPen/>},{id:'wishlist',label:'Wishlist',icon:<IHeart/>},{id:'notifs',label:'Notifications',icon:<IBell/>}].map(t=>(
          <button key={t.id} className={pptab${tab===t.id?' on':''}} onClick={()=>setTab(t.id)}>{t.icon}{t.label}</button>
        ))}
        <div style={{flex:1}}/>
        {[{id:'security',label:'Security'},{id:'data',label:'Your Data'}].map(t=>(
          <button key={t.id} className={pptab pptpriv${tab===t.id?' on':''}} onClick={()=>setTab(t.id)}><ILock/>{t.label}</button>
        ))}
      </div>

      {/* GRID */}
      <div className="ppgrid">

        {/* LEFT */}
        {tab==='canvas'&&(
          <div className="pplp">
            <div className="pppc">
              <div className="ppphd"><IEye/><div className="ppphdt">Who sees my live canvas?</div></div>
              <div style={{padding:'.7rem .9rem'}}>
                {[{v:'all',l:'Everyone',c:` people},{v:'family',l:'Family only',c:` people},{v:'friends',l:'Friends only',c:` people},{v:'custom',l:'Custom â€” pick people',c:null}].map(o=>(
                  <label key={o.v} className={pppo${privacy===o.v?' on':''}}>
                    <input type="radio" name="privacy" value={o.v} checked={privacy===o.v} onChange={()=>setPrivacy(o.v)} style={{accentColor:'#7c3aed',width:'14px',height:'14px',cursor:'pointer'}}/>
                    <div className="pppol">{o.l}</div>
                    {o.c&&<div className="pppoc">{o.c}</div>}
                  </label>
                ))}
                <div style={{fontSize:'.65rem',color:'#9ca3af',fontWeight:600,marginTop:'.3rem'}}>Toggle individuals below</div>
              </div>
            </div>
            <div className="pppc">
              <div className="ppphd"><IUsers/><div className="ppphdt">Friends & Family</div><div className="ppphdct">{friends.length}</div></div>
              {friends.map(f=>(
                <div key={f.id} className="ppfr">
                  <div className="ppfav" style={{background:f.col,color:f.col.includes('fbbf24')?'#3b0764':'#fff'}}>
                    {f.av}
                    <div className="ppfst" style={{background:f.online?'#22c55e':'#d1d5db'}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="ppfn">{f.name}</div>
                    <div style={{display:'flex',alignItems:'center',gap:'.3rem'}}>
                      <span className={ppftag ${f.rel==='Family'?'pptfam':'pptfri'}}>{f.rel}</span>
                      <span className="ppfsub">{f.online?'online':'offline'}</span>
                    </div>
                  </div>
                  <Toggle checked={f.canSee} onChange={()=>toggleFriendSee(f.id)}/>
                </div>
              ))}
              <button className="ppaddf" onClick={()=>setAddOpen(true)}><IPlus/> Add DrawNBuy user</button>
            </div>
          </div>
        )}

        {/* CENTER */}
        {tab==='canvas'&&(
          <div className="ppcc">
            <div className="ppcw">
              <div className="ppctop">
                <div className="pplpill"><div className="ppld"/> LIVE</div>
                <div className="ppctt">My Profile Canvas</div>
                <div className="ppcus">
                  {friends.filter(f=>f.online&&f.canSee).slice(0,4).map((f,i)=>(
                    <div key={f.id} className="ppcu" style={{background:'#7c3aed',marginLeft:i>0?'-7px':0}} title={f.name}>{f.av[0]}</div>
                  ))}
                </div>
              </div>
              {syncNote&&(
                <div className="ppsbar"><div className="ppsdot"/><span>{syncNote} â€” appears on all your active canvases</span></div>
              )}
              <div className="ppca" id="ppca">
                <canvas ref={cvRef} className="ppcv" onMouseDown={onCvDown} onMouseMove={onCvMove} onMouseUp={onCvUp} onMouseLeave={onCvUp} onTouchStart={onCvDown} onTouchMove={e=>{e.preventDefault();onCvMove(e);}} onTouchEnd={onCvUp}/>
                {!drawn&&stickers.length===0&&(
                  <div className="ppch">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" style={{opacity:.1}}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg>
                    <div className="ppcht">Draw your wishlist â€” or sync products from the main page!</div>
                  </div>
                )}
                {stickers.map(s=>(
                  <div key={s.sid} className="ppsticker" style={{left:`px,top:`px}}
                    onMouseDown={e=>{
                      const el=e.currentTarget,area=document.getElementById('ppca');
                      const ox=e.clientX-el.getBoundingClientRect().left,oy=e.clientY-el.getBoundingClientRect().top;
                      const mv=ev=>{const pr=area.getBoundingClientRect();setStickers(st=>st.map(x=>x.sid===s.sid?{...x,x:ev.clientX-pr.left-ox,y:ev.clientY-pr.top-oy}:x));};
                      const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
                      document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
                    }}>
                    <img className="ppstimg" src={s.img} alt={s.name}/>
                    <div className="ppstname">{s.name}</div>
                    <div className="ppstprice">{s.price}</div>
                    <div style={{position:'absolute',top:'-6px',right:'-6px',width:'15px',height:'15px',borderRadius:'50%',background:'#ef4444',color:'#fff',fontSize:'.6rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} onClick={()=>setStickers(st=>st.filter(x=>x.sid!==s.sid))}>x</div>
                  </div>
                ))}
              </div>
              <div className="ppctb">
                <button className={pptb${drawTool==='draw'?' on':''}} onClick={()=>{setDrawTool('draw');toolRef.current='draw';}}><IPen/> Draw</button>
                <button className={pptb${drawTool==='erase'?' on':''}} onClick={()=>{setDrawTool('erase');toolRef.current='erase';}}><IErase/> Erase</button>
                <button className="pptb" onClick={clearCanvas}><ITrash/> Clear</button>
                <div style={{flex:1}}/>
                {COLORS.map(c=>(
                  <div key={c} className={ppcd${drawColor===c?' on':''}} style={{background:c}} onClick={()=>{setDrawColor(c);setDrawTool('draw');colorRef.current=c;toolRef.current='draw';}}/>
                ))}
              </div>
            </div>
            <div className="ppws">
              <div className="ppwt"><IHeart/> Saved Wishlist <span style={{fontSize:'.68rem',color:'#9ca3af',fontWeight:600,marginLeft:'auto'}}>{wishlist.length} items</span></div>
              <div className="ppwg">
                {wishlist.map(p=>(
                  <div key={p.id} className={ppwi${p._new?' new':''}}>
                    {p._new&&<div className="ppwinb">New!</div>}
                    <div className="ppwith"><img src={p.img} alt={p.name} loading="lazy"/></div>
                    <div className="ppwiin"><div className="ppwin">{p.name}</div><div className="ppwip">{p.price}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CHAT */}
        {tab==='canvas'&&(
          <div className="ppchp">
            <div className="ppchd"><div className="ppchdot"/><div className="ppchdt">Canvas Chat</div></div>
            <div className="ppchw">
              {friends.filter(f=>f.online&&f.canSee).map(f=>(
                <div key={f.id} className="ppchu"><div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#22c55e'}}/>{f.name.split(' ')[0]}</div>
              ))}
            </div>
            <div className="ppcms" ref={msgsRef}>
              {msgs.map(m=>(
                <div key={m.id} className={ppmsg${m.me?' me':''}}>
                  <div className="ppmav" style={{background:m.col}}>{m.av}</div>
                  <div>
                    <div className="ppbub">
                      <div className="ppmn">{m.name}</div>
                      <div className="ppmt">{m.text}</div>
                      {m.prod&&(
                        <div className="ppmprod">
                          <img className="ppmpi" src={m.prod.img} alt={m.prod.name}/>
                          <div style={{flex:1,minWidth:0}}><div className="ppmpn">{m.prod.name}</div><div className="ppmpp">{m.prod.price}</div></div>
                        </div>
                      )}
                      <div className="ppmti">{m.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ppchi">
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Say something..."/>
              <button onClick={sendChat}><ISend/></button>
            </div>
          </div>
        )}

        {/* WISHLIST TAB */}
        {tab==='wishlist'&&(
          <div style={{gridColumn:'1/-1',animation:'ppFadeUp .3s ease both'}}>
            <div className="pptc"><h3>Your Wishlist</h3><p>All products saved across all your canvases</p>
              <div className="ppwg">{wishlist.map(p=>(
                <div key={p.id} className="ppwi">
                  <div className="ppwith"><img src={p.img} alt={p.name} loading="lazy"/></div>
                  <div className="ppwiin"><div className="ppwin">{p.name}</div><div className="ppwip">{p.price}</div></div>
                </div>
              ))}</div>
            </div>
          </div>
        )}

        {/* NOTIFS */}
        {tab==='notifs'&&(
          <div style={{gridColumn:'1/-1',animation:'ppFadeUp .3s ease both'}}>
            <div className="pptc"><h3>Notifications</h3><p>Your latest activity</p>
              {friends.filter(f=>f.online).slice(0,2).map(f=>(
                <div key={f.id} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.72rem',borderRadius:'10px',background:'#f4f0ff',border:'1.5px solid #ede9fe',marginBottom:'.5rem'}}>
                  <div style={{width:'34px',height:'34px',borderRadius:'50%',background:f.col,color:f.col.includes('fbbf24')?'#3b0764':'#fff',fontSize:'.72rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{f.av}</div>
                  <div style={{flex:1}}><div style={{fontSize:'.82rem',fontWeight:700,color:'#1a0a3e'}}>{f.name} liked your canvas</div><div style={{fontSize:'.7rem',color:'#9ca3af'}}>Just now</div></div>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#7c3aed',flexShrink:0}}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECURITY */}
        {tab==='security'&&(
          <div style={{gridColumn:'1/-1',animation:'ppFadeUp .3s ease both'}}>
            <div className="pptc" style={{maxWidth:'500px'}}>
              <div className="pppb"><ILock/> Only you can see this</div>
              <h3>Security</h3><p>Manage your password and account security</p>
              <input type="password" className="ppfi" placeholder="Current password"/>
              <input type="password" className="ppfi" placeholder="New password"/>
              <input type="password" className="ppfi" placeholder="Confirm new password"/>
              <button className="ppbp" style={{width:'auto'}}>Update Password</button>
            </div>
          </div>
        )}

        {/* DATA */}
        {tab==='data'&&(
          <div style={{gridColumn:'1/-1',animation:'ppFadeUp .3s ease both'}}>
            <div className="pptc" style={{maxWidth:'500px'}}>
              <div className="pppb"><ILock/> Only you can see this</div>
              <h3>Your Data</h3><p>GDPR â€” you own and control all your data</p>
              <button className="ppbg" style={{width:'100%',justifyContent:'center',marginBottom:'.6rem'}}><IDown/> Download my data</button>
              <div className="ppdz">
                <h4>Danger Zone</h4>
                <p style={{fontSize:'.75rem',color:'#6b7280',marginBottom:'.5rem'}}>This action cannot be undone.</p>
                <button className="ppbtnd" onClick={()=>{logout();navigate('/');}}>Delete my account</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* SHARE MODAL */}
      <Modal open={shareOpen} onClose={()=>setShareOpen(false)} title="Share Your Profile" subtitle="Let friends see your canvas & wishlist">
        <div className="ppsr">
          <input type="text" value="drawnbuy.com/u/asad" readOnly/>
          <button className="ppcpb" onClick={copyLink}>{copied?'Copied!':'Copy'}</button>
        </div>
        <div className="ppsbs">
          <button className="ppsbb"><svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.932-1.408A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2z"/></svg>WhatsApp</button>
          <button className="ppsbb"><svg width="13" height="13" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>Facebook</button>
          <button className="ppsbb"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>X / Twitter</button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={()=>setEditOpen(false)} title="Edit Profile" subtitle="Update your public information" width={460}>
        {[{l:'Display Name',v:editName,s:setEditName,t:'text'},{l:'Email',v:editEmail,s:setEditEmail,t:'email'},{l:'Location',v:editLoc,s:setEditLoc,t:'text'}].map(f=>(
          <div key={f.l} style={{marginBottom:'.65rem'}}>
            <label style={{fontSize:'.78rem',fontWeight:700,color:'#374151',display:'block',marginBottom:'.28rem'}}>{f.l}</label>
            <input className="ppfi" style={{marginBottom:0}} type={f.t} value={f.v} onChange={e=>f.s(e.target.value)}/>
          </div>
        ))}
        <div style={{marginBottom:'.9rem'}}>
          <label style={{fontSize:'.78rem',fontWeight:700,color:'#374151',display:'block',marginBottom:'.28rem'}}>Bio</label>
          <textarea className="ppfi" style={{marginBottom:0,resize:'vertical'}} rows={2} value={editBio} onChange={e=>setEditBio(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:'.6rem',justifyContent:'flex-end'}}>
          <button className="ppbg" onClick={()=>setEditOpen(false)}>Cancel</button>
          <button className="ppbp" onClick={()=>setEditOpen(false)}>Save Changes</button>
        </div>
      </Modal>

      {/* ADD FRIEND MODAL */}
      <Modal open={addOpen} onClose={()=>{setAddOpen(false);setUserSearch('');}} title="Add DrawNBuy User" subtitle="Search any user to connect">
        <input className="ppfi" placeholder="Search by name or @handle..." value={userSearch} onChange={e=>setUserSearch(e.target.value)} autoFocus/>
        {userSearch&&(
          <div>
            {filteredUsers.length>0?filteredUsers.map(u=>(
              <div key={u.id} style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.6rem',borderRadius:'9px',border:'1.5px solid #f3f4f6',background:'#fafafa',marginBottom:'.4rem'}}>
                <div style={{width:'34px',height:'34px',borderRadius:'50%',background:u.col,color:'#fff',fontSize:'.68rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{u.av}</div>
                <div style={{flex:1}}><div style={{fontSize:'.83rem',fontWeight:700,color:'#1a0a3e'}}>{u.name}</div><div style={{fontSize:'.68rem',color:'#9ca3af'}}>{u.handle}</div></div>
                <button style={{background:'#7c3aed',color:'#fff',border:'none',borderRadius:'8px',padding:'5px 13px',fontFamily:'inherit',fontSize:'.72rem',fontWeight:700,cursor:'pointer'}} onClick={()=>addUser(u)}>Add</button>
              </div>
            )):<div style={{fontSize:'.78rem',color:'#9ca3af',padding:'.5rem'}}>No users found</div>}
          </div>
        )}
      </Modal>

    </div>
  );
}
