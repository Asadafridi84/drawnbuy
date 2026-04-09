import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Topbar from './components/navbar/Topbar';
import Navbar from './components/navbar/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import CanvasesPage from './pages/CanvasesPage';
import CategoryPage from './pages/CategoryPage';
import NotFoundPage from './pages/NotFoundPage';
import CartDrawer from './components/shared/CartDrawer';
import MiniCanvas from './components/canvas/MiniCanvas';
import { useAuthStore } from './store/auth';
import './styles/globals.css';

function Layout({ children }) {
  return (
    <>
      <Topbar />
      <Navbar />
      <main>{children}</main>
      <CartDrawer />
      <MiniCanvas />
    </>
  );
}

export default function App() {
  const { restoreSession } = useAuthStore();
  useEffect(() => { restoreSession(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<Layout><HomePage /></Layout>} />
        <Route path="/category/:slug"    element={<CategoryPage />} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/signup"            element={<SignupPage />} />
        <Route path="/profile"           element={<Layout><ProfilePage /></Layout>} />
        <Route path="/my-canvases"       element={<Layout><CanvasesPage /></Layout>} />
        <Route path="*"                  element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
