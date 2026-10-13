import React, { useState } from 'react';

// Mock data for opinion clusters (Pol.is simulation)
const clusters = {
  A: {
    name: 'Prioridad a los barrios',
    count: 42,
    color: '#38bdf8', // Cyan
    stance:
      'Quieren destinar la mayor parte del fondo a calles, agua potable y alumbrado en los barrios con menos servicios, aunque eso retrase obras en el centro.',
    alignment: { s1: 90, s2: 92, s3: 30, s4: 60 },
  },
  B: {
    name: 'Prioridad a los espacios comunes',
    count: 38,
    color: '#10b981', // Emerald
    stance:
      'Prefieren parques, bibliotecas y centros comunitarios que beneficien a toda la ciudad, y apoyan ejecutar cuanto antes las obras que ya están diseñadas.',
    alignment: { s1: 30, s2: 85, s3: 70, s4: 88 },
  },
  C: {
    name: 'Prudencia fiscal',
    count: 25,
    color: '#f59e0b', // Gold
    stance:
      'Piden ir más despacio: reservar parte del fondo, auditar las obras de años anteriores y no comprometer el presupuesto de los años siguientes.',
    alignment: { s1: 20, s2: 95, s3: 5, s4: 40 },
  },
};

// Generate dots for the scatter plot
const dots = [
  // Cluster A dots
  { x: 30, y: 40, c: 'A' },
  { x: 35, y: 35, c: 'A' },
  { x: 25, y: 45, c: 'A' },
  { x: 28, y: 30, c: 'A' },
  { x: 42, y: 38, c: 'A' },
  { x: 20, y: 50, c: 'A' },
  { x: 38, y: 48, c: 'A' },
  { x: 32, y: 55, c: 'A' },
  { x: 45, y: 45, c: 'A' },
  { x: 40, y: 30, c: 'A' },
  // Cluster B dots
  { x: 70, y: 75, c: 'B' },
  { x: 75, y: 70, c: 'B' },
  { x: 65, y: 80, c: 'B' },
  { x: 68, y: 65, c: 'B' },
  { x: 80, y: 78, c: 'B' },
  { x: 72, y: 85, c: 'B' },
  { x: 85, y: 72, c: 'B' },
  { x: 60, y: 70, c: 'B' },
  { x: 78, y: 60, c: 'B' },
  { x: 82, y: 82, c: 'B' },
  // Cluster C dots
  { x: 75, y: 25, c: 'C' },
  { x: 80, y: 20, c: 'C' },
  { x: 70, y: 30, c: 'C' },
  { x: 85, y: 28, c: 'C' },
  { x: 78, y: 35, c: 'C' },
  { x: 88, y: 22, c: 'C' },
  { x: 72, y: 15, c: 'C' },
  { x: 65, y: 20, c: 'C' },
];

const initialStatements = [
  {
    id: 's1',
    text: 'Más del 60% del fondo participativo debe ir a los barrios con menos servicios básicos, aunque se retrasen otras obras.',
    consensus: 'No (Divisivo)',
    isConsensus: false,
    agreeCount: 41,
    totalCount: 105,
  },
  {
    id: 's2',
    text: 'Todas las obras financiadas deben publicar su avance y su gasto en un portal abierto, actualizado cada mes.',
    consensus: 'Sí (Consenso Cruzado)',
    isConsensus: true,
    agreeCount: 75,
    totalCount: 105,
  },
  {
    id: 's3',
    text: 'Es aceptable endeudar al municipio para adelantar este año las obras más votadas.',
    consensus: 'No (Divisivo)',
    isConsensus: false,
    agreeCount: 38,
    totalCount: 105,
  },
  {
    id: 's4',
    text: 'Una parte del fondo debe reservarse para propuestas presentadas por jóvenes menores de 25 años.',
    consensus: 'Sí (Consenso Mayoritario)',
    isConsensus: true,
    agreeCount: 68,
    totalCount: 105,
  },
];

