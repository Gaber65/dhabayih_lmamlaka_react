import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SplashPage, OnboardingPage } from '../pages/SplashAndOnboarding';
import { LoginPage, RegisterPage } from '../pages/AuthPages';
import { MainLayout } from '../components/layout/MainLayout';
import { HomePage } from '../pages/HomePage';
import { CategoriesPage } from '../pages/CatalogPages';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentCallbackPage } from '../pages/PaymentCallbackPage';
import { OrderSuccessPage, OrdersPage, OrderDetailsPage } from '../pages/OrderPages';
import { AddressesPage } from '../pages/AddressesPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SearchPage } from '../pages/SearchPage';
import { OffersPage } from '../pages/OffersPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SplashPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: '/home',
        element: <HomePage />,
      },
      {
        path: '/categories',
        element: <CategoriesPage />,
      },
      {
        path: '/offers',
        element: <OffersPage />,
      },
      {
        path: '/favorites',
        element: <FavoritesPage />,
      },
      {
        path: '/product/:id',
        element: <ProductDetailsPage />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        path: '/payment/callback',
        element: <PaymentCallbackPage />,
      },
      {
        path: '/order-success',
        element: <OrderSuccessPage />,
      },
      {
        path: '/orders',
        element: <OrdersPage />,
      },
      {
        path: '/orders/:id',
        element: <OrderDetailsPage />,
      },
      {
        path: '/addresses',
        element: <AddressesPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/admin-dashboard',
        element: <AdminDashboardPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
]);