import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { CartoonHeader } from './CartoonHeader';
import { CartoonBottomNav } from './CartoonBottomNav';
import { CartoonFooter } from './CartoonFooter';
import { CartDrawer } from '../cart/CartDrawer';
import { ToastContainer } from '../common/ToastContainer';
import { StoryViewerModal } from './StoryViewerModal';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';

export const MainLayout: React.FC = () => {
  const { initAuth } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    initAuth();
    fetchCart();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 font-sans selection:bg-brand-500 selection:text-white">
      <CartoonHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <CartoonFooter />
      <CartoonBottomNav />
      <CartDrawer />
      <StoryViewerModal />
    </div>
  );
};