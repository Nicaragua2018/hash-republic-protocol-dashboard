import React, { useState } from 'react';

// ─── Data ──────────────────────────────────────────────────────────────
const whitepaperSections = [
  {
    id: 'abstract',
    title: '§ Abstract',
    tag: 'Fundacional',
    tagColor: '#38bdf8',
    content: `Las comunidades abiertas —software libre, protocolos descentralizados, movimientos cívicos digitales— deben coordinar decisiones complejas sin jerarquías formales ni instituciones centrales.

Los debates actuales (foros, listas de correo, redes sociales) producen señales de consenso ambiguas, difíciles de auditar y fáciles de manipular.

Hash Republic Protocol introduce una nueva categoría: **infraestructura de observabilidad del consenso**. Convierte deliberación colectiva en artefactos criptográficamente verificables sin imponer decisiones vinculantes.`,
    ascii: `
  [Social Deliberation]
         │
         ▼
  ┌─────────────────┐
  │  Hash Republic  │ ◄── Protocolo abierto
  │    Protocol     │
  └─────────────────┘
         │
         ▼
  [Cryptographic Evidence]`
  },
  {
    id: 'pipeline',
    title: '§ Pipeline de 8 Capas',
    tag: 'Arquitectura',
    tagColor: '#10b981',
    content: `El protocolo se organiza como una pila modular de ocho capas independientemente auditables. Cada capa tiene responsabilidades específicas, produce artefactos verificables y puede ser reemplazada o actualizada sin afectar las demás.`,
    ascii: `
  ┌────────────────────────────┐
  │  Citizen Participation     │ ← Entrada ciudadana
  ├────────────────────────────┤
  │  Structured Deliberation   │ ← Pol.is compatible
  ├────────────────────────────┤
  │  AI Synthesis Layer        │ ← Trazable, no vinculante
  ├────────────────────────────┤
  │  Reputation Engine         │ ← Max 1.30× multiplicador
  ├────────────────────────────┤
  │  Liquid Delegation         │ ← TTL revocable
  ├────────────────────────────┤
  │  RiskGuard                 │ ← Alertas de captura
  ├────────────────────────────┤
  │  Canonical Report Engine   │ ← JSON determinista
  ├────────────────────────────┤
  │  Cryptographic Anchoring   │ ← SHA-256 + Bitcoin
  └────────────────────────────┘`
  },
  {
    id: 'principles',
    title: '§ 20 Principios Constitucionales',
    tag: 'Gobernanza',
    tagColor: '#f59e0b',
    content: `El protocolo se basa en veinte principios que impiden la captura institucional. Los ocho más críticos son:

1. **Identidad ≠ Reputación** — Tener identidad no otorga influencia.
2. **Reputación ≠ Soberanía** — La competencia técnica no da poder absoluto.
3. **Delegación ≠ Sumisión** — Delegar el voto es revocable en cualquier momento.
4. **IA ≠ Autoridad** — La síntesis de IA es informativa, nunca decisoria.
5. **Consenso ≠ Coerción** — Las señales no son votos vinculantes.
6. **Señales ≠ Votos Vinculantes** — El sistema publica evidencia, la comunidad decide.
7. **Auditoría protege la delegación** — Todo grafo de poder es público.
8. **Verificabilidad = Autoridad** — Solo la prueba criptográfica es fuente de verdad.`,
    ascii: `
  Democracia  ──► Soberanía
  Meritocracia ──► Competencia
  Criptografía ──► Prueba
  Constitución ──► Límites`
  },
  {
    id: 'security',
    title: '§ Modelo de Seguridad',
    tag: 'Seguridad',
    tagColor: '#ef4444',
    content: `El protocolo define explícitamente su superficie de ataque y no almacena datos sensibles.

**No almacena:** claves privadas, identidades desanonimizadas, listas de wallets, datos de targeting.

**Amenazas mitigadas:**
- **Sybil attacks** → Reputación basada en evidencia verificable.
- **Captura por delegación** → TTL obligatorio + límite 1.30×.
- **Supresión de minorías** → Preservación de clusters disidentes en reportes canónicos.
- **Manipulación de IA** → Síntesis trazable a datos de origen.`,
    ascii: `
  [Amenaza]         [Mitigación]
  Sybil         →  Evidence-based reputation
  Delegation    →  TTL + 1.30× cap
  AI Halluc.    →  Traceable synthesis
  Tampering     →  SHA-256 + Timestamp`
  },
  {
    id: 'roadmap',
    title: '§ Roadmap del Protocolo',
    tag: 'Desarrollo',
    tagColor: '#a78bfa',
    content: `La implementación se organiza en cuatro fases progresivas, cada una añadiendo capacidades deliberativas más sofisticadas.`,
    ascii: `
  Fase 1 ✓  Canonical Report + SHA-256 + Timestamp
  Fase 2 ⬤  Pol.is Integration + Synthesis Layer
  Fase 3 ○  Delegation Engine + Reputation Scoring
  Fase 4 ○  RiskGuard + Public Explorer + API

  Primer producto: Bitcoin Quantum Readiness Observatory`
  }
];

