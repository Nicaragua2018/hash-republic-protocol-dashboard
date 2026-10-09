import React, { useState } from 'react';

const readinessLevels = [
  { id: 'R0', name: 'R0 – Sin Conciencia', desc: 'No existe discusión pública formal sobre amenazas cuánticas en los canales principales de Bitcoin.' },
  { id: 'R1', name: 'R1 – Investigación', desc: 'Se publican papers teóricos preliminares y posts en listas de correo sobre amenazas y algoritmos de firma.' },
  { id: 'R2', name: 'R2 – Taxonomía de Riesgos', desc: 'Identificación formal y catalogación de vectores de ataque cuánticos en scripts de Bitcoin, direcciones y firmas. (Nivel Objetivo Actual)', isActiveTarget: true },
  { id: 'R3', name: 'R3 – Mitigaciones', desc: 'Diseño y discusión de esquemas específicos de firmas cuántico-resistentes adaptados para Bitcoin (ej. XMSS, SPHINCS+).' },
  { id: 'R4', name: 'R4 – Prototipos', desc: 'Creación de implementaciones de prueba, redes de prueba (testnets) y carteras prototipo con criptografía post-cuántica.' },
  { id: 'R5', name: 'R5 – Consenso Preliminar', desc: 'Aceptación general de la comunidad técnica sobre el camino a seguir, redactando los borradores de BIP correspondientes.' },
  { id: 'R6', name: 'R6 – Activación', desc: 'Despliegue y pruebas de activación de la actualización en redes de prueba y calendarios formales para mainnet.' },
  { id: 'R7', name: 'R7 – Migración Madura', desc: 'Transición completada con éxito. La mayoría de los fondos de la red están protegidos bajo esquemas criptográficos cuántico-resistentes.' }
];

const btcRisks = [
  {
    id: 'risk-1',
    title: 'ECDSA / secp256k1 Vulnerability',
    domain: 'Criptografía',
    urgency: 'Crítica',
    description: 'El algoritmo de Shor ejecutado en un ordenador cuántico de suficiente escala puede calcular la clave privada a partir de la clave pública expuesta en segundos.',
    consensus: 94,
    status: 'R2 Identificado',
    proposals: [
      { name: 'Activación de firmas de hash (XMSS/LMS) mediante Soft Fork', support: 82 },
      { name: 'Migración a esquemas basados en retículos (FALCON/Dilithium)', support: 58 }
    ]
  },
  {
    id: 'risk-2',
    title: 'Claves Públicas Expuestas en Direcciones Antiguas',
    domain: 'Estructura de Datos',
    urgency: 'Alta',
    description: 'Direcciones Pay-to-Public-Key (P2PK) y direcciones que ya han gastado fondos revelan sus claves públicas en la blockchain. Cerca de 2-3 millones de BTC están en este estado.',
    consensus: 88,
    status: 'R2 Identificado',
    proposals: [
      { name: 'Esquema de quema de UTXOs inactivos post-quantum tras periodo de gracia', support: 34 },
      { name: 'Pruebas ZK para reclamar llaves públicas antiguas sin revelarlas', support: 72 }
    ]
  },
  {
    id: 'risk-3',
    title: 'Exposición durante el periodo en Mempool',
    domain: 'Red y Protocolo',
    urgency: 'Media',
    description: 'Al transmitir una transacción, la clave pública se revela en la mempool. Un atacante cuántico podría interceptar la transacción, derivar la clave privada y retransmitir con una comisión más alta (front-running).',
    consensus: 75,
    status: 'R2 Investigación',
    proposals: [
      { name: 'Cifrado de Mempool con esquemas de tiempo compartido', support: 46 },
      { name: 'Transacciones Commit-Reveal post-cuánticas', support: 69 }
    ]
  }
];

