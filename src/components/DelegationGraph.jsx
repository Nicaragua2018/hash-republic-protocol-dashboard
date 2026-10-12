import React, { useState } from 'react';

// Default delegation relationships by domain
const defaultDelegations = {
  urbanismo: [
    { from: 'Alice', to: 'Bob', ttlDays: 30, active: true },
    { from: 'John', to: 'Bob', ttlDays: 45, active: true },
    { from: 'Eva', to: 'Alice', ttlDays: 15, active: true },
    { from: 'Dave', to: 'Carol', ttlDays: 60, active: true },
  ],
  finanzas: [
    { from: 'Alice', to: 'Carol', ttlDays: 30, active: true },
    { from: 'Bob', to: 'Carol', ttlDays: 12, active: true },
    { from: 'John', to: 'Dave', ttlDays: 90, active: true },
  ],
  gobernanza: [
    { from: 'Bob', to: 'Alice', ttlDays: 20, active: true },
    { from: 'Carol', to: 'John', ttlDays: 10, active: true },
    { from: 'Dave', to: 'John', ttlDays: 30, active: true },
  ],
};

// SVG Node positions for a clean layout
const nodePositions = {
  Alice: { x: 25, y: 30, name: 'Alice (Arquitecta)', role: 'Espacio público' },
  Bob: { x: 75, y: 30, name: 'Bob (Ingeniero civil)', role: 'Obras públicas' },
  Carol: { x: 75, y: 70, name: 'Carol (Auditora)', role: 'Finanzas públicas' },
  John: { x: 25, y: 70, name: 'John (Líder vecinal)', role: 'Junta de barrio' },
  Dave: { x: 50, y: 85, name: 'Dave (Vecino)', role: 'Participante' },
  Eva: { x: 15, y: 15, name: 'Eva (Estudiante)', role: 'Investigadora' },
};

