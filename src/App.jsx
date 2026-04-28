// DrawNBuy v2.1 — canvas system
import { useState, useEffect } from 'react';
import { Routes, Route, useParams, useLocation } from 'react-router-dom';

// Shell components (always available)
import Topbar             from './components/Topbar';
import Navbar             from './components/Navbar';
import ToastContainer     from './components/ToastContainer';
import ShareModal         from './components/ShareModal';
import { useCartStore }   from './store';

// Homepage sections
import AdStrip            from './components/AdStrip';
import Hero               from './components/Hero';
import CategoryBar        from './components/CategoryBar';
import CollabCanvas       from './components/CollabCanvas';
import ProductSearchPanel from './components/ProductSearchPanel';
import DragStrip          from './components/DragStrip';
import DealsGrid          from './components/DealsGrid';
import CategoriesGrid     from './components/CategoriesGrid';
import Sponsors           from './components/Sponsors';
import HowItWorks         from './components/HowItWorks';
import Footer             from './components/Footer';
import CategoryPage       from './components/CategoryPage';
import { CATS }            from './data';
import MiniFloatingCanvas from './components/MiniFloatingCanvas';

// Pages (routed)
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import ProfilePage        from './pages/ProfilePage';
import CanvasesPage       from './pages/CanvasesPage';
import NotFoundPage       from './pages/NotFoundPage';
import ProtectedRoute     from './components/ProtectedRoute';
import PrivacyPage        from './pages/PrivacyPage';
import TermsPage          from './pages/TermsPage';
import CookiesPage        from './pages/CookiesPage';

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Space Grotesk', sans-serif; background: #f4f0ff; color: #1a0a3e; font-size: 15px; line-height: 1.5; overflow-x: hidden; }
  :root {
    --p: #7c3aed; --pd: #5b21b6; --pdd: #3b0764;
    --gold: #fbbf24; --goldd: #d97706;
    --cyan: #67e8f9; --green: #22c55e; --red: #ef4444;
    --bg: #f4f0ff; --card: #fff;
    --text: #1a0a3e; --muted: #6b7280; --subtle: #9ca3af;
    --border: #e5e7eb; --borderl: #ede9fe;
    --radius: 14px;
    --shadow: 0 2px 12px rgba(124,58,237,.08);
    --shadow-h: 0 8px 32px rgba(124,58,237,.18);
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,58,237,.3); border-radius: 3px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;



// Scrolls to hash anchor after navigation (e.g. /#dealsAnchor)
function HashScroller() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
      }
    }
  }, [location]);
  return null;
}

function CategoryRouteWrapper({ onShare, cartCount }) {
  const { slug } = useParams();
  const cat = CATS.find(c => c.slug === slug) || { name: slug.replace(/-/g,' '), slug, img:'', count:'', emoji:'' };
  return (
    <>
      <Topbar />
      <Navbar onShare={onShare} cartCount={cartCount} />
      <div style={{paddingTop:'1rem'}}>
        <CategoryPage cat={cat} onClose={null} />
      </div>
    </>
  );
}

// Layout wrapper used by pages that need Topbar + Navbar (Profile, Canvases)
function PageShell({ children, onShare, cartCount }) {
  return (
    <>
      <Topbar />
      <Navbar onShare={onShare} cartCount={cartCount} />
      {children}
    </>
  );
}


export default function App() {
  const [shareOpen, setShareOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const cartCount = useCartStore(s => s.items.reduce((sum, i) => sum + i.qty, 0));

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <HashScroller />

      {/* ── Global overlays — rendered on EVERY page ────────── */}
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      <MiniFloatingCanvas />
      <ToastContainer />

      <Routes>
        {/* ── Homepage ─────────────────────────────────────── */}
        <Route path="/" element={
          <>
            <Topbar />
            <Navbar onShare={() => setShareOpen(true)} cartCount={cartCount} onCatClick={setActiveCat} />
            <AdStrip />
            <Hero onShare={() => setShareOpen(true)} />
            <CategoryBar />
            <CollabCanvas onShare={() => setShareOpen(true)} />
            <ProductSearchPanel />
            <DragStrip />
            <DealsGrid />
            <CategoriesGrid onCatClick={setActiveCat} />
            <Sponsors />
            <HowItWorks />
            <Footer />
            {activeCat && <CategoryPage cat={activeCat} onClose={() => setActiveCat(null)} />}
          </>
        } />

        {/* ── Auth pages (no navbar) ───────────────────────── */}
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ── Protected pages (with navbar) ───────────────── */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <PageShell onShare={() => setShareOpen(true)} cartCount={cartCount}>
              <ProfilePage />
            </PageShell>
          </ProtectedRoute>
        } />
        <Route path="/canvases" element={
          <ProtectedRoute>
            <PageShell onShare={() => setShareOpen(true)} cartCount={cartCount}>
              <CanvasesPage />
            </PageShell>
          </ProtectedRoute>
        } />

        {/* ── Category pages ──────────────────────────────── */}
        <Route path="/category/:slug" element={
          <CategoryRouteWrapper onShare={() => setShareOpen(true)} cartCount={cartCount} />
        } />

        {/* ── Legal pages ─────────────────────────────────── */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms"   element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />

        {/* ── 404 ─────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
