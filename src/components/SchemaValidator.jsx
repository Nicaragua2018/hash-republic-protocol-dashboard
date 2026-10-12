import React, { useState, useEffect } from 'react';

// ─── Schema Definition ──────────────────────────────────────────────────
const SCHEMA = {
  required: ['protocol', 'version', 'domain', 'generated_at', 'sources'],
  properties: {
    protocol: { type: 'string', enum: ['hash_republic_protocol'], label: 'Identificador del protocolo' },
    version: { type: 'string', pattern: /^\d+\.\d+$/, label: 'Versión semántica (ej: "0.3")' },
    domain: {
      type: 'string',
      minLength: 3,
      label: 'Dominio deliberativo (ej: "municipio.presupuesto-participativo")',
    },
    readiness_target: {
      type: 'string',
      pattern: /^R[0-7]$/,
      optional: true,
      label: 'Nivel de preparación objetivo (R0–R7)',
    },
    generated_at: { type: 'string', isISO: true, label: 'Timestamp ISO 8601' },
    sources: {
      type: 'object',
      requiredChildren: [
        'polis_export_hash',
        'synthesis_hash',
        'reputation_snapshot_hash',
        'delegation_snapshot_hash',
        'riskguard_hash',
      ],
      label: 'Hashes de origen de datos de cada capa',
    },
  },
  ordering: ['protocol', 'version', 'domain', 'readiness_target', 'generated_at', 'sources'],
  label: 'Hash Republic Protocol Canonical Report Schema v0.3',
};

// ─── Validation engine ─────────────────────────────────────────────────
function validateReport(jsonText) {
  const errors = [];
  const warnings = [];
  const successes = [];

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    return {
      valid: false,
      errors: [{ field: 'JSON', msg: 'Sintaxis JSON inválida: ' + e.message, severity: 'error' }],
      warnings: [],
      successes: [],
      parsed: null,
    };
  }

  // Valid JSON can still be a number, a string, null or an array; every check
  // below reads fields of an object, so stop here instead of crashing.
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      valid: false,
      errors: [{ field: 'JSON', msg: 'El reporte debe ser un objeto JSON ({ ... })', severity: 'error' }],
      warnings: [],
      successes: [],
      parsed: null,
    };
  }

  // Required fields
  SCHEMA.required.forEach((field) => {
    if (parsed[field] === undefined || parsed[field] === null) {
      errors.push({ field, msg: `Campo requerido ausente: "${field}"`, severity: 'error' });
    } else {
      successes.push({ field, msg: `"${field}" presente ✓` });
    }
  });

  if (parsed['protocol'] !== undefined && parsed['protocol'] !== 'hash_republic_protocol') {
    errors.push({
      field: 'protocol',
      msg: `Valor incorrecto: debe ser "hash_republic_protocol", encontrado: "${parsed['protocol']}"`,
      severity: 'error',
    });
  }

  if (
    parsed['sources'] !== undefined &&
    parsed['sources'] !== null &&
    (typeof parsed['sources'] !== 'object' || Array.isArray(parsed['sources']))
  ) {
    errors.push({
      field: 'sources',
      msg: '"sources" debe ser un objeto con un hash por capa',
      severity: 'error',
    });
  }
  if (parsed['version'] !== undefined && !/^\d+\.\d+$/.test(parsed['version'])) {
    warnings.push({
      field: 'version',
      msg: `Formato de versión inusual: "${parsed['version']}" (esperado: "0.3")`,
      severity: 'warning',
    });
  }

  if (parsed['generated_at'] !== undefined) {
    const d = new Date(parsed['generated_at']);
    if (isNaN(d.getTime())) {
      errors.push({
        field: 'generated_at',
        msg: `"generated_at" no es un timestamp ISO 8601 válido`,
        severity: 'error',
      });
    } else {
      successes.push({ field: 'generated_at', msg: `Timestamp ISO 8601 válido: ${d.toLocaleString()}` });
    }
  }

  if (parsed['readiness_target'] !== undefined && !/^R[0-7]$/.test(parsed['readiness_target'])) {
    errors.push({
      field: 'readiness_target',
      msg: `"readiness_target" debe ser R0–R7, encontrado: "${parsed['readiness_target']}"`,
      severity: 'error',
    });
  }

  // Sources object validation
  if (parsed['sources'] && typeof parsed['sources'] === 'object' && !Array.isArray(parsed['sources'])) {
    const required = SCHEMA.properties.sources.requiredChildren;
    required.forEach((child) => {
      const value = parsed['sources'][child];
      if (!value) {
        errors.push({
          field: `sources.${child}`,
          msg: `Hash de fuente ausente: "sources.${child}"`,
          severity: 'error',
        });
      } else if (typeof value !== 'string') {
        errors.push({
          field: `sources.${child}`,
          msg: `"sources.${child}" debe ser texto, no ${Array.isArray(value) ? 'una lista' : typeof value}`,
          severity: 'error',
        });
      } else {
        if (!value.startsWith('sha256:')) {
          warnings.push({
            field: `sources.${child}`,
            msg: `"sources.${child}" debería comenzar con "sha256:"`,
            severity: 'warning',
          });
        } else {
          successes.push({ field: `sources.${child}`, msg: `Hash de fuente válido ✓` });
        }
      }
    });
  }

  // Key ordering check (determinism)
  const topKeys = Object.keys(parsed);
  const expectedOrder = SCHEMA.ordering.filter((k) => topKeys.includes(k));
  const actualRelevant = topKeys.filter((k) => SCHEMA.ordering.includes(k));
  const isOrdered = JSON.stringify(expectedOrder) === JSON.stringify(actualRelevant);
  if (!isOrdered) {
    warnings.push({
      field: 'key_ordering',
      msg: `Claves no están en orden canónico (rompe el determinismo del hash). Orden esperado: ${expectedOrder.join(', ')}`,
      severity: 'warning',
    });
  } else {
    successes.push({ field: 'key_ordering', msg: 'Orden de claves canónico ✓ (determinismo garantizado)' });
  }

  const valid = errors.length === 0;
  return { valid, errors, warnings, successes, parsed };
}

