import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
