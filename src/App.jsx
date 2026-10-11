import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout';
import IntroSplash from './components/layout/IntroSplash';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Join from './pages/Join';
import Contact from './pages/Contact';
import HashRepublicDashboard from './pages/HashRepublicDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <IntroSplash />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/proyectos" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/unirse" element={<Join />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Standalone: the project has its own dark "protocol" theme and nav */}
        <Route path="/proyectos/hash-republic-protocol" element={<HashRepublicDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