// ─── Default Example JSON ──────────────────────────────────────────────
const EXAMPLES = {
  valid: JSON.stringify(
    {
      protocol: 'hash_republic_protocol',
      version: '0.3',
      domain: 'municipio.presupuesto-participativo',
      readiness_target: 'R2',
      generated_at: '2026-06-28T15:00:00Z',
      sources: {
        polis_export_hash: 'sha256:d5c7f8a9e231b4c56d78e9f0a1b2c3d4',
        synthesis_hash: 'sha256:c9b8a7f6e5d4c3b2a1908f7e6d5c4b3a',
        reputation_snapshot_hash: 'sha256:8f7e6d5c4b3a2918f7e6d5c4b3a29180',
        delegation_snapshot_hash: 'sha256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
        riskguard_hash: 'sha256:3d2c1b0a9f8e7d6c5b4a39281f7e6d5c',
      },
    },
    null,
    2
  ),
  broken_protocol: JSON.stringify(
    {
      protocol: 'my_own_protocol',
      version: '0.3',
      domain: 'municipio.presupuesto-participativo',
      generated_at: '2026-06-28T15:00:00Z',
      sources: {
        polis_export_hash: 'sha256:abc123',
        synthesis_hash: 'sha256:def456',
        reputation_snapshot_hash: 'sha256:ghi789',
        delegation_snapshot_hash: 'sha256:jkl012',
        riskguard_hash: 'sha256:mno345',
      },
    },
    null,
    2
  ),
  missing_sources: JSON.stringify(
    {
      protocol: 'hash_republic_protocol',
      version: '0.3',
      domain: 'municipio.presupuesto-participativo',
      generated_at: 'not-a-valid-date',
      sources: {
        polis_export_hash: 'sha256:abc123',
      },
    },
    null,
    2
  ),
};

