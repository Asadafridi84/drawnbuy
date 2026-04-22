const fs = require('fs');
let s = fs.readFileSync('src/pages/ProfilePage.jsx', 'utf8');

const OLD = `        {tab==='whiteboard' && (
          <div className="pc">
            <div className="st">Your Whiteboard</div>
            <div className="ss">Draw your wishlist, plan your shopping, share with friends.</div>
            <div className="wb-tools">
              {WB_COLORS.map(c=>(
                <div key={c} className={'wb-color'+(wbColor===c?' active':'')} style={{background:c}} onClick={()=>setWbColor(c)}/>
              ))}
              <input type="range" min={1} max={20} value={wbSize} onChange={e=>setWbSize(+e.target.value)} style={{width:'80px',accentColor:'#7c3aed'}}/>
              <span style={{fontSize:'.75rem',color:'#6b7280'}}>Size {wbSize}</span>
              <button className="wb-btn" onClick={wbClear}>\uD83D\uDDD1 Clear</button>
              <button className="wb-btn" onClick={wbSave}>\uD83D\uDCBE Save PNG</button>
              <button className="wb-btn" onClick={()=>navigate('/canvas')}>\uD83D\uDE80 Open Full Canvas</button>
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
        )}`;

const NEW = `        {tab==='whiteboard' && (
          <div style={{display:'grid',gridTemplateColumns:'220px 1fr 260px',gap:'1rem',alignItems:'start'}}>

            {/* LEFT */}
            <div>
              <div className="pc" style={{marginBottom:'1rem'}}>
                <div className="st" style={{fontSize:'.85rem',marginBottom:'.75rem'}}>\uD83D\uDC41 Who sees my canvas?</div>
                {[['Everyone','8 people'],['Friends only','5 people'],['Family only','3 people']].map(([l,c],i)=>(
                  <label key={i} style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.5rem',borderRadius:'8px',cursor:'pointer',marginBottom:'.3rem',background:i===0?'#f4f0ff':'transparent'}}>
                    <input type="radio" name="canvPriv" defaultChecked={i===0} style={{accentColor:'#7c3aed'}}/>
                    <span style={{fontSize:'.8rem',fontWeight:700,color:'#1a0a3e',flex:1}}>{l}</span>
                    <span style={{fontSize:'.7rem',color:'#9ca3af'}}>{c}</span>
                  </label>
                ))}
              </div>
              <div className="pc">
                <div className="st" style={{fontSize:'.85rem',marginBottom:'.75rem'}}>\uD83D\uDC65 Friends &amp; Family</div>
                {[['AL','Anna','#7c3aed','Family',true,true],
                  ['ME','Maja','#22c55e','Friend',true,true],
                  ['EJ','Erik','#fbbf24','Family',false,true],
                  ['SB','Sofia','#ef4444','Friend',false,false],
                  ['LH','Lars','#0ea5e9','Friend',true,true]].map(([av,name,bg,tag,online,checked])=>(
                  <div key={name} style={{display:'flex',alignItems:'center',gap:'.6rem',marginBottom:'.6rem'}}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:bg,color:'#fff',fontSize:'.72rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative'}}>
                      {av}<div style={{position:'absolute',bottom:0,right:0,width:9,height:9,borderRadius:'50%',background:online?'#22c55e':'#d1d5db',border:'2px solid #fff'}}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'.78rem',fontWeight:700,color:'#1a0a3e'}}>{name}</div>
                      <span style={{fontSize:'.65rem',fontWeight:700,padding:'1px 6px',borderRadius:20,background:tag==='Family'?'#dbeafe':'#d1fae5',color:tag==='Family'?'#1d4ed8':'#065f46'}}>{tag}</span>
                    </div>
                    <label className="tog"><input type="checkbox" defaultChecked={checked}/><div className="tsl"/></label>
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER: Canvas */}
            <div className="pc" style={{padding:'1rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'.6rem',marginBottom:'.75rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'.4rem',background:'#ef4444',color:'#fff',fontSize:'.65rem',fontWeight:800,padding:'3px 9px',borderRadius:20}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:'#fff',opacity:.85}}/>LIVE
                </div>
                <span style={{fontSize:'.9rem',fontWeight:800,color:'#1a0a3e',flex:1}}>My Profile Canvas</span>
                <div style={{display:'flex'}}>
                  {[['#7c3aed','A'],['#fbbf24','M'],['#22c55e','J']].map(([bg,l])=>(
                    <div key={l} style={{width:26,height:26,borderRadius:'50%',background:bg,color:bg==='#fbbf24'?'#3b0764':'#fff',fontSize:'.7rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #fff',marginLeft:'-6px'}}>{l}</div>
                  ))}
                </div>
              </div>
              <div className="wb-tools">
                {WB_COLORS.map(c=>(<div key={c} className={'wb-color'+(wbColor===c?' active':'')} style={{background:c}} onClick={()=>setWbColor(c)}/>))}
                <input type="range" min={1} max={20} value={wbSize} onChange={e=>setWbSize(+e.target.value)} style={{width:'70px',accentColor:'#7c3aed'}}/>
                <button className="wb-btn" onClick={wbClear}>\uD83D\uDDD1 Clear</button>
                <button className="wb-btn" onClick={wbSave}>\uD83D\uDCBE Save</button>
                <button className="wb-btn" onClick={()=>navigate('/canvas')}>\uD83D\uDE80 Full Canvas</button>
              </div>
              <canvas ref={canvasRef} className="wb-canvas" width={900} height={380}
                onMouseDown={wbStart} onMouseMove={wbMove} onMouseUp={wbEnd} onMouseLeave={wbEnd}
                onTouchStart={wbStart} onTouchMove={wbMove} onTouchEnd={wbEnd}/>
            </div>

            {/* RIGHT: Chat */}
            <div style={{background:'linear-gradient(135deg,#1e1b4b,#4c1d95)',borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',minHeight:500}}>
              <div style={{padding:'1rem',display:'flex',alignItems:'center',gap:'.5rem',borderBottom:'1px solid rgba(255,255,255,.1)'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e'}}/>
                <span style={{color:'#fff',fontWeight:800,fontSize:'.88rem',flex:1}}>Canvas Chat</span>
              </div>
              <div style={{display:'flex',gap:'.5rem',padding:'.6rem 1rem',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                {[['#22c55e','Maja'],['#22c55e','Lars'],['#d1d5db','Erik']].map(([bg,n])=>(
                  <div key={n} style={{display:'flex',alignItems:'center',gap:'.3rem'}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:bg}}/>
                    <span style={{color:'rgba(255,255,255,.7)',fontSize:'.72rem'}}>{n}</span>
                  </div>
                ))}
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:'.75rem'}}>
                {[{av:'M',bg:'#22c55e',name:'Maja',text:'Love your canvas! \uD83D\uDE0D',time:'14:20',me:false},
                  {av:'L',bg:'#0ea5e9',name:'Lars',text:'Added this from your wishlist!',time:'14:21',me:false},
                  {av:'A',bg:'#7c3aed',name:'You',text:'Yes! Amazing \uD83D\uDECB\uFE0F',time:'14:22',me:true}
                ].map((m,i)=>(
                  <div key={i} style={{display:'flex',gap:'.5rem',flexDirection:m.me?'row-reverse':'row',alignItems:'flex-end'}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:m.bg,color:'#fff',fontSize:'.7rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{m.av}</div>
                    <div style={{background:m.me?'linear-gradient(90deg,#7c3aed,#5b21b6)':'rgba(255,255,255,.1)',borderRadius:12,padding:'.5rem .75rem',maxWidth:'75%'}}>
                      {!m.me&&<div style={{fontSize:'.65rem',color:'rgba(255,255,255,.5)',marginBottom:'.15rem'}}>{m.name}</div>}
                      <div style={{fontSize:'.82rem',color:'#fff'}}>{m.text}</div>
                      <div style={{fontSize:'.62rem',color:'rgba(255,255,255,.4)',marginTop:'.2rem',textAlign:m.me?'right':'left'}}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{padding:'.75rem',borderTop:'1px solid rgba(255,255,255,.1)',display:'flex',gap:'.5rem'}}>
                <input placeholder="Say something..." style={{flex:1,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',borderRadius:10,padding:'.5rem .75rem',color:'#fff',fontSize:'.82rem',outline:'none'}}/>
                <button style={{background:'linear-gradient(90deg,#7c3aed,#5b21b6)',border:'none',borderRadius:10,width:38,height:38,color:'#fff',cursor:'pointer',fontSize:'.9rem'}}>\u27A4</button>
              </div>
            </div>

          </div>
        )}`;

if (!s.includes('Your Whiteboard')) {
  console.log('Already patched or pattern not found!');
  process.exit(0);
}

s = s.replace(OLD, NEW);
fs.writeFileSync('src/pages/ProfilePage.jsx', s);
console.log('Done!');