export default function DelegationGraph() {
  const [domain, setDomain] = useState('urbanismo');
  const [delegations, setDelegations] = useState(defaultDelegations);

  // Custom delegation input states
  const [customFrom, setCustomFrom] = useState('Dave');
  const [customTo, setCustomTo] = useState('Bob');
  const [customTtl, setCustomTtl] = useState(30);

  const activeDelegations = delegations[domain].filter((d) => d.active);

  const calculateInfluence = (nodeName) => {
    let baseWeight = 1; // Cada persona tiene voto base de 1

    // Sumar delegaciones recursivas directas
    const incoming = activeDelegations.filter((d) => d.to === nodeName);
    incoming.forEach((d) => {
      baseWeight += calculateInfluence(d.from);
    });

    return baseWeight;
  };

  const handleRevoke = (index) => {
    setDelegations((prev) => {
      const copy = { ...prev };
      copy[domain] = copy[domain].map((del, idx) => (idx === index ? { ...del, active: false } : del));
      return copy;
    });
  };

  const handleAddDelegation = (e) => {
    e.preventDefault();
    if (customFrom === customTo) {
      alert('No puedes delegar en ti mismo.');
      return;
    }

    // Comprobar si ya existe delegación activa para ese origen
    const exists = activeDelegations.some((d) => d.from === customFrom);
    if (exists) {
      alert(`${customFrom} ya tiene una delegación activa en este dominio. Revoque la anterior primero.`);
      return;
    }

    // Comprobar bucles (evitar Bob -> Alice -> Bob)
    if (
      customFrom === 'Bob' &&
      customTo === 'Alice' &&
      activeDelegations.some((d) => d.from === 'Alice' && d.to === 'Bob')
    ) {
      alert('Error: Se detectó una delegación circular.');
      return;
    }

    const newDel = {
      from: customFrom,
      to: customTo,
      ttlDays: parseInt(customTtl, 10),
      active: true,
    };

    setDelegations((prev) => ({
      ...prev,
      [domain]: [...prev[domain], newDel],
    }));
  };

  const simulateTtlTick = () => {
    setDelegations((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((domKey) => {
        copy[domKey] = copy[domKey].map((d) => {
          if (!d.active) return d;
          const nextTtl = d.ttlDays - 10;
          return {
            ...d,
            ttlDays: nextTtl <= 0 ? 0 : nextTtl,
            active: nextTtl > 0,
          };
        });
      });
      return copy;
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header section */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Liquid Delegation Graph</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px', marginTop: '8px' }}>
          La democracia líquida permite a los participantes delegar su voz técnica a expertos de confianza por
          dominio. Las delegaciones son 100% transparentes, revocables y caducan automáticamente tras expirar
          su tiempo de vida (TTL) para evitar oligarquías fijas.
        </p>
      </div>

      {/* Control buttons & Simulation timeline */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Domain selection tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['urbanismo', 'finanzas', 'gobernanza'].map((dom) => (
            <button
              key={dom}
              id={`btn-domain-${dom}`}
              className="btn btn-secondary"
              onClick={() => setDomain(dom)}
              style={{
                textTransform: 'capitalize',
                borderColor: domain === dom ? 'var(--color-accent)' : 'var(--border-color)',
                boxShadow: domain === dom ? '0 0 10px rgba(56, 189, 248, 0.2)' : 'none',
                color: domain === dom ? 'var(--color-accent)' : 'var(--text-secondary)',
              }}
            >
              {dom === 'urbanismo'
                ? 'Urbanismo'
                : dom === 'finanzas'
                  ? 'Finanzas públicas'
                  : 'Gobernanza cívica'}
            </button>
          ))}
        </div>

        {/* TTL Accelerator */}
        <button
          id="btn-simulate-ttl"
          className="btn btn-danger"
          onClick={simulateTtlTick}
          style={{ fontSize: '0.85rem' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Avanzar Tiempo (-10 Días TTL)
        </button>
      </div>

      {/* Main split dashboard view */}
      <div className="grid-cols-2">
        {/* SVG Liquid Democracy visual network */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ textAlign: 'left', fontSize: '1.2rem', margin: 0 }}>
            Visualización del Grafo (Liquid Network)
          </h3>

          <div
            style={{
              position: 'relative',
              height: '350px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Interactive SVG area */}
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {/* Definitions for arrow marker */}
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(56, 189, 248, 0.6)" />
                </marker>
              </defs>

              {/* Draw Directed Delegation lines */}
              {activeDelegations.map((del, idx) => {
                const start = nodePositions[del.from];
                const end = nodePositions[del.to];
                if (!start || !end) return null;

                return (
                  <g key={idx}>
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="rgba(56, 189, 248, 0.4)"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    {/* TTL bubble text in middle of line */}
                    <rect
                      x={(start.x + end.x) / 2 - 4}
                      y={(start.y + end.y) / 2 - 3}
                      width="8"
                      height="5"
                      rx="1"
                      fill="#1f2937"
                      stroke="rgba(56, 189, 248, 0.3)"
                      strokeWidth="0.2"
                    />
                    <text
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 + 0.8}
                      fill="var(--color-warning)"
                      fontSize="2.5"
                      textAnchor="middle"
                    >
                      {del.ttlDays}d
                    </text>
                  </g>
                );
              })}

              {/* Draw nodes */}
              {Object.keys(nodePositions).map((name) => {
                const node = nodePositions[name];
                const influence = calculateInfluence(name);
                const isInfluential = influence > 1;

                return (
                  <g key={name} style={{ cursor: 'pointer' }}>
                    {/* Outer pulse circle if node holds delegated power */}
                    {isInfluential && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={4 + influence * 0.8}
                        fill="rgba(56, 189, 248, 0.1)"
                        stroke="var(--color-accent)"
                        strokeWidth="0.2"
                      />
                    )}

                    {/* Node Core */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="4"
                      fill={isInfluential ? 'var(--color-accent)' : 'rgba(31, 41, 55, 0.9)'}
                      stroke={isInfluential ? 'white' : 'var(--border-color)'}
                      strokeWidth="0.8"
                    />

                    {/* Node text labels */}
                    <text
                      x={node.x}
                      y={node.y - 6}
                      fill="white"
                      fontSize="3.2"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {name}
                    </text>

                    <text
                      x={node.x}
                      y={node.y + 0.8}
                      fill={isInfluential ? '#030712' : 'var(--text-secondary)'}
                      fontSize="2.8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      w:{influence}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Action Panel: Manage and Create delegations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Create delegation Card */}
          <div className="glass-card" style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Delegar Voto (Simulación)</h3>
            <form
              onSubmit={handleAddDelegation}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>De (Usuario):</label>
                  <select
                    id="select-delegate-from"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    style={{
                      background: 'var(--bg-main)',
                      color: 'white',
                      border: '1px solid var(--border-color)',
                      padding: '8px',
                      borderRadius: '6px',
                    }}
                  >
                    {Object.keys(nodePositions).map((name) => (
                      <option key={name} value={name}>
                        {name} ({nodePositions[name].role})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Hacia (Experto):
                  </label>
                  <select
                    id="select-delegate-to"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    style={{
                      background: 'var(--bg-main)',
                      color: 'white',
                      border: '1px solid var(--border-color)',
                      padding: '8px',
                      borderRadius: '6px',
                    }}
                  >
                    {Object.keys(nodePositions).map((name) => (
                      <option key={name} value={name}>
                        {name} ({nodePositions[name].role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Tiempo de Vida de la Delegación (TTL):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    id="input-delegate-ttl"
                    type="range"
                    min="5"
                    max="120"
                    value={customTtl}
                    onChange={(e) => setCustomTtl(e.target.value)}
                    style={{ flex: 1, accentColor: 'var(--color-accent)' }}
                  />
                  <span
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--color-accent)',
                      fontWeight: 'bold',
                      width: '60px',
                    }}
                  >
                    {customTtl} días
                  </span>
                </div>
              </div>

              <button
                id="btn-submit-delegation"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                Registrar Delegación Temporal
              </button>
            </form>
          </div>

          {/* Active Delegations list */}
          <div className="glass-card" style={{ textAlign: 'left', flex: 1 }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>
              Delegaciones Activas en{' '}
              {domain === 'urbanismo'
                ? 'Urbanismo'
                : domain === 'finanzas'
                  ? 'Finanzas públicas'
                  : 'Gobernanza cívica'}
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '180px',
                overflowY: 'auto',
                paddingRight: '6px',
              }}
            >
              {delegations[domain].map((del, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: del.active ? 1 : 0.4,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '600', color: 'white' }}>{del.from}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>➔</span>
                    <span style={{ fontWeight: '600', color: 'var(--color-accent)' }}>{del.to}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '2px' }}>
                      {del.active ? `Expiración en ${del.ttlDays} días (TTL)` : 'Expirada / Revocada'}
                    </div>
                  </div>
                  {del.active && (
                    <button
                      id={`btn-revoke-delegation-${idx}`}
                      className="btn btn-danger"
                      onClick={() => handleRevoke(idx)}
                      style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      Revocar
                    </button>
                  )}
                </div>
              ))}

              {activeDelegations.length === 0 && (
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    padding: '16px 0',
                  }}
                >
                  No hay delegaciones activas en este dominio.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