export default function OpinionMap() {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [statements, setStatements] = useState(initialStatements);
  const [userVotes, setUserVotes] = useState({});

  const handleVote = (statementId, vote) => {
    setUserVotes((prev) => ({ ...prev, [statementId]: vote }));

    // Simular actualización de conteo al votar
    setStatements((prev) =>
      prev.map((st) => {
        if (st.id === statementId) {
          const hasVotedBefore = userVotes[statementId];
          let diff = 0;
          if (vote === 'agree') diff = 1;
          if (hasVotedBefore === 'agree' && vote !== 'agree') diff = -1;

          return {
            ...st,
            agreeCount: st.agreeCount + diff,
            totalCount: st.totalCount + (hasVotedBefore ? 0 : 1),
          };
        }
        return st;
      })
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header section */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Deliberación Estructurada (Pol.is Clusters)</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px', marginTop: '8px' }}>
          Visualización matemática de los debates comunitarios. Pol.is mapea opiniones basándose en el
          comportamiento de voto de los participantes, agrupando las posturas y detectando acuerdos
          transversales de forma determinista.
        </p>
      </div>

      {/* Main interactive grid */}
      <div className="grid-cols-2">
        {/* Interactive SVG Scatter Plot */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ textAlign: 'left', fontSize: '1.2rem', margin: 0 }}>
            Mapa del Consenso Colectivo (Principal Component Analysis)
          </h3>
          <p style={{ textAlign: 'left', fontSize: '0.85rem' }}>
            Cada punto representa a un participante de la consulta. La distancia representa desacuerdo
            ideológico. Haz clic en las etiquetas de los clusters para filtrarlos.
          </p>

          <div
            style={{
              position: 'relative',
              height: '320px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
            }}
          >
            {/* The Scatter Plot Area */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Highlight Circle for Selected Cluster */}
              {selectedCluster === 'A' && (
                <circle
                  cx="33"
                  cy="42"
                  r="18"
                  fill="rgba(56, 189, 248, 0.05)"
                  stroke="var(--color-accent)"
                  strokeDasharray="2,2"
                  strokeWidth="0.5"
                />
              )}
              {selectedCluster === 'B' && (
                <circle
                  cx="73"
                  cy="74"
                  r="18"
                  fill="rgba(16, 185, 129, 0.05)"
                  stroke="var(--color-success)"
                  strokeDasharray="2,2"
                  strokeWidth="0.5"
                />
              )}
              {selectedCluster === 'C' && (
                <circle
                  cx="77"
                  cy="24"
                  r="14"
                  fill="rgba(245, 158, 11, 0.05)"
                  stroke="var(--color-warning)"
                  strokeDasharray="2,2"
                  strokeWidth="0.5"
                />
              )}

              {/* Grid Lines */}
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

              {/* Dots */}
              {dots.map((dot, idx) => {
                const clusterInfo = clusters[dot.c];
                const isDimmed = selectedCluster && selectedCluster !== dot.c;
                return (
                  <circle
                    key={idx}
                    cx={dot.x}
                    cy={dot.y}
                    r={selectedCluster === dot.c ? '2.2' : '1.5'}
                    fill={clusterInfo.color}
                    opacity={isDimmed ? 0.15 : 0.85}
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onClick={() => setSelectedCluster(dot.c)}
                  >
                    <title>Participante del Cluster {dot.c}</title>
                  </circle>
                );
              })}
            </svg>

            {/* Axis labels */}
            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Dimensión 1 (Disposición a gastar)
            </span>
            <span
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Dimensión 2 (Prioridad a lo local)
            </span>
          </div>

          {/* Cluster filtering buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              id="btn-filter-all"
              className="btn btn-secondary"
              onClick={() => setSelectedCluster(null)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderColor: !selectedCluster ? 'var(--color-accent)' : 'var(--border-color)',
                boxShadow: !selectedCluster ? '0 0 10px rgba(56, 189, 248, 0.2)' : 'none',
              }}
            >
              Todos ({dots.length})
            </button>
            {Object.keys(clusters).map((key) => (
              <button
                key={key}
                id={`btn-filter-cluster-${key}`}
                className="btn btn-secondary"
                onClick={() => setSelectedCluster(key)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderColor: selectedCluster === key ? clusters[key].color : 'var(--border-color)',
                  boxShadow: selectedCluster === key ? `0 0 10px ${clusters[key].color}30` : 'none',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: clusters[key].color,
                    marginRight: '6px',
                  }}
                ></span>
                Group {key} ({clusters[key].count})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Cluster Info */}
        <div
          className="glass-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}
        >
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Análisis de la Postura Colectiva</h3>

          {selectedCluster ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <div>
                <h4
                  style={{
                    color: clusters[selectedCluster].color,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {clusters[selectedCluster].name}
                  <span
                    className="badge"
                    style={{
                      background: `${clusters[selectedCluster].color}15`,
                      color: clusters[selectedCluster].color,
                      border: `1px solid ${clusters[selectedCluster].color}30`,
                    }}
                  >
                    Cluster {selectedCluster}
                  </span>
                </h4>
                <p style={{ marginTop: '8px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {clusters[selectedCluster].stance}
                </p>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Aceptación de Declaraciones en el Grupo:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {statements.map((st) => {
                    const alignment = clusters[selectedCluster].alignment[st.id] || 0;
                    return (
                      <div key={st.id} style={{ fontSize: '0.85rem' }}>
                        <div
                          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}
                        >
                          <span
                            style={{
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              maxWidth: '80%',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {st.text}
                          </span>
                          <span
                            style={{
                              fontWeight: 'bold',
                              color:
                                alignment >= 70
                                  ? 'var(--color-success)'
                                  : alignment >= 40
                                    ? 'var(--color-accent)'
                                    : 'var(--color-danger)',
                            }}
                          >
                            {alignment}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: '4px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${alignment}%`,
                              background: clusters[selectedCluster].color,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
              }}
            >
              <svg
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                style={{ marginBottom: '16px', opacity: 0.5 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20c-2.202 0-4.29-.626-6.086-1.71m11-3.9a9 9 0 11-13.413-.087m13.413-.013c-.502-.917-.786-1.964-.786-3.07a8.914 8.914 0 00-.708-3.483m1.447 6.562a9.337 9.337 0 013.753-3.659M15 6.18a9.35 9.35 0 012.625.372 9.337 9.337 0 014.121-.952 4.125 4.125 0 00-7.533-2.493M13.007 8.756a8.9 8.9 0 00-2.918-.44 8.917 8.917 0 00-6 2.24"
                />
              </svg>
              <p>
                Selecciona un cluster en el gráfico de dispersión o haz clic en las etiquetas inferiores para
                auditar el perfil deliberativo detallado de cada agrupación.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Structured Deliberative statements voting area */}
      <div className="glass-card" style={{ textAlign: 'left' }}>
        <h3
          style={{
            marginBottom: '20px',
            fontSize: '1.25rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px',
          }}
        >
          Declaraciones clave de la consulta sobre el presupuesto participativo
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {statements.map((st) => {
            const hasVoted = userVotes[st.id];
            const currentPercentage = Math.round((st.agreeCount / st.totalCount) * 100);

            return (
              <div
                key={st.id}
                id={`statement-row-${st.id}`}
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <p
                    style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.98rem', flex: 1 }}
                  >
                    {st.text}
                  </p>
                  <span
                    className={`badge ${st.isConsensus ? 'badge-success' : 'badge-danger'}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {st.consensus}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  {/* Voting simulator button group */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      id={`btn-vote-agree-${st.id}`}
                      className="btn"
                      onClick={() => handleVote(st.id, 'agree')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        background: hasVoted === 'agree' ? 'var(--color-success)' : 'rgba(16, 185, 129, 0.1)',
                        color: hasVoted === 'agree' ? '#030712' : 'var(--color-success)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        fontWeight: 'bold',
                      }}
                    >
                      Acuerdo
                    </button>
                    <button
                      id={`btn-vote-disagree-${st.id}`}
                      className="btn"
                      onClick={() => handleVote(st.id, 'disagree')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        background:
                          hasVoted === 'disagree' ? 'var(--color-danger)' : 'rgba(239, 68, 68, 0.1)',
                        color: hasVoted === 'disagree' ? 'white' : 'var(--color-danger)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontWeight: 'bold',
                      }}
                    >
                      En Contra
                    </button>
                  </div>

                  {/* Summary progress bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: 1,
                      minWidth: '200px',
                      maxWidth: '400px',
                    }}
                  >
                    <span
                      style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}
                    >
                      Soporte Total:
                    </span>
                    <div
                      style={{
                        height: '8px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${currentPercentage}%`,
                          background: 'var(--color-accent)',
                        }}
                      ></div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-accent)',
                        fontWeight: 'bold',
                        width: '35px',
                        textAlign: 'right',
                      }}
                    >
                      {currentPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
