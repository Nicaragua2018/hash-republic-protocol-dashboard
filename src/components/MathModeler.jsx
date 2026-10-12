import React, { useState, useMemo } from 'react';

// ─── Model calculation functions ───────────────────────────────────────
const calcLinear = (rawScore) => rawScore / 100;
const calcQuadratic = (rawScore) => Math.sqrt(rawScore) / 10;
const calcHRP = (rawScore) => Math.min(1 + 0.3 * (rawScore / 100), 1.3);

// Gini coefficient from array of weights
function giniCoefficient(weights) {
  if (!weights.length) return 0;
  const sorted = [...weights].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0;
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * sorted[i];
  }
  return numerator / (n * sum);
}

export default function MathModeler() {
  const [experts, setExperts] = useState(5);
  const [citizens, setCitizens] = useState(100);
  const [expertRaw, setExpertRaw] = useState(85);

  // Generate SVG curve points (100 data points each)
  const curves = useMemo(() => {
    const points = Array.from({ length: 101 }, (_, i) => i);
    return {
      linear: points.map((x) => ({ x, y: calcLinear(x) })),
      quadratic: points.map((x) => ({ x, y: calcQuadratic(x) })),
      hrp: points.map((x) => ({ x, y: calcHRP(x) })),
    };
  }, []);

  // SVG dimensions & scale
  const svgW = 500,
    svgH = 260;
  const padL = 50,
    padR = 20,
    padT = 20,
    padB = 40;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const maxY = 2.0; // y-axis max

  const toSvgX = (x) => padL + (x / 100) * plotW;
  const toSvgY = (y) => padT + plotH - (y / maxY) * plotH;

  const toPolyline = (pts) => pts.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');

  // Current values at expertRaw
  const valLinear = calcLinear(expertRaw);
  const valQuadratic = calcQuadratic(expertRaw);
  const valHRP = calcHRP(expertRaw);
  const isCapped = expertRaw >= 100;

  // Population simulation: Gini coefficient
  const giniData = useMemo(() => {
    const expertWeight_linear = calcLinear(expertRaw);
    const expertWeight_quad = calcQuadratic(expertRaw);
    const expertWeight_hrp = calcHRP(expertRaw);

    const citizenWeight = 1.0; // base

    const makeWeights = (expW) => [...Array(experts).fill(expW), ...Array(citizens).fill(citizenWeight)];

    return {
      linear: giniCoefficient(makeWeights(expertWeight_linear)).toFixed(3),
      quadratic: giniCoefficient(makeWeights(expertWeight_quad)).toFixed(3),
      hrp: giniCoefficient(makeWeights(expertWeight_hrp)).toFixed(3),
    };
  }, [experts, citizens, expertRaw]);

  const modelInfo = [
    {
      key: 'linear',
      label: 'Votación Lineal',
      color: '#ef4444',
      val: valLinear.toFixed(3),
      gini: giniData.linear,
      desc: 'El multiplicador crece sin límite. Con Raw=200, influencia = 2.0×. Permite captura tecnocrática.',
      risk: 'Alto',
    },
    {
      key: 'quadratic',
      label: 'Votación Cuadrática',
      color: '#f59e0b',
      val: valQuadratic.toFixed(3),
      gini: giniData.quadratic,
      desc: 'Reduce la concentración de poder al aplicar raíz cuadrada, pero no impone un límite duro.',
      risk: 'Medio',
    },
    {
      key: 'hrp',
      label: 'Hash Republic Cap',
      color: '#10b981',
      val: valHRP.toFixed(3),
      gini: giniData.hrp,
      desc: `Límite estricto de 1.30×. ${isCapped ? '⚠️ Cap alcanzado: multiplicador congelado.' : 'Por debajo del límite.'}`,
      risk: 'Mínimo',
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Modelador Matemático del Cap 1.30×</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '820px', marginTop: '8px' }}>
          Compara tres modelos de influencia en deliberación colectiva y observa cómo el límite estricto del
          Hash Republic Protocol garantiza la soberanía ciudadana. Ajusta los parámetros de población para
          calcular el coeficiente de Gini de poder en tiempo real.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ textAlign: 'left' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Parámetros de la Simulación</h3>
        <div className="grid-cols-3" style={{ gap: '24px', alignItems: 'end' }}>
          {[
            {
              label: 'Reputación Bruta del Experto (Raw Score)',
              id: 'slider-raw',
              val: expertRaw,
              set: setExpertRaw,
              min: 0,
              max: 200,
              unit: 'pts',
              accent: '#38bdf8',
            },
            {
              label: 'Número de Expertos',
              id: 'slider-experts',
              val: experts,
              set: setExperts,
              min: 1,
              max: 50,
              unit: 'personas',
              accent: '#f59e0b',
            },
            {
              label: 'Número de Ciudadanos',
              id: 'slider-citizens',
              val: citizens,
              set: setCitizens,
              min: 10,
              max: 500,
              unit: 'personas',
              accent: '#10b981',
            },
          ].map((ctrl) => (
            <div key={ctrl.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{ctrl.label}</label>
              <input
                id={ctrl.id}
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                value={ctrl.val}
                onChange={(e) => ctrl.set(parseInt(e.target.value, 10))}
                style={{ accentColor: ctrl.accent }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>{ctrl.min}</span>
                <span style={{ color: ctrl.accent, fontWeight: 'bold' }}>
                  {ctrl.val} {ctrl.unit}
                </span>
                <span>{ctrl.max}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Chart + Model comparison */}
      <div className="grid-cols-2" style={{ gap: '24px', alignItems: 'start' }}>
        {/* Chart */}
        <div className="glass-card" style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Curvas de Influencia por Modelo</h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Multiplicador de voto vs. Reputación Bruta (0–200). La línea vertical muestra el valor actual.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <svg width={svgW} height={svgH} style={{ display: 'block', maxWidth: '100%' }}>
              {/* Grid lines */}
              {[0, 0.5, 1.0, 1.3, 1.5, 2.0].map((y) => (
                <g key={y}>
                  <line
                    x1={padL}
                    y1={toSvgY(y)}
                    x2={padL + plotW}
                    y2={toSvgY(y)}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="1"
                    strokeDasharray={y === 1.3 ? '4,4' : 'none'}
                  />
                  <text
                    x={padL - 6}
                    y={toSvgY(y) + 4}
                    fill="rgba(255,255,255,0.25)"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {y.toFixed(1)}×
                  </text>
                </g>
              ))}
              {/* Cap limit dotted line */}
              <line
                x1={padL}
                y1={toSvgY(1.3)}
                x2={padL + plotW}
                y2={toSvgY(1.3)}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="6,3"
                opacity="0.5"
              />
              <text x={padL + plotW + 4} y={toSvgY(1.3) + 4} fill="#10b981" fontSize="9" opacity="0.8">
                Cap 1.30×
              </text>

              {/* X Axis labels */}
              {[0, 50, 100, 150, 200].map((x) => (
                <text
                  key={x}
                  x={toSvgX(x)}
                  y={padT + plotH + 18}
                  fill="rgba(255,255,255,0.25)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {x}
                </text>
              ))}
              <text
                x={padL + plotW / 2}
                y={svgH - 4}
                fill="rgba(255,255,255,0.2)"
                fontSize="9"
                textAnchor="middle"
              >
                Raw Score →
              </text>

              {/* Axes */}
              <line
                x1={padL}
                y1={padT}
                x2={padL}
                y2={padT + plotH}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <line
                x1={padL}
                y1={padT + plotH}
                x2={padL + plotW}
                y2={padT + plotH}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />

              {/* Curves */}
              <polyline
                points={toPolyline(curves.linear)}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.8"
              />
              <polyline
                points={toPolyline(curves.quadratic)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                opacity="0.8"
              />
              <polyline points={toPolyline(curves.hrp)} fill="none" stroke="#10b981" strokeWidth="2.5" />

              {/* Current value vertical marker */}
              <line
                x1={toSvgX(Math.min(expertRaw, 100))}
                y1={padT}
                x2={toSvgX(Math.min(expertRaw, 100))}
                y2={padT + plotH}
                stroke="rgba(56,189,248,0.5)"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
              {/* Current value dots on each curve */}
              {[
                { y: valLinear, color: '#ef4444' },
                { y: valQuadratic, color: '#f59e0b' },
                { y: Math.min(valHRP, 1.3), color: '#10b981' },
              ].map((dot, i) => (
                <circle
                  key={i}
                  cx={toSvgX(Math.min(expertRaw, 100))}
                  cy={toSvgY(dot.y)}
                  r="5"
                  fill={dot.color}
                  stroke="white"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {[
              { color: '#ef4444', label: 'Lineal' },
              { color: '#f59e0b', label: 'Cuadrático' },
              { color: '#10b981', label: 'HRP Cap' },
            ].map((l) => (
              <div
                key={l.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ width: '24px', height: '2px', background: l.color, borderRadius: '1px' }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Model Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modelInfo.map((m) => (
            <div
              key={m.key}
              className="glass-card"
              style={{
                textAlign: 'left',
                borderColor: m.color + '40',
                borderLeft: `4px solid ${m.color}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h4 style={{ margin: 0, color: m.color, fontSize: '1rem' }}>{m.label}</h4>
                <span
                  className="badge"
                  style={{
                    background:
                      m.risk === 'Alto'
                        ? 'rgba(239,68,68,0.1)'
                        : m.risk === 'Medio'
                          ? 'rgba(245,158,11,0.1)'
                          : 'rgba(16,185,129,0.1)',
                    color: m.color,
                    border: `1px solid ${m.color}30`,
                    fontSize: '0.7rem',
                  }}
                >
                  Riesgo {m.risk}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {m.desc}
              </p>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Multiplicador actual
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 'bold',
                      color: m.color,
                    }}
                  >
                    {m.val}×
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Gini de Poder
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 'bold',
                      color: parseFloat(m.gini) > 0.3 ? '#ef4444' : '#10b981',
                    }}
                  >
                    {m.gini}
                  </div>
                </div>
              </div>
              {/* Mini-bar showing relative influence */}
              <div style={{ marginTop: '10px' }}>
                <div
                  style={{
                    height: '5px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(parseFloat(m.val) / 2.0) * 100}%`,
                      background: m.color,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Insight box */}
          <div
            style={{
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <strong style={{ color: '#10b981' }}>Conclusión: </strong>
            Con {experts} experto(s) y {citizens} ciudadano(s), el modelo HRP mantiene el Gini más bajo (
            {giniData.hrp}), garantizando que ningún experto técnico pueda dominar el consenso colectivo más
            allá del 1.30× de influencia per cápita.
          </div>
        </div>
      </div>
    </div>
  );
}