export default function Observatory() {
  const [selectedLevel, setSelectedLevel] = useState('R2');
  const activeLevelData = readinessLevels.find(l => l.id === selectedLevel);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Bitcoin Quantum Readiness Observatory</h1>
          <span className="badge badge-warning">Meta Activa: R2 (Taxonomía)</span>
        </div>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px' }}>
          Un observatorio público y neutral que mapea la resiliencia del protocolo Bitcoin ante la computación cuántica, estructurando el consenso sobre vectores de riesgo y alternativas técnicas de migración.
        </p>
      </div>

      {/* Visual Roadmap Selector */}
      <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          Escala de Preparación Cuántica de Bitcoin (Readiness Scale)
        </h3>
        
        {/* Horizontal scrollable timeline container */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          position: 'relative', 
          marginBottom: '24px', 
          overflowX: 'auto', 
          padding: '16px 8px',
          gap: '12px'
        }}>
          {/* Connector Line behind elements */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '30px',
            right: '30px',
            height: '2px',
            background: 'linear-gradient(to right, var(--color-success), var(--color-warning), var(--border-color))',
            zIndex: 0,
            minWidth: '700px'
          }}></div>

          {readinessLevels.map((lvl) => {
            const isCompleted = ['R0', 'R1'].includes(lvl.id);
            const isActive = lvl.id === selectedLevel;
            const isTarget = lvl.isActiveTarget;
            
            let btnBg = 'var(--bg-main)';
            let borderCol = 'var(--border-color)';
            let textCol = 'var(--text-secondary)';
            
            if (isActive) {
              btnBg = isTarget ? 'var(--color-warning)' : 'var(--color-accent)';
              borderCol = isTarget ? 'var(--color-warning)' : 'var(--color-accent)';
              textCol = '#030712';
            } else if (isCompleted) {
              borderCol = 'var(--color-success)';
              textCol = 'var(--color-success)';
            } else if (isTarget) {
              borderCol = 'var(--color-warning)';
              textCol = 'var(--color-warning)';
            }

            return (
              <button
                key={lvl.id}
                id={`btn-timeline-${lvl.id}`}
                onClick={() => setSelectedLevel(lvl.id)}
                style={{
                  minWidth: '85px',
                  height: '50px',
                  borderRadius: '10px',
                  background: btnBg,
                  border: `2px solid ${borderCol}`,
                  color: textCol,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  zIndex: 1,
                  fontFamily: 'var(--font-display)',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 0 15px ${borderCol}80` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{lvl.id}</span>
              </button>
            );
          })}
        </div>

        {/* Selected level explanation */}
        {activeLevelData && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderLeft: `4px solid ${activeLevelData.isActiveTarget ? 'var(--color-warning)' : ['R0', 'R1'].includes(activeLevelData.id) ? 'var(--color-success)' : 'var(--color-accent)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{activeLevelData.name}</h4>
              {activeLevelData.isActiveTarget && <span className="badge badge-warning">Meta de la Comunidad</span>}
              {['R0', 'R1'].includes(activeLevelData.id) && <span className="badge badge-success">Completado</span>}
            </div>
            <p style={{ color: 'var(--text-primary)' }}>{activeLevelData.desc}</p>
          </div>
        )}
      </div>

      {/* Risks catalog grid */}
      <div>
        <h2 style={{ textAlign: 'left', marginBottom: '20px', fontSize: '1.6rem' }}>Vectores de Riesgo Identificados (R2)</h2>
        <div className="grid-cols-2">
          {btcRisks.map((risk) => (
            <div key={risk.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                    {risk.domain}
                  </span>
                  <h3 style={{ marginTop: '4px', fontSize: '1.25rem' }}>{risk.title}</h3>
                </div>
                <span className={`badge ${risk.urgency === 'Crítica' ? 'badge-danger' : risk.urgency === 'Alta' ? 'badge-warning' : 'badge-info'}`}>
                  {risk.urgency}
                </span>
              </div>

              <p style={{ fontSize: '0.925rem' }}>{risk.description}</p>

              {/* Progress Consensus bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Consenso sobre Gravedad del Riesgo</span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{risk.consensus}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${risk.consensus}%`, background: 'var(--color-accent)' }}></div>
                </div>
              </div>

              {/* Proposals and support list */}
              <div style={{ 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Propuestas de Mitigación Evaluadas:</h4>
                {risk.proposals.map((prop, idx) => (
                  <div key={idx} style={{ 
                    background: 'rgba(255,255,255,0.015)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.03)',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{ color: 'var(--text-secondary)', maxWidth: '80%' }}>{prop.name}</span>
                    <span style={{ 
                      color: prop.support >= 70 ? 'var(--color-success)' : prop.support >= 50 ? 'var(--color-accent)' : 'var(--text-muted)',
                      fontWeight: 'bold'
                    }}>{prop.support}%</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '8px' }}>
                <span>Estado: <strong>{risk.status}</strong></span>
                <span>ID: {risk.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
