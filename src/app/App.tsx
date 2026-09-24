import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProviders } from './providers';
import { ToastContainer } from '../components/common/ToastContainer';

export const App: React.FC = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <ToastContainer />
    </AppProviders>
  );
};