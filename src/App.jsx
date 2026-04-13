import { useState } from 'react';

// All 16 sections - DrawNBuy v3 Full Rebuild
import Topbar             from './components/Topbar';
import Navbar             from './components/Navbar';
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
import ShareModal         from './components/ShareModal';
import CategoryPage       from './components/CategoryPage';
import MiniFloatingCanvas from './components/MiniFloatingCanvas';

export default function App() {
  const [shareOpen, setShareOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const [cartCount] = useState(3);

  return (
    <>
      <style>{`
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
      `}</style>

      <Topbar />
      <Navbar onShare={() => setShareOpen(true)} cartCount={cartCount} />
      <AdStrip />
      <Hero />
      <CategoryBar />
      <CollabCanvas />
      <ProductSearchPanel />
      <DragStrip />
      <DealsGrid />
      <CategoriesGrid onCatClick={setActiveCat} />
      <Sponsors />
      <HowItWorks />
      <Footer />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      {activeCat && <CategoryPage cat={activeCat} onClose={() => setActiveCat(null)} />}
      <MiniFloatingCanvas />
    </>
  );
}
