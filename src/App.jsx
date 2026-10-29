import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Suscripcion from './pages/Suscripcion';
import Join from './pages/Join';
import Contact from './pages/Contact';
import RedirigirFuera, { PANEL_HRP_ARCHIVO } from './components/RedirigirFuera';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/proyectos" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/suscripcion" element={<Suscripcion />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/unirse" element={<Join />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* El panel técnico quedó archivado en GitHub. */}
        <Route path="/proyectos/hash-republic-protocol" element={<RedirigirFuera a={PANEL_HRP_ARCHIVO} />} />
      </Routes>
    </BrowserRouter>
  );
}
