import { useState, useEffect, useRef } from 'react';
import { HERO_ADS } from '../data';
import { useProductDrop } from '../hooks/useProductDrop';
import { useSocket } from '../hooks/useSocket';
import CanvasOverlayLayer from './CanvasOverlayLayer';
import { useWishlistStore, useUIStore } from '../store';

function MiniCanvas() {
  const canvasRef = useRef(null);
  const heroContainerRef = useRef(null);
  const { sendProductDrop } = useSocket();
  const { onDragOver: heroDragOver, onDrop: heroDrop } = useProductDrop('hero-canvas', heroContainerRef, ['main-collab'], sendProductDrop);
  const [tool, setTool] = useState('draw');
  const [color, setColor] = useState('#7c3aed');
  const drawingRef = useRef(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const lastPos = useRef(null);

  const colors = ['#7c3aed', '#fbbf24', '#67e8f9', '#ef4444', '#22c55e', '#000'];

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    drawingRef.current = true;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
  };

  const doDraw = (e) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    if (tool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.clearRect(pos.x - 10, pos.y - 10, 20, 20);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
    setHasDrawing(true);
  };

  const endDraw = () => { drawingRef.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,.07)', border: '2px solid rgba(251,191,36,.3)', borderRadius: '18px', overflow: 'hidden' }}>
      {/* Canvas top bar */}
      <div style={{ background: 'rgba(0,0,0,.3)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 9px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', animation: 'blink 1s infinite', display: 'inline-block' }} />
          LIVE
        </span>
        <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '12px', fontWeight: '600' }}>Your Canvas</span>
        <div style={{ display: 'flex' }}>
          {['A','M','J'].map((l, i) => (
            <div key={i} style={{
              width: '25px', height: '25px', borderRadius: '50%', marginLeft: i > 0 ? '-7px' : 0,
              border: '2px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#fff',
              background: ['#7c3aed','#fbbf24','#22c55e'][i],
            }}>{l}</div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div ref={heroContainerRef} style={{ background: '#fff', height: '190px', position: 'relative', cursor: tool === 'erase' ? 'cell' : 'crosshair' }}
        onDragOver={heroDragOver}
        onDrop={heroDrop}>
        <div
          style={{ position: 'relative', width: '100%', height: '100%' }}
        >
          <canvas
          ref={canvasRef}
          width={300}
          height={190}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onMouseDown={startDraw}
          onMouseMove={doDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={doDraw}
          onTouchEnd={endDraw}
        />
          <CanvasOverlayLayer canvasId="hero-canvas" />
        </div>
        {!hasDrawing && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: '12px', color: 'rgba(124,58,237,.25)', fontWeight: '600' }}>✏️ Click to draw!</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ background: 'rgba(0,0,0,.22)', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
        {[['draw','✏️ Draw'],['erase','🧹 Erase']].map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            style={{
              background: tool === t ? 'rgba(251,191,36,.22)' : 'rgba(255,255,255,.1)',
              border: `1px solid ${tool === t ? '#fbbf24' : 'rgba(255,255,255,.15)'}`,
              color: tool === t ? '#fbbf24' : 'rgba(255,255,255,.8)',
              borderRadius: '7px', padding: '4px 9px', fontSize: '11px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >{label}</button>
        ))}
        <button
          onClick={clearCanvas}
          style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.8)', borderRadius: '7px', padding: '4px 9px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
        >🗑 Clear</button>
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto', alignItems: 'center' }}>
          {colors.map(c => (
            <div
              key={c}
              onClick={() => { setColor(c); setTool('draw'); }}
              style={{
                width: '17px', height: '17px', borderRadius: '50%', background: c, cursor: 'pointer',
                border: `2.5px solid ${color === c ? '#fff' : 'transparent'}`,
                transform: color === c ? 'scale(1.2)' : 'none', transition: '.15s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroAdCard({ ad, onDismiss }) {
  const wishAdd  = useWishlistStore(s => s.addItem);
  const wishHas  = useWishlistStore(s => s.hasItem);
  const addToast = useUIStore(s => s.addToast);
  const isWished = wishHas(ad.name);

  const handleWish = (e) => {
    e.stopPropagation();
    const added = wishAdd({ id: ad.name, name: ad.name, price: ad.price, img: ad.img, url: ad.url });
    addToast(added ? `♡ "${ad.name}" saved to wishlist!` : 'Already in wishlist', added ? 'success' : 'info');
  };

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('application/drawnbuy-product', JSON.stringify({ name: ad.name, price: ad.price, img: ad.img, url: ad.url }));
        e.dataTransfer.effectAllowed = 'copy';
      }}
      style={{
        background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.15)',
        borderRadius: '12px', overflow: 'hidden', cursor: 'grab', transition: '.2s',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; e.currentTarget.style.transform = 'none'; }}
      onClick={() => window.open(ad.url, '_blank', 'noopener,noreferrer')}
    >
      <button
        onClick={e => { e.stopPropagation(); onDismiss(); }}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: '4px', right: '4px',
          background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%',
          width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit', lineHeight: 1, zIndex: 2,
        }}
      >×</button>
      <button
        onClick={handleWish}
        aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        style={{
          position: 'absolute', top: '4px', left: '4px',
          background: 'rgba(0,0,0,0.4)', color: isWished ? '#ef4444' : '#fff', border: 'none', borderRadius: '50%',
          width: '20px', height: '20px', cursor: 'pointer', fontSize: '11px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit', lineHeight: 1, zIndex: 2,
        }}
      >{isWished ? '♥' : '♡'}</button>
      <img src={ad.img} alt={ad.name} width="155" height="56" style={{ width: '100%', height: '56px', objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: '.35rem .5rem' }}>
        <div style={{ fontSize: '.67rem', fontWeight: '700', color: '#fff', lineHeight: 1.3 }}>{ad.name}</div>
        <div style={{ fontSize: '.76rem', fontWeight: '800', color: '#fbbf24' }}>{ad.price}</div>
      </div>
      <button
        style={{
          width: '100%', background: 'rgba(251,191,36,.18)', border: '1px solid rgba(251,191,36,.3)',
          color: '#fbbf24', padding: '4px', fontSize: '.6rem', fontWeight: '800',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
        onClick={e => { e.stopPropagation(); window.open(ad.url, '_blank', 'noopener,noreferrer'); }}
      >Shop Now →</button>
    </div>
  );
}

export default function Hero({ onShare }) {
  const [lIdx, setLIdx] = useState(0);
  const [rIdx, setRIdx] = useState(4);
  const [cIdx, setCIdx] = useState(8);
  const [tick, setTick] = useState(0);
  const [dismissed, setDismissed] = useState(new Set());

  const dismiss = name => setDismissed(d => new Set([...d, name]));

  const wishAdd  = useWishlistStore(s => s.addItem);
  const wishHas  = useWishlistStore(s => s.hasItem);
  const addToast = useUIStore(s => s.addToast);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => {
        const next = t + 1;
        if (next >= 16) {
          setLIdx(i => (i + 4) % HERO_ADS.length);
          setRIdx(i => (i + 4) % HERO_ADS.length);
          setCIdx(i => (i + 2) % HERO_ADS.length);
          return 0;
        }
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const leftAds  = [0,1,2,3].map(i => HERO_ADS[(lIdx + i) % HERO_ADS.length]);
  const rightAds = [0,1,2,3].map(i => HERO_ADS[(rIdx + i) % HERO_ADS.length]);
  const centerAds= [0,1].map(i => HERO_ADS[(cIdx + i) % HERO_ADS.length]);

  return (
    <div style={{
      background: 'linear-gradient(140deg,#3b0764 0%,#5b21b6 50%,#7c3aed 100%)',
      padding: '1rem 2rem .85rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)} }
        @keyframes heroTitleIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        .hero-orb { position:absolute; border-radius:50%; pointer-events:none; }
        .ho1 { top:-80px; right:-40px; width:380px; height:380px; background:radial-gradient(circle,rgba(103,232,249,.12),transparent 70%); animation:orbFloat 8s ease-in-out infinite; }
        .ho2 { bottom:-100px; left:15%; width:300px; height:300px; background:radial-gradient(circle,rgba(251,191,36,.08),transparent 70%); animation:orbFloat 10s ease-in-out infinite 2s; }
        .ho3 { top:30%; left:40%; width:200px; height:200px; background:radial-gradient(circle,rgba(124,58,237,.15),transparent 70%); animation:orbFloat 7s ease-in-out infinite 4s; }
        .hero-inner {
          max-width:1500px; margin:0 auto;
          display:grid;
          grid-template-columns: 155px 1fr 140px 370px 155px;
          gap:1.2rem;
          align-items:start;
          position:relative; z-index:1;
        }
        .hero-tag {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(103,232,249,.12); border:1px solid rgba(103,232,249,.3);
          color:#67e8f9; padding:5px 14px; border-radius:20px; font-size:11px;
          font-weight:700; letter-spacing:.06em; margin-bottom:.4rem;
        }
        .hero h1 {
          font-size:clamp(1.9rem,3.2vw,3rem); font-weight:800; color:#fff;
          line-height:1.1; letter-spacing:-1.5px; margin-bottom:.6rem;
          animation:heroTitleIn .8s cubic-bezier(.34,1.56,.64,1) both;
        }
        .hc { color:#67e8f9; } .hg { color:#fbbf24; }
        .hero-sub {
          color:rgba(255,255,255,.72); font-size:14px; line-height:1.6;
          max-width:480px; margin-bottom:.8rem;
          animation:heroTitleIn .8s .15s cubic-bezier(.34,1.56,.64,1) both;
        }
        .hero-btns { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:.6rem; animation:heroTitleIn .8s .3s cubic-bezier(.34,1.56,.64,1) both; }
        .btn-hp {
          background:#fbbf24; color:#3b0764; border:none; padding:12px 24px; border-radius:10px;
          font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:800; cursor:pointer;
          box-shadow:0 4px 20px rgba(251,191,36,.4); transition:.2s;
        }
        .btn-hp:hover { background:#d97706; transform:translateY(-2px); }
        .btn-hs {
          background:rgba(255,255,255,.08); color:#fff; border:1.5px solid rgba(255,255,255,.35);
          padding:11px 22px; border-radius:10px; font-family:'Space Grotesk',sans-serif;
          font-size:14px; font-weight:700; cursor:pointer; transition:.15s;
        }
        .btn-hs:hover { border-color:#67e8f9; color:#67e8f9; }
        .hero-stats { display:flex; gap:1.25rem; }
        .hstat-num { font-size:1rem; font-weight:800; color:#fbbf24; }
        .hstat-lbl { font-size:10px; color:rgba(255,255,255,.5); }
        .hero-ads { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; align-content:start; }
        .hero-ads-center { display:flex; flex-direction:column; gap:.5rem; align-self:center; }
        .hero-timer { height:2px; background:rgba(255,255,255,.12); border-radius:2px; overflow:hidden; margin-top:4px; }
        .hero-timer-bar { height:100%; background:#fbbf24; border-radius:2px; transition:width .5s linear; }
        @media(max-width:1400px) {
          .hero-inner { grid-template-columns:1fr 360px !important; }
          .hero-ads-left, .hero-ads-right, .hero-ads-center { display:none !important; }
        }
        @media(max-width:768px) {
          .hero-inner { grid-template-columns:1fr !important; }
          .hero-product-col { max-height:320px; overflow:hidden; }
        }
      `}</style>

      {/* Orbs */}
      <div className="hero-orb ho1" />
      <div className="hero-orb ho2" />
      <div className="hero-orb ho3" />

      <div className="hero-inner">
        {/* Col 1: Left Ads */}
        <div className="hero-ads-left">
          <div className="hero-ads">
            {leftAds.filter(ad => !dismissed.has(ad.name)).map((ad, i) => (
              <HeroAdCard key={ad.name + i} ad={ad} onDismiss={() => dismiss(ad.name)} />
            ))}
          </div>
          <div className="hero-timer">
            <div className="hero-timer-bar" style={{ width: `${(tick / 16) * 100}%` }} />
          </div>
        </div>

        {/* Col 2: Hero Text */}
        <div className="hero">
          <div className="hero-tag">🌍 World&apos;s First Social Shopping Canvas</div>
          <h1>
            Draw it.<br/>
            <span className="hc">Find it.</span><br/>
            <span className="hg">Buy it.</span>
          </h1>
          <p className="hero-sub">
            Sketch your wishlist on a real-time collaborative canvas,
            drag real products onto it, and shop with friends — all in one place.
          </p>
          <div className="hero-btns">
            <button className="btn-hp">🎨 Start Drawing Free</button>
            <button className="btn-hs" onClick={onShare} style={{border:'1.5px solid #fbbf24'}}>Invite Friends</button>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hstat-num">10K+</div>
              <div className="hstat-lbl">Active Canvases</div>
            </div>
            <div>
              <div className="hstat-num">500K+</div>
              <div className="hstat-lbl">Products</div>
            </div>
            <div>
              <div className="hstat-num">50K+</div>
              <div className="hstat-lbl">Happy Shoppers</div>
            </div>
          </div>
        </div>

        {/* Col 3: Center Ads */}
        <div className="hero-ads-center">
          {centerAds.filter(ad => !dismissed.has(ad.name)).map((ad, i) => {
            const isWished = wishHas(ad.name);
            return (
              <div
                key={ad.name + i}
                style={{ background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                onClick={() => window.open(ad.url, '_blank', 'noopener,noreferrer')}
              >
                <button
                  onClick={e => { e.stopPropagation(); dismiss(ad.name); }}
                  aria-label="Dismiss"
                  style={{
                    position: 'absolute', top: '4px', right: '4px',
                    background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%',
                    width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit', lineHeight: 1, zIndex: 2,
                  }}
                >×</button>
                <button
                  onClick={e => { e.stopPropagation(); const added = wishAdd({ id: ad.name, name: ad.name, price: ad.price, img: ad.img, url: ad.url }); addToast(added ? `♡ "${ad.name}" saved to wishlist!` : 'Already in wishlist', added ? 'success' : 'info'); }}
                  aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={{
                    position: 'absolute', top: '4px', left: '4px',
                    background: 'rgba(0,0,0,0.4)', color: isWished ? '#ef4444' : '#fff', border: 'none', borderRadius: '50%',
                    width: '20px', height: '20px', cursor: 'pointer', fontSize: '11px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit', lineHeight: 1, zIndex: 2,
                  }}
                >{isWished ? '♥' : '♡'}</button>
                <img src={ad.img} alt={ad.name} width="140" height="68" style={{ width: '100%', height: '68px', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '.35rem .5rem' }}>
                  <div style={{ fontSize: '.65rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ad.name}</div>
                  <div style={{ fontSize: '.75rem', fontWeight: '800', color: '#fbbf24' }}>{ad.price}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Col 4: Mini Canvas */}
        <div className="hero-product-col">
          <MiniCanvas />
        </div>

        {/* Col 5: Right Ads */}
        <div className="hero-ads-right hero-product-col">
          <div className="hero-ads">
            {rightAds.filter(ad => !dismissed.has(ad.name)).map((ad, i) => (
              <HeroAdCard key={ad.name + i} ad={ad} onDismiss={() => dismiss(ad.name)} />
            ))}
          </div>
          <div className="hero-timer">
            <div className="hero-timer-bar" style={{ width: `${(tick / 16) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
