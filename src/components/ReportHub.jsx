import React, { useState, useEffect } from 'react';

const defaultReport = {
  protocol: "hash_republic_protocol",
  version: "0.3",
  domain: "municipio.presupuesto-participativo",
  readiness_target: "R2",
  generated_at: "2026-06-28T15:00:00Z",
  sources: {
    polis_export_hash: "sha256:d5c7f8a9e2...",
    synthesis_hash: "sha256:c9b8a7f6e5...",
    reputation_snapshot_hash: "sha256:8f7e6d5c4b...",
    delegation_snapshot_hash: "sha256:a1b2c3d4e5...",
    riskguard_hash: "sha256:3d2c1b0a9f..."
  }
};

export default function ReportHub() {
  const [jsonText, setJsonText] = useState(JSON.stringify(defaultReport, null, 2));
  const [hashResult, setHashResult] = useState('');
  const [anchoringState, setAnchoringState] = useState('idle'); // idle, anchoring, anchored
  const [anchoringData, setAnchoringData] = useState(null);
  
  // Verification states
  const [verifyText, setVerifyText] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  // Client-side SHA-256 calculation
  const calculateSha256 = async (text) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text.trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHashResult(hashHex);
    } catch (err) {
      setHashResult('Error calculando hash');
    }
  };

  useEffect(() => {
    calculateSha256(jsonText);
  }, [jsonText]);

  const handleAnchor = () => {
    setAnchoringState('anchoring');
    
    // Simulate mining wait
    setTimeout(() => {
      setAnchoringState('anchored');
      setAnchoringData({
        timestamp: new Date().toISOString(),
        txid: 'd8c47f8b9e0231aa3b4c5d6e7f8a9c0b112233445566778899aabbccddeeff00',
        blockHeight: 842106,
        opReturnPayload: hashResult,
        status: '6+ Confirmaciones'
      });
    }, 2000);
  };

  const handleVerify = async () => {
    if (!verifyText.trim()) {
      setVerificationResult({ status: 'error', msg: 'Por favor, ingrese un reporte JSON para verificar.' });
      return;
    }
    
    try {
      const parsed = JSON.parse(verifyText);
      
      // Re-serialize in a standardized form (keys sorted)
      const sortedJson = JSON.stringify(parsed, Object.keys(parsed).sort());
      
      // Calculate hash
      const encoder = new TextEncoder();
      const data = encoder.encode(sortedJson.trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const isMatch = anchoringState === 'anchored' && hashHex === anchoringData.opReturnPayload;
      
      setVerificationResult({
        status: isMatch ? 'success' : 'mismatch',
        hash: hashHex,
        msg: isMatch 
          ? '¡Verificación exitosa! El hash del documento coincide exactamente con la firma anclada en Bitcoin OP_RETURN.' 
          : 'Advertencia: El hash no coincide con ninguna firma temporal anclada en esta sesión, o las claves/valores han sido manipuladas.'
      });
    } catch (err) {
      setVerificationResult({ 
        status: 'error', 
        msg: 'Error de análisis: El texto ingresado no es un JSON válido. Compruebe la sintaxis.' 
      });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Capa de Verificabilidad y Anclaje Criptográfico</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px', marginTop: '8px' }}>
          El resultado de la deliberación se exporta como un reporte canónico ordenado de forma determinista. El hash SHA-256 de este reporte se registra en Bitcoin a través de OpenTimestamps, creando una prueba inmutable y a prueba de censura de que el consenso existió en ese momento exacto.
        </p>
      </div>

      {/* Grid: Editor vs Anchor Simulator */}
      <div className="grid-cols-2">
        
        {/* JSON Editor */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Reporte Canónico Determinista (JSON)</h3>
            <button 
              id="btn-reset-report"
              className="btn btn-secondary" 
              onClick={() => setJsonText(JSON.stringify(defaultReport, null, 2))}
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              Restablecer
            </button>
          </div>
          <p style={{ fontSize: '0.825rem' }}>
            Puedes editar los campos de abajo. Las claves del JSON deben ordenarse de forma determinista para producir siempre la firma criptográfica coincidente.
          </p>

          <textarea
            id="textarea-canonical-report"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            style={{
              flex: 1,
              minHeight: '260px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              background: 'rgba(0,0,0,0.4)',
              color: 'var(--color-success)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '16px',
              resize: 'vertical',
              lineHeight: '1.5'
            }}
          />

          <div style={{ 
            background: 'rgba(0,0,0,0.2)', 
            padding: '12px 16px', 
            borderRadius: '6px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Firma Digital SHA-256 (En Tiempo Real):</span>
            <code style={{ fontSize: '0.8rem', color: 'var(--color-accent)', wordBreak: 'break-all' }}>
              {hashResult}
            </code>
          </div>
        </div>

        {/* Anchoring Simulator */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Timestamping y Ancla en Blockchain</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Ancle el reporte de forma permanente en Bitcoin. Esto genera un registro inalterable que impide la manipulación retroactiva del estado de opinión de la comunidad.
          </p>

          {anchoringState === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '40px 20px', gap: '16px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Firma lista para registrarse en Bitcoin.</p>
              <button 
                id="btn-trigger-anchoring"
                className="btn btn-primary" 
                onClick={handleAnchor}
                style={{ padding: '12px 24px' }}
              >
                Publicar Anclaje en Bitcoin
              </button>
            </div>
          )}

          {anchoringState === 'anchoring' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '40px 20px', gap: '16px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                border: '3px solid rgba(56, 189, 248, 0.2)',
                borderTopColor: 'var(--color-accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>Emitiendo Transacción en Mempool y OpenTimestamps...</p>
            </div>
          )}

          {anchoringState === 'anchored' && anchoringData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid var(--color-success)',
                borderRadius: '6px',
                padding: '12px',
                color: 'var(--color-success)',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✓ Anclaje criptográfico verificado en Bloque Bitcoin.</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Bitcoin Transaction (OP_RETURN):</span>
                  <code style={{ wordBreak: 'break-all', display: 'block', padding: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                    {anchoringData.txid}
                  </code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Altura del Bloque:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>#{anchoringData.blockHeight}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Profundidad / Estado:</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{anchoringData.status}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fecha de Registro:</span>
                  <span style={{ color: 'white' }}>{new Date(anchoringData.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Verification section */}
      <div className="glass-card" style={{ textAlign: 'left' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Verificador de Integridad del Consenso</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
          Pegue cualquier reporte JSON generado por la comunidad de OpenCivic para verificar instantáneamente si sus datos coinciden con la firma inmutable anclada en Bitcoin OP_RETURN.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <textarea
            id="textarea-verify-input"
            placeholder="Pegue aquí el JSON del reporte canónico..."
            value={verifyText}
            onChange={(e) => setVerifyText(e.target.value)}
            style={{
              width: '100%',
              minHeight: '120px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '12px'
            }}
          />

          <button 
            id="btn-run-verification"
            className="btn btn-primary" 
            onClick={handleVerify}
            style={{ alignSelf: 'flex-start' }}
          >
            Verificar Consenso
          </button>

          {verificationResult && (
            <div 
              id="verification-result-box"
              style={{
                background: verificationResult.status === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                border: `1px solid ${verificationResult.status === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                borderRadius: '8px',
                padding: '16px',
                marginTop: '8px',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              <h4 style={{ 
                color: verificationResult.status === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                fontSize: '1rem',
                margin: 0,
                marginBottom: '6px'
              }}>
                {verificationResult.status === 'success' ? '✓ VERIFICACIÓN EXITOSA' : '❌ ERROR DE VERIFICACIÓN'}
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{verificationResult.msg}</p>
              {verificationResult.hash && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Hash Calculado: </span>
                  <code style={{ wordBreak: 'break-all' }}>{verificationResult.hash}</code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