const dataFlowSteps = [
  { id: 0, label: 'Citizen Input', desc: 'Declaraciones, opiniones y votos de participantes.', output: 'deliberation_dataset.json', color: '#38bdf8' },
  { id: 1, label: 'Pol.is Clustering', desc: 'Análisis de componentes principales que agrupa comportamientos de voto similares.', output: 'clusters.json + consensus_statements.json', color: '#38bdf8' },
  { id: 2, label: 'AI Synthesis', desc: 'LLM trazable extrae temas, preocupaciones minoritarias y preguntas abiertas.', output: 'synthesis.json + synthesis_hash', color: '#10b981' },
  { id: 3, label: 'Reputation Engine', desc: 'Calcula multiplicadores (máx 1.30×) basados en GitHub, papers, revisiones.', output: 'reputation_snapshot.json', color: '#10b981' },
  { id: 4, label: 'Delegation Engine', desc: 'Aplica pesos de delegación líquida con TTL. Detecta ciclos y acumulaciones.', output: 'delegation_snapshot.json', color: '#f59e0b' },
  { id: 5, label: 'RiskGuard', desc: 'Mide concentración de poder y emite alertas si supera umbrales.', output: 'riskguard_report.json', color: '#f59e0b' },
  { id: 6, label: 'Canonical Report', desc: 'Serialización determinista JSON con claves ordenadas y UTF-8 estricto.', output: 'canonical_report.json', color: '#a78bfa' },
  { id: 7, label: 'SHA-256 + Anchor', desc: 'Hash criptográfico del reporte anclado en OpenTimestamps o Bitcoin OP_RETURN.', output: 'report_hash + timestamp_proof', color: '#ef4444' },
];

// ─── Component ─────────────────────────────────────────────────────────
export default function InteractiveSpecs() {
  const [openSection, setOpenSection] = useState('abstract');
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Header */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Hash Republic Protocol</h1>
          <span className="badge badge-info">Whitepaper v0.3</span>
          <span className="badge badge-success">MIT License</span>
        </div>
        <p style={{ fontSize: '1.05rem', maxWidth: '820px' }}>
          Explorador interactivo de la especificación técnica. Navega por las secciones del whitepaper y visualiza el flujo completo de datos del protocolo, paso a paso.
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>

        {/* ── Whitepaper Accordion ── */}
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', textAlign: 'left' }}>Especificación Técnica Interactiva</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {whitepaperSections.map(sec => {
              const isOpen = openSection === sec.id;
              return (
                <div
                  key={sec.id}
                  className="glass-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderColor: isOpen ? sec.tagColor + '60' : 'var(--border-color)',
                    boxShadow: isOpen ? `0 0 20px ${sec.tagColor}15` : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Accordion Header */}
                  <button
                    id={`spec-toggle-${sec.id}`}
                    onClick={() => setOpenSection(isOpen ? null : sec.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 24px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1rem', color: isOpen ? sec.tagColor : 'var(--text-primary)' }}>
                        {sec.title}
                      </span>
                      <span className="badge" style={{ background: sec.tagColor + '15', color: sec.tagColor, border: `1px solid ${sec.tagColor}30`, fontSize: '0.7rem' }}>
                        {sec.tag}
                      </span>
                    </div>
                    <svg width="20" height="20" fill="none" stroke={isOpen ? sec.tagColor : 'var(--text-muted)'} strokeWidth="2" viewBox="0 0 24 24"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Accordion Content */}
                  {isOpen && (
                    <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
                      {/* Markdown-style content */}
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        {sec.content.split('\n\n').map((para, i) => {
                          const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong style="color:white">$1</strong>');
                          return (
                            <p key={i} style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.7' }}
                              dangerouslySetInnerHTML={{ __html: formatted }} />
                          );
                        })}
                      </div>
                      {/* ASCII diagram */}
                      <pre style={{
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        background: 'rgba(0,0,0,0.4)',
                        border: `1px solid ${sec.tagColor}30`,
                        borderLeft: `3px solid ${sec.tagColor}`,
                        padding: '16px',
                        borderRadius: '6px',
                        color: sec.tagColor,
                        overflowX: 'auto',
                        margin: 0,
                        lineHeight: '1.6'
                      }}>
                        {sec.ascii.trim()}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Interactive Data Flow ── */}
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', textAlign: 'left' }}>Flujo de Datos Verificable (Paso a Paso)</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'left' }}>
            Haz clic en cada etapa del pipeline para ver los artefactos de salida que produce y su rol en la cadena de verificabilidad.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {dataFlowSteps.map((step, idx) => {
              const isActive = activeStep === step.id;
              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}>

                  {/* Timeline connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', flexShrink: 0 }}>
                    <button
                      id={`flow-step-${step.id}`}
                      onClick={() => setActiveStep(isActive ? null : step.id)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isActive ? step.color : 'rgba(31,41,55,0.9)',
                        border: `2px solid ${step.color}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        color: isActive ? '#030712' : step.color,
                        boxShadow: isActive ? `0 0 12px ${step.color}60` : 'none',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                        zIndex: 1
                      }}
                    >
                      {step.id + 1}
                    </button>
                    {idx < dataFlowSteps.length - 1 && (
                      <div style={{
                        width: '2px',
                        flex: 1,
                        minHeight: '24px',
                        background: `linear-gradient(to bottom, ${step.color}60, ${dataFlowSteps[idx + 1].color}30)`,
                        margin: '4px 0'
                      }} />
                    )}
                  </div>

                  {/* Step content */}
                  <div style={{ flex: 1, paddingLeft: '16px', paddingBottom: idx < dataFlowSteps.length - 1 ? '16px' : '0' }}>
                    <div
                      className={isActive ? 'glass-card' : ''}
                      style={{
                        padding: isActive ? '16px' : '4px 0 0 0',
                        background: isActive ? `${step.color}08` : 'transparent',
                        borderColor: isActive ? `${step.color}40` : 'transparent',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveStep(isActive ? null : step.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isActive ? '10px' : '0' }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: isActive ? step.color : 'var(--text-primary)'
                        }}>
                          {step.label}
                        </span>
                      </div>
                      {isActive && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.2s ease' }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{step.desc}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Output:</span>
                            <code style={{
                              fontSize: '0.78rem',
                              background: 'rgba(0,0,0,0.3)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              color: step.color,
                              border: `1px solid ${step.color}20`
                            }}>
                              {step.output}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
