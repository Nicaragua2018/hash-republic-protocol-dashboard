import React, { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// HONEY va en un archivo aparte: no pesa en la carga de la página y no
// aparece mientras el servicio esté apagado.
const HoneyWidget = lazy(() => import('../honey/HoneyWidget.jsx'));

export default function SiteLayout() {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <HoneyWidget />
      </Suspense>
    </>
  );
}
