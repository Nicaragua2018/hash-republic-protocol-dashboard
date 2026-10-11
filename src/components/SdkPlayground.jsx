import React, { useState, useRef, useEffect } from 'react';

// ─── Snippet catalogue ──────────────────────────────────────────────────
const snippets = [
  {
    id: 'init',
    lang: 'javascript',
    label: '01 — Init Protocol Session',
    desc: 'Inicializa una sesión del protocolo con metadatos de dominio.',
    code: `import { HashRepublicProtocol } from '@opencivic/hrp-sdk';

// Initialize a session for a participatory budgeting consultation
const hrp = new HashRepublicProtocol({
  domain: 'municipio.presupuesto-participativo',
  version: '0.3',
  readiness_target: 'R2',
  anchors: ['opentimestamps', 'bitcoin-op-return']
});

const session = await hrp.initSession({
  started_at: new Date().toISOString(),
  operators: ['alice', 'bob', 'carol']
});

console.log('[HRP] Session initialized:', session.id);
console.log('[HRP] Domain:', session.domain);
console.log('[HRP] Anchor providers:', session.anchors.join(', '));`,
    logs: [
      { t: 100, msg: '[HRP SDK v0.3.0] Loading protocol configuration...', type: 'info' },
      { t: 280, msg: '[HRP] Validating domain schema: municipio.presupuesto-participativo ✓', type: 'success' },
      { t: 450, msg: '[HRP] Registering anchor provider: opentimestamps', type: 'info' },
      { t: 620, msg: '[HRP] Registering anchor provider: bitcoin-op-return', type: 'info' },
      { t: 820, msg: '[HRP] Session initialized: sess_7f3a8b2c9e1d4f06', type: 'success' },
      { t: 900, msg: '[HRP] Domain: municipio.presupuesto-participativo', type: 'log' },
      { t: 980, msg: '[HRP] Anchor providers: opentimestamps, bitcoin-op-return', type: 'log' },
    ]
  },
  {
    id: 'reputation',
    lang: 'javascript',
    label: '02 — Compute Reputation Score',
    desc: 'Calcula el multiplicador de reputación con el límite del protocolo (max 1.30×).',
    code: `import { ReputationEngine } from '@opencivic/hrp-sdk';

const engine = new ReputationEngine({ max_multiplier: 1.30 });

// Evidence-based reputation: contributions from different sources
const alice = await engine.compute({
  participant: 'alice',
  domain: 'urban-planning',
  evidence: [
    { type: 'github_commits', value: 47, weight: 0.4 },
    { type: 'technical_reviews', value: 12, weight: 0.35 },
    { type: 'published_papers', value: 2, weight: 0.25 }
  ]
});

console.log('[Reputation] Raw Score:', alice.raw_score);
console.log('[Reputation] Multiplier:', alice.multiplier + '×');
console.log('[Reputation] Capped:', alice.capped);
console.log('[Reputation] Snapshot hash:', alice.snapshot_hash);`,
    logs: [
      { t: 80, msg: '[ReputationEngine] Initializing with max_multiplier=1.30', type: 'info' },
      { t: 200, msg: '[ReputationEngine] Computing score for: alice (domain: urban-planning)', type: 'info' },
      { t: 380, msg: '[Evidence] github_commits: 47 → weighted score: 18.8', type: 'log' },
      { t: 540, msg: '[Evidence] technical_reviews: 12 → weighted score: 4.2', type: 'log' },
      { t: 700, msg: '[Evidence] published_papers: 2 → weighted score: 0.5', type: 'log' },
      { t: 870, msg: '[Reputation] Raw Score: 115.2', type: 'log' },
      { t: 1000, msg: '[Reputation] Multiplier: 1.300× (⚠️ Cap reached — clamped)', type: 'warning' },
      { t: 1100, msg: '[Reputation] Snapshot hash: sha256:a1b2c3d4...', type: 'success' },
    ]
  },
  {
    id: 'canonical',
    lang: 'javascript',
    label: '03 — Generate Canonical Report',
    desc: 'Construye el reporte canónico determinista con todas las capas del protocolo.',
    code: `import { CanonicalReportEngine } from '@opencivic/hrp-sdk';

const engine = new CanonicalReportEngine();

// Build canonical report from all pipeline artifacts
const report = await engine.build({
  domain: 'municipio.presupuesto-participativo',
  sources: {
    polis_export_hash: 'sha256:d5c7f8a9...',
    synthesis_hash: 'sha256:c9b8a7f6...',
    reputation_snapshot_hash: 'sha256:8f7e6d5c...',
    delegation_snapshot_hash: 'sha256:a1b2c3d4...',
    riskguard_hash: 'sha256:3d2c1b0a...'
  }
});

// Compute SHA-256 hash of canonical report
const sha256 = await engine.hash(report);
console.log('[Canonical] Report hash:', sha256);
console.log('[Canonical] Deterministic:', report.deterministic);`,
    logs: [
      { t: 100, msg: '[CanonicalReportEngine] Initializing build pipeline...', type: 'info' },
      { t: 250, msg: '[Canonical] Sorting JSON keys (RFC 8785 normalization)...', type: 'info' },
      { t: 400, msg: '[Canonical] Validating source hashes: 5/5 ✓', type: 'success' },
      { t: 580, msg: '[Canonical] Generating deterministic JSON...', type: 'info' },
      { t: 750, msg: '[Canonical] Encoding: UTF-8, no trailing whitespace ✓', type: 'log' },
      { t: 900, msg: '[Canonical] Computing SHA-256...', type: 'info' },
      { t: 1050, msg: '[Canonical] Report hash: sha256:f7a93ec8b2d14a0c...', type: 'success' },
      { t: 1150, msg: '[Canonical] Deterministic: true ✓', type: 'success' },
    ]
  },
  {
    id: 'timestamp',
    lang: 'python',
    label: '04 — Anchor to OpenTimestamps',
    desc: 'Ancla el hash del reporte en Bitcoin vía OpenTimestamps para prueba de existencia.',
    code: `import hrp_sdk as hrp
from hrp_sdk.anchors import OpenTimestamps, BitcoinOpReturn

# Load canonical report hash
report_hash = "sha256:f7a93ec8b2d14a0c9e5f6b7c8d9e0a1b"

# Anchor via OpenTimestamps (free, uses Bitcoin merkle proofs)
ots = OpenTimestamps()
proof = await ots.stamp(report_hash)

print(f"[OTS] Calendar timestamp: {proof.calendar_url}")
print(f"[OTS] Pending confirmation in Bitcoin block")
print(f"[OTS] Proof file saved: {proof.file_path}")

# Optional: direct OP_RETURN embedding
op_return = BitcoinOpReturn(fee_rate_sat_vb=5)
txid = await op_return.broadcast(report_hash[:40])
print(f"[BTC] TXID: {txid}")
print(f"[BTC] Status: pending mempool confirmation")`,
    logs: [
      { t: 120, msg: '[HRP SDK] Loading anchoring module...', type: 'info' },
      { t: 280, msg: '[OTS] Connecting to OpenTimestamps calendar server...', type: 'info' },
      { t: 460, msg: '[OTS] Submitting hash: sha256:f7a93ec8b2d14a0c...', type: 'info' },
      { t: 640, msg: '[OTS] Calendar timestamp: https://alice.btc.calendar.opentimestamps.org', type: 'success' },
      { t: 820, msg: '[OTS] Pending confirmation in Bitcoin block #842107', type: 'log' },
      { t: 980, msg: '[OTS] Proof file saved: ./proofs/f7a93ec8.ots', type: 'success' },
      { t: 1100, msg: '[BTC] Broadcasting OP_RETURN transaction (fee: 5 sat/vB)...', type: 'info' },
      { t: 1280, msg: '[BTC] TXID: d8c47f8b9e0231aa3b4c5d6e7f8a9c0b1122334455', type: 'success' },
      { t: 1400, msg: '[BTC] Status: pending mempool confirmation (~10 min)', type: 'warning' },
    ]
  }
];