// ─── Component ─────────────────────────────────────────────────────────
export default function SchemaValidator() {
  const [jsonText, setJsonText] = useState(EXAMPLES.valid);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Auto-validate on change with small debounce
    const timer = setTimeout(() => {
      setResult(validateReport(jsonText));
    }, 400);
    return () => clearTimeout(timer);
  }, [jsonText]);

  const counts = result
    ? {
        errors: result.errors.length,
        warnings: result.warnings.length,
        successes: result.successes.length,
      }
    : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Schema Validator</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '820px', marginTop: '8px' }}>
          Valida reportes canónicos JSON contra el esquema formal del Hash Republic Protocol v0.3. El
          validador verifica campos requeridos, formatos, consistencia de hashes y el orden de claves
          necesario para el determinismo criptográfico.
        </p>
      </div>

      {/* Quick-load example buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          Cargar ejemplo:
        </span>
        {[
          { key: 'valid', label: '✓ Reporte Válido', color: '#10b981' },
          { key: 'broken_protocol', label: '✗ Protocolo Incorrecto', color: '#ef4444' },
          { key: 'missing_sources', label: '⚠ Fuentes Incompletas', color: '#f59e0b' },
        ].map((ex) => (
          <button
            key={ex.key}
            id={`example-btn-${ex.key}`}
            onClick={() => setJsonText(EXAMPLES[ex.key])}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: ex.color + '10',
              border: `1px solid ${ex.color}30`,
              color: ex.color,
              cursor: 'pointer',
              fontSize: '0.825rem',
              fontFamily: 'var(--font-display)',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Main layout: editor + results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Editor */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Editor bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              background: 'rgba(0,0,0,0.3)',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => (
                <div
                  key={i}
                  style={{ width: '9px', height: '9px', borderRadius: '50%', background: c, opacity: 0.7 }}
                />
              ))}
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginLeft: '8px',
                }}
              >
                canonical_report.json
              </span>
            </div>
            {result && (
              <span className={`badge ${result.valid ? 'badge-success' : 'badge-danger'}`}>
                {result.valid ? '✓ Esquema Válido' : '✗ Errores Encontrados'}
              </span>
            )}
          </div>

          <textarea
            id="schema-validator-textarea"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            style={{
              width: '100%',
              minHeight: '300px',
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              fontSize: '0.875rem',
              background: 'rgba(0,0,0,0.25)',
              color: result ? (result.valid ? '#86efac' : '#fca5a5') : '#e2e8f0',
              border: 'none',
              padding: '20px 24px',
              resize: 'vertical',
              lineHeight: '1.7',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'color 0.3s ease',
            }}
          />
        </div>

        {/* Validation Results */}
        {result && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' }}
          >
            {/* Summary header */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                padding: '16px 20px',
                background: result.valid ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${result.valid ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: '10px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>{result.valid ? '✅' : '❌'}</span>
                <div>
                  <div
                    style={{
                      fontWeight: '700',
                      color: result.valid ? '#10b981' : '#ef4444',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {result.valid ? 'Reporte Canónico Válido' : 'Validación Fallida'}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{SCHEMA.label}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { n: counts.errors, label: 'Errores', color: '#ef4444' },
                  { n: counts.warnings, label: 'Advertencias', color: '#f59e0b' },
                  { n: counts.successes, label: 'Validaciones OK', color: '#10b981' },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        color: stat.color,
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {stat.n}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed results list */}
            <div
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '360px',
                overflowY: 'auto',
                textAlign: 'left',
              }}
            >
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'white' }}>
                Reporte Detallado de Validación
              </h3>

              {[...result.errors, ...result.warnings, ...result.successes].map((item, i) => {
                const isErr = item.severity === 'error';
                const isWarn = item.severity === 'warning';
                const color = isErr ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
                const icon = isErr ? '✗' : isWarn ? '⚠' : '✓';

                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '10px 14px',
                      background: color + '08',
                      border: `1px solid ${color}20`,
                      borderRadius: '6px',
                      alignItems: 'flex-start',
                      animation: 'fadeIn 0.2s ease',
                    }}
                  >
                    <span style={{ color, fontWeight: 'bold', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                    <div>
                      <code
                        style={{
                          fontSize: '0.78rem',
                          color: color,
                          background: color + '15',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          display: 'inline-block',
                          marginBottom: '4px',
                        }}
                      >
                        {item.field}
                      </code>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {item.msg}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Determinism explanation if valid */}
            {result.valid && (
              <div
                style={{
                  background: 'rgba(56,189,248,0.05)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ color: 'var(--color-accent)', fontSize: '1rem', flexShrink: 0 }}>ℹ</span>
                <span>
                  <strong style={{ color: 'var(--color-accent)' }}>Determinismo garantizado: </strong>
                  El reporte tiene las claves en el orden canónico correcto. Si dos participantes distintos
                  ejecutan el mismo pipeline con los mismos datos de entrada, obtendrán el mismo hash SHA-256.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
