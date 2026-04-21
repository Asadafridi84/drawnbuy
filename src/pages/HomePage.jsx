import { useState } from 'react';
import AdStrip from '../components/AdStrip';
import Hero from '../components/Hero';
import CategoryBar from '../components/CategoryBar';
import CollabCanvas from '../components/CollabCanvas';
import DragStrip from '../components/DragStrip';
import ProductSearchPanel from '../components/ProductSearchPanel';
import DealsGrid from '../components/DealsGrid';
import CategoriesGrid from '../components/CategoriesGrid';
import Sponsors from '../components/Sponsors';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <>
      <AdStrip />
      <Hero onShare={() => setShareOpen(true)} />
      <CategoryBar onSelect={setActiveCategory} />
      <CollabCanvas />
      <DragStrip />
      <ProductSearchPanel />
      <DealsGrid selectedCategory={activeCategory} />
      <Sponsors />
      <CategoriesGrid />
      <HowItWorks />
      <Footer />
    </>
  );
}