// ─── Component ──────────────────────────────────────────────────────────
export default function SdkPlayground() {
  const [activeSnippet, setActiveSnippet] = useState(snippets[0]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [done, setDone] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const runSnippet = () => {
    setRunning(true);
    setDone(false);
    setLogs([]);

    const snippet = activeSnippet;
    let completed = 0;

    snippet.logs.forEach((entry) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { ...entry, ts: new Date().toLocaleTimeString() }]);
        completed++;
        if (completed === snippet.logs.length) {
          setRunning(false);
          setDone(true);
        }
      }, entry.t);
    });
  };

  const clearLogs = () => {
    setLogs([]);
    setDone(false);
  };

  const logColors = { info: '#38bdf8', success: '#10b981', warning: '#f59e0b', log: '#9ca3af' };
  const logPrefixes = { info: 'ℹ', success: '✓', warning: '⚠', log: '›' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Header */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>SDK Playground</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '820px', marginTop: '8px' }}>
          Explora la API del Hash Republic Protocol con ejemplos de código reales. Selecciona un snippet, ejecútalo y observa los logs simulados de cada módulo del protocolo.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span className="badge badge-info">JavaScript</span>
          <span className="badge badge-success">Python</span>
          <span className="badge" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>@opencivic/hrp-sdk v0.3</span>
        </div>
      </div>

      {/* Snippet tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {snippets.map(s => (
          <button
            key={s.id}
            id={`snippet-tab-${s.id}`}
            onClick={() => { setActiveSnippet(s); clearLogs(); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeSnippet.id === s.id ? 'rgba(56,189,248,0.1)' : 'rgba(31,41,55,0.5)',
              border: activeSnippet.id === s.id ? '1px solid rgba(56,189,248,0.4)' : '1px solid var(--border-color)',
              color: activeSnippet.id === s.id ? 'var(--color-accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '0.825rem',
              fontWeight: activeSnippet.id === s.id ? '600' : '400',
              transition: 'all 0.2s ease'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main playground layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

        {/* Code Editor area */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Editor top bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* macOS-style traffic lights */}
              {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => (
                <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginLeft: '8px' }}>
                {activeSnippet.id}.{activeSnippet.lang === 'python' ? 'py' : 'js'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge" style={{
                background: activeSnippet.lang === 'python' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                color: activeSnippet.lang === 'python' ? '#60a5fa' : '#f59e0b',
                border: `1px solid ${activeSnippet.lang === 'python' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'}`,
                fontSize: '0.7rem'
              }}>
                {activeSnippet.lang === 'python' ? 'Python 3.12' : 'ES2025'}
              </span>
            </div>
          </div>

          {/* Code display */}
          <pre style={{
            margin: 0,
            padding: '24px',
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            fontSize: '0.875rem',
            lineHeight: '1.7',
            color: '#e2e8f0',
            background: 'rgba(0,0,0,0.2)',
            overflowX: 'auto',
            whiteSpace: 'pre',
            minHeight: '280px'
          }}>
            <code>{activeSnippet.code}</code>
          </pre>

          {/* Run button bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{activeSnippet.desc}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                id="btn-clear-logs"
                className="btn btn-secondary"
                onClick={clearLogs}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                disabled={running}
              >
                Limpiar
              </button>
              <button
                id="btn-run-snippet"
                className="btn btn-primary"
                onClick={runSnippet}
                disabled={running}
                style={{ padding: '6px 16px', fontSize: '0.8rem', opacity: running ? 0.7 : 1 }}
              >
                {running ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      display: 'inline-block', width: '12px', height: '12px',
                      border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#030712',
                      borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                    }} />
                    Ejecutando...
                  </span>
                ) : '▶ Ejecutar'}
              </button>
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Terminal header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            background: 'rgba(0,0,0,0.4)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>HRP Console Output</span>
            {done && <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>Ejecución completada</span>}
            {running && <span className="badge badge-info" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>Ejecutando...</span>}
          </div>

          {/* Log entries */}
          <div style={{
            minHeight: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '16px',
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            fontSize: '0.825rem',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {logs.length === 0 && (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {running ? 'Inicializando entorno de ejecución...' : '// Presiona ▶ Ejecutar para ver los logs del protocolo'}
              </span>
            )}
            {logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', animation: 'fadeIn 0.2s ease' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', flexShrink: 0, marginTop: '1px' }}>{log.ts}</span>
                <span style={{ color: logColors[log.type], flexShrink: 0 }}>{logPrefixes[log.type]}</span>
                <span style={{ color: log.type === 'success' ? '#e2e8f0' : log.type === 'warning' ? '#fcd34d' : '#9ca3af', wordBreak: 'break-all' }}>
                  {log.msg}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
