import AdStrip from '../components/shared/AdStrip';
import Hero from '../components/shared/Hero';
import CategoryBar from '../components/shared/CategoryBar';
import CollabCanvas from '../components/canvas/CollabCanvas';
import DragStrip from '../components/product/DragStrip';
import ProductSearchPanel from '../components/product/ProductSearchPanel';
import DealsGrid from '../components/deals/DealsGrid';
import CategoriesGrid from '../components/categories/CategoriesGrid';
import { Sponsors, HowItWorks, Footer, ShareModal, ToastContainer } from '../components/shared/Sections';

export default function HomePage() {
  return (
    <>
      <AdStrip />
      <Hero />
      <CategoryBar />
      <CollabCanvas />
      <DragStrip />
      <ProductSearchPanel />
      <DealsGrid />
      <Sponsors />
      <CategoriesGrid />
      <HowItWorks />
      <Footer />
      <ShareModal />
      <ToastContainer />
    </>
  );
}
