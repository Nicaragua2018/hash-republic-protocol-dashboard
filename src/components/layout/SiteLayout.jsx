import React, { Suspense, lazy, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// HONEY va en un archivo aparte: no pesa en la carga de la página y no
// aparece mientras el servicio esté apagado.
const HoneyWidget = lazy(() => import('../honey/HoneyWidget.jsx'));

// Al cambiar de página se empieza arriba, o en la sección del enlace (#…).
function useDesplazamiento() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const destino = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (destino) destino.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
}

// Las tarjetas y títulos que están más abajo aparecen suavemente al llegar a
// ellos. Solo con JavaScript y sin «reducir movimiento»: si no, todo se ve
// desde el principio.
function useRevelar() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('oc-visible');
          observador.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -40px 0px' }
    );
    const elementos = document.querySelectorAll('main .oc-card, main .oc-h2, main .oc-paso');
    for (const el of elementos) {
      if (el.getBoundingClientRect().top < window.innerHeight) continue;
      el.classList.add('oc-revelar');
      observador.observe(el);
    }
    return () => observador.disconnect();
  }, [pathname]);
}

export default function SiteLayout() {
  useDesplazamiento();
  useRevelar();
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
