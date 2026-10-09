import React, { useState } from 'react';

export default function RiskGuard() {
  const [delegationConcentration, setDelegationConcentration] = useState(42);
  const [reputationConcentration, setReputationConcentration] = useState(35);
  const [minorityPreservation, setMinorityPreservation] = useState(80);
  const [newContributorInclusion, setNewContributorInclusion] = useState(72);

  // Check if any metrics trigger alerts
  const alerts = [];
  if (delegationConcentration >= 50) {
    alerts.push({
      id: 'alert-1',
      type: 'danger',
      title: 'Alta Concentración de Delegación',
      desc: `La delegación líquida en el dominio 'Criptografía' supera el 50% (${delegationConcentration}%). Un único delegado (Bob) acumula suficiente peso para distorsionar la señal comunitaria.`
    });
  }
  if (reputationConcentration >= 45) {
    alerts.push({
      id: 'alert-2',
      type: 'warning',
      title: 'Centralización de Reputación',
      desc: `El top 3 de expertos concentran el ${reputationConcentration}% de la reputación activa en el observatorio, reduciendo el dinamismo del consenso.`
    });
  }
  if (minorityPreservation < 60) {
    alerts.push({
      id: 'alert-3',
      type: 'danger',
      title: 'Supresión de Voces Minoritarias',
      desc: `La preservación de minorías cayó al ${minorityPreservation}%. Se están ignorando los disensos significativos de los clusters minoritarios en los reportes sintetizados.`
    });
  }
  if (newContributorInclusion < 50) {
    alerts.push({
      id: 'alert-4',
      type: 'warning',
      title: 'Barrera de Entrada para Nuevos Contribuyentes',
      desc: `La tasa de inclusión de nuevos contribuidores es baja (${newContributorInclusion}%). Los participantes históricos retienen la influencia casi exclusiva.`
    });
  }

  // Draw circular SVG gauge
  const renderGauge = (label, value, minVal, maxVal, isLowBad = false) => {
    // Determine color based on threshold
    let color = 'var(--color-success)';
    const isAlert = isLowBad ? value < minVal : value >= maxVal;
    const isWarning = isLowBad ? (value >= minVal && value < minVal + 15) : (value < maxVal && value >= maxVal - 10);
    
    if (isAlert) color = 'var(--color-danger)';
    else if (isWarning) color = 'var(--color-warning)';

    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '12px',
        padding: '16px',
        background: 'rgba(255,255,255,0.015)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px'
      }}>
        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
          <svg width="90" height="90" viewBox="0 0 90 90">
            {/* Background circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="6"
            />
            {/* Value stroke */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 45 45)"
              style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
            />
          </svg>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '90px', 
            height: '90px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: 'white'
          }}>
            {value}%
          </div>
        </div>
        <span style={{ fontSize: '0.825rem', fontWeight: '500', color: 'var(--text-secondary)', textAlign: 'center' }}>{label}</span>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>RiskGuard Capture Observatory</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px', marginTop: '8px' }}>
          RiskGuard es un sistema inmunitario cívico. Monitorea de manera pasiva el flujo deliberativo para advertir sobre dinámicas de colusión, manipulación o captura de la toma de decisiones por carteles de delegación o influencia. Genera alertas públicas independientes pero no tiene poder coercitivo.
        </p>
      </div>

      {/* Gauges display grid */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          Indicadores de Salud del Consenso
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '20px'
        }}>
          {renderGauge('Concentración de Delegaciones', delegationConcentration, 0, 50)}
          {renderGauge('Concentración de Reputación', reputationConcentration, 0, 45)}
          {renderGauge('Preservación de Minorías', minorityPreservation, 60, 0, true)}
          {renderGauge('Inclusión de Colaboradores', newContributorInclusion, 50, 0, true)}
        </div>
      </div>

      {/* Splitting dashboard view: controls vs warning feed */}
      <div className="grid-cols-2">
        
        {/* Sliders to simulate risks */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Simulador de Amenazas de Captura</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Deslice las variables de control para simular escenarios de votación hostiles o carteles de influencia. Observe cómo RiskGuard genera alertas inmediatas.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {/* Slider 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Concentración de Delegación (Bob)</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{delegationConcentration}%</span>
              </div>
              <input
                id="slider-risk-delegation"
                type="range"
                min="10"
                max="90"
                value={delegationConcentration}
                onChange={(e) => setDelegationConcentration(parseInt(e.target.value, 10))}
                style={{ accentColor: delegationConcentration >= 50 ? 'var(--color-danger)' : 'var(--color-accent)' }}
              />
            </div>

            {/* Slider 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Concentración de Reputación</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{reputationConcentration}%</span>
              </div>
              <input
                id="slider-risk-reputation"
                type="range"
                min="10"
                max="80"
                value={reputationConcentration}
                onChange={(e) => setReputationConcentration(parseInt(e.target.value, 10))}
                style={{ accentColor: reputationConcentration >= 45 ? 'var(--color-warning)' : 'var(--color-accent)' }}
              />
            </div>

            {/* Slider 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Índice de Preservación de Minorías</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{minorityPreservation}%</span>
              </div>
              <input
                id="slider-risk-minority"
                type="range"
                min="20"
                max="100"
                value={minorityPreservation}
                onChange={(e) => setMinorityPreservation(parseInt(e.target.value, 10))}
                style={{ accentColor: minorityPreservation < 60 ? 'var(--color-danger)' : 'var(--color-success)' }}
              />
            </div>

            {/* Slider 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Inclusión de Nuevos Miembros</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{newContributorInclusion}%</span>
              </div>
              <input
                id="slider-risk-inclusion"
                type="range"
                min="10"
                max="100"
                value={newContributorInclusion}
                onChange={(e) => setNewContributorInclusion(parseInt(e.target.value, 10))}
                style={{ accentColor: newContributorInclusion < 50 ? 'var(--color-warning)' : 'var(--color-success)' }}
              />
            </div>
          </div>
        </div>

        {/* Real-time Warning Feed */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Alertas de Observabilidad RiskGuard
            {alerts.length > 0 && <span className="badge badge-danger" style={{ animation: 'pulse 1.5s infinite' }}>{alerts.length} Activas</span>}
          </h3>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            overflowY: 'auto',
            maxHeight: '260px',
            flex: 1
          }}>
            {alerts.map((al) => (
              <div
                key={al.id}
                id={`alert-card-${al.id}`}
                style={{
                  background: al.type === 'danger' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                  borderLeft: `4px solid ${al.type === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'}`,
                  borderTop: '1px solid var(--border-color)',
                  borderRight: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: al.type === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)',
                    fontSize: '0.9rem' 
                  }}>
                    {al.type === 'danger' ? '❌ ALERTA CRÍTICA' : '⚠️ ADVERTENCIA'} - {al.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Módulo RiskGuard v0.3</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{al.desc}</p>
              </div>
            ))}

            {alerts.length === 0 && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                color: 'var(--color-success)',
                textAlign: 'center',
                padding: '40px 20px',
                gap: '8px'
              }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <span style={{ fontWeight: 'bold' }}>Consenso Saludable</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Todos los indicadores de centralización y captura están en rangos óptimos de seguridad.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
