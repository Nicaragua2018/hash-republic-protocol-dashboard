import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/dashboard.css';
import Observatory from '../components/Observatory';
import OpinionMap from '../components/OpinionMap';
import DelegationGraph from '../components/DelegationGraph';
import ReputationEngine from '../components/ReputationEngine';
import RiskGuard from '../components/RiskGuard';
import ReportHub from '../components/ReportHub';
import InteractiveSpecs from '../components/InteractiveSpecs';
import MathModeler from '../components/MathModeler';
import SdkPlayground from '../components/SdkPlayground';
import SchemaValidator from '../components/SchemaValidator';

export default function HashRepublicDashboard() {
  const [activeTab, setActiveTab] = useState('observatory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // This project page uses the dark "protocol" theme instead of the
  // institutional site's light brand theme.
  useEffect(() => {
    document.body.classList.add('theme-dark');
    return () => document.body.classList.remove('theme-dark');
  }, []);

  // ── Section 1: Bitcoin Quantum Observatory ──
  const observatoryTabs = [
    { id: 'observatory', label: 'Quantum Observatory', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z' },
    { id: 'deliberation', label: 'Pol.is Opinion Map', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20c-2.202 0-4.29-.626-6.086-1.71m11-3.9a9 9 0 11-13.413-.087m13.413-.013c-.502-.917-.786-1.964-.786-3.07a8.914 8.914 0 00-.708-3.483m1.447 6.562a9.337 9.337 0 013.753-3.659M15 6.18a9.35 9.35 0 012.625.372 9.337 9.337 0 014.121-.952 4.125 4.125 0 00-7.533-2.493M13.007 8.756a8.9 8.9 0 00-2.918-.44 8.917 8.917 0 00-6 2.24' },
    { id: 'delegation', label: 'Liquid Delegation', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
    { id: 'reputation', label: 'Reputation (1.30x)', icon: 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z' },
    { id: 'riskguard', label: 'RiskGuard Alerts', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'reports', label: 'Integrity Hub', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0112 3c.38 0 .758.004 1.136.01m-7.385 0A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h5.13' }
  ];

  // ── Section 2: Hash Republic Protocol Developer Tools ──
  const hrpTabs = [
    { id: 'hrp-specs', label: 'Protocol Specs', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
    { id: 'hrp-math', label: 'Math Modeler', icon: 'M4.745 3A23.933 23.933 0 003 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.759 1.5 5.74 1.5 9s-.533 6.241-1.5 9M8.25 8.885l1.444-.89a.75.75 0 011.105.402l2.402 7.206a.75.75 0 001.104.401l1.445-.889m-8.25.75l.213.09a1.687 1.687 0 002.062-.617l4.45-6.676a1.688 1.688 0 012.062-.618l.213.09' },
    { id: 'hrp-sdk', label: 'SDK Playground', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
    { id: 'hrp-schema', label: 'Schema Validator', icon: 'M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12' },
  ];

  const allTabs = [...observatoryTabs, ...hrpTabs];

  const renderContent = () => {
    switch (activeTab) {
      case 'observatory':   return <Observatory />;
      case 'deliberation':  return <OpinionMap />;
      case 'delegation':    return <DelegationGraph />;
      case 'reputation':    return <ReputationEngine />;
      case 'riskguard':     return <RiskGuard />;
      case 'reports':       return <ReportHub />;
      case 'hrp-specs':     return <InteractiveSpecs />;
      case 'hrp-math':      return <MathModeler />;
      case 'hrp-sdk':       return <SdkPlayground />;
      case 'hrp-schema':    return <SchemaValidator />;
      default:              return <Observatory />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>

      {/* Background radial flows */}
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>

      {/* Top navbar on mobile, side menu on desktop */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', position: 'relative' }}>

        {/* Sidebar Left (Desktop) */}
        <aside id="dashboard-sidebar" style={{
          width: '260px',
          background: 'rgba(11, 15, 25, 0.95)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          position: 'sticky',
          top: 0,
          height: '100vh'
        }} className="desktop-only">
          {/* Logo container */}
          <Link to="/" style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', textDecoration: 'none' }}>
            <img
              src="/opencivic-icono-color.svg"
              alt="OpenCivic Solutions"
              style={{ width: '38px', height: '38px', objectFit: 'contain' }}
            />
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '-0.025em', display: 'block', color: 'white' }}>OpenCivic</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solutions</span>
            </div>
          </Link>

          {/* Navigation links — grouped by section */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto' }}>

            {/* ── Group 1: Observatory ── */}
            <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '4px 16px 8px', marginTop: '4px' }}>
              Bitcoin Observatory
            </div>
            {observatoryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    color: isActive ? 'var(--color-accent)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '600' : '400',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              );
            })}

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '16px 12px' }} />

            {/* ── Group 2: Protocol Tools ── */}
            <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '4px 16px 8px' }}>
              Protocol Dev Tools
            </div>
            {hrpTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    color: isActive ? 'var(--color-accent)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '600' : '400',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Back to site + protocol version footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Link to="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'block', marginBottom: '6px' }}>&larr; Volver al sitio</Link>
            <span>Hash Republic Protocol v0.3</span>
          </div>
        </aside>

        {/* Mobile Header Navigation */}
        <div style={{ display: 'none', width: '100%', flexDirection: 'column', zIndex: 100 }} className="mobile-only">
          <header style={{
            background: 'rgba(11, 15, 25, 0.98)',
            borderBottom: '1px solid var(--border-color)',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img
                src="/opencivic-icono-color.svg"
                alt="OpenCivic Solutions"
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>OpenCivic Solutions</span>
            </Link>

            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </header>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <nav style={{
              background: 'rgba(11, 15, 25, 0.98)',
              borderBottom: '1px solid var(--border-color)',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              position: 'absolute',
              top: '61px',
              left: 0,
              right: 0,
              boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
              zIndex: 99
            }}>
              {allTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`mobile-tab-btn-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--color-accent)' : 'var(--text-secondary)',
                      fontWeight: isActive ? '600' : '400',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      fontFamily: 'var(--font-display)'
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                );
              })}
              <Link to="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', padding: '10px 14px', fontSize: '0.85rem' }}>&larr; Volver al sitio</Link>
            </nav>
          )}
        </div>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          padding: '40px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          overflowX: 'hidden'
        }}>
          {renderContent()}
        </main>

      </div>
    </div>
  );
}
