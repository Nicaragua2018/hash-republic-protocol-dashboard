import React, { useState } from 'react';

// List of mock experts and their evidence
const expertsData = [
  {
    id: 'exp-1',
    name: 'Bob (Criptógrafo)',
    domain: 'Criptografía',
    rawScore: 92,
    contributions: [
      { type: 'GitHub Commit', text: 'Optimización de firmas XMSS en secp256k1 (commit bfb310)', link: '#' },
      { type: 'Research Paper', text: 'Stateful Hash-Based Signatures on Distributed Networks', link: '#' }
    ]
  },
  {
    id: 'exp-2',
    name: 'Carol (Auditora)',
    domain: 'Infraestructura',
    rawScore: 85,
    contributions: [
      { type: 'Security Review', text: 'Auditoría de vectores de ataque cuánticos en canales de Lightning Network', link: '#' },
      { type: 'GitHub Pull Request', text: 'Soporte para direcciones de prueba post-quantum en regtest (#4522)', link: '#' }
    ]
  },
  {
    id: 'exp-3',
    name: 'John (Miner)',
    domain: 'Infraestructura',
    rawScore: 65,
    contributions: [
      { type: 'Mined Block', text: 'Señalización activa de preparación de nodo v27.1 post-quantum (bloque 842100)', link: '#' }
    ]
  },
  {
    id: 'exp-4',
    name: 'Alice (Desarrolladora)',
    domain: 'Criptografía',
    rawScore: 125, // Score superior para demostrar el tope (cap)
    contributions: [
      { type: 'BIP Draft', text: 'BIP Proposal: Quantum Resistant Addresses using Falcon Signatures', link: '#' },
      { type: 'GitHub Repo', text: 'Creadora de btc-pq-wallet experimental (150 estrellas)', link: '#' }
    ]
  }
];

export default function ReputationEngine() {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [rawReputation, setRawReputation] = useState(80);

  // Calulate capped multiplier: 1 + 0.3 * (raw / 100), max 1.30
  const calculateMultiplier = (raw) => {
    const calculated = 1 + (0.3 * (raw / 100));
    return Math.min(calculated, 1.30).toFixed(3);
  };

  const activeMultiplier = calculateMultiplier(rawReputation);
  const isCapped = rawReputation >= 100;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Reputation Engine & Influence Cap</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px', marginTop: '8px' }}>
          El protocolo valora la competencia técnica de los expertos sin comprometer la igualdad democrática. La reputación por dominio se calcula basándose en evidencia auditable (commits de GitHub, papers revisados), pero su influencia está estrictamente topada a un multiplicador máximo de <strong>1.30x</strong>.
        </p>
      </div>

      {/* Interactive Cap Simulator */}
      <div className="glass-card" style={{ textAlign: 'left' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          Simulador del Multiplicador de Reputación
        </h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
          Ajusta la reputación técnica bruta (Raw Score) para ver cómo se comporta el multiplicador final de voto en el consenso. Al superar 100 puntos, el sistema topa el peso automáticamente para evitar la captura tecnocrática.
        </p>

        <div className="grid-cols-2" style={{ alignItems: 'center', gap: '32px' }}>
          
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reputación Bruta (Raw Score):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  id="slider-reputation-raw"
                  type="range"
                  min="0"
                  max="200"
                  value={rawReputation}
                  onChange={(e) => setRawReputation(parseInt(e.target.value, 10))}
                  style={{ flex: 1, accentColor: 'var(--color-accent)' }}
                />
                <span style={{ fontSize: '1.1rem', color: 'white', fontWeight: 'bold', width: '50px' }}>{rawReputation}</span>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.01)',
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${isCapped ? 'var(--color-warning)' : 'var(--border-color)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fórmula del Protocolo:</span>
              <code style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', width: 'fit-content' }}>
                Multiplier = Min(1 + 0.3 * (Raw / 100), 1.30)
              </code>
              {isCapped && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-warning)', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠️ Límite del 1.30x alcanzado (Capped)
                </span>
              )}
            </div>
          </div>

          {/* Visual Dial / Metric */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            position: 'relative'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Multiplicador de Voto Final
            </span>
            <span style={{ 
              fontSize: '4rem', 
              fontFamily: 'var(--font-display)', 
              fontWeight: 'bold',
              color: isCapped ? 'var(--color-warning)' : 'var(--color-accent)',
              textShadow: isCapped ? '0 0 20px rgba(245,158,11,0.2)' : '0 0 20px rgba(56,189,248,0.2)',
              margin: '10px 0'
            }}>
              {activeMultiplier}x
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Voto Base (1.00x) + Reputación ({((activeMultiplier - 1)*100).toFixed(0)}%)
            </span>
          </div>

        </div>
      </div>

      {/* Main split dashboard view */}
      <div className="grid-cols-2">
        
        {/* Expert list with capped multiplier */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ textAlign: 'left', fontSize: '1.2rem', margin: 0 }}>Listado de Expertos y Pesos</h3>
          <p style={{ textAlign: 'left', fontSize: '0.85rem' }}>
            Audite la distribución de reputación activa del protocolo. Haga clic en un experto para ver sus credenciales verificables.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {expertsData.map((exp) => {
              const multiplier = calculateMultiplier(exp.rawScore);
              const isCapReached = exp.rawScore >= 100;
              const isSelected = selectedExpert && selectedExpert.id === exp.id;

              return (
                <div
                  key={exp.id}
                  id={`expert-row-${exp.id}`}
                  onClick={() => setSelectedExpert(exp)}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontWeight: 'bold', color: 'white', display: 'block' }}>{exp.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>Dominio: {exp.domain}</span>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      <span>Raw: {exp.rawScore}</span>
                      {isCapReached && <span style={{ display: 'block', color: 'var(--color-warning)', fontSize: '0.75rem' }}>(Max Limit)</span>}
                    </div>
                    <span style={{ 
                      fontSize: '1.15rem', 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 'bold',
                      color: isCapReached ? 'var(--color-warning)' : 'var(--color-success)'
                    }}>
                      {multiplier}x
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence details card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Evidencia Criptográfica de Soporte</h3>
          
          {selectedExpert ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <div>
                <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '4px' }}>{selectedExpert.name}</h4>
                <span className="badge badge-info">Dominio: {selectedExpert.domain}</span>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 'bold' }}>
                  Contribuciones de Evidencia del Protocolo (Auditables):
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedExpert.contributions.map((con, idx) => (
                    <div key={idx} style={{ 
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-color)',
                      padding: '12px',
                      borderRadius: '6px'
                    }}>
                      <span className="badge" style={{ 
                        fontSize: '0.65rem',
                        marginBottom: '6px',
                        background: con.type.includes('GitHub') ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: con.type.includes('GitHub') ? 'var(--color-accent)' : 'var(--color-success)',
                        border: `1px solid ${con.type.includes('GitHub') ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                        {con.type}
                      </span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{con.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ℹ️ La reputación del protocolo caduca automáticamente tras 6 meses de inactividad, lo que incentiva la auditoría y participación técnica continua.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '16px', opacity: 0.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p>Selecciona un experto de la lista para ver la evidencia verificable que soporta su nivel de reputación en la red.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
