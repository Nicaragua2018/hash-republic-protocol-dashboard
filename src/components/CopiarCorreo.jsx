import React, { useState } from 'react';

// Copia la dirección para pegarla en Gmail, Outlook web o donde sea:
// el enlace «mailto:» no funciona en computadoras sin programa de correo.
export default function CopiarCorreo({ correo, className = 'oc-btn oc-btn--outline' }) {
  const [estado, setEstado] = useState('listo');

  async function copiar() {
    try {
      await navigator.clipboard.writeText(correo);
      setEstado('copiado');
    } catch {
      setEstado('error');
    }
    setTimeout(() => setEstado('listo'), 2500);
  }

  return (
    <button type="button" onClick={copiar} className={className} style={{ fontFamily: 'inherit', cursor: 'pointer' }}>
      <span aria-live="polite">
        {estado === 'copiado' ? '¡Copiado!' : estado === 'error' ? `Copia: ${correo}` : 'Copiar correo'}
      </span>
    </button>
  );
}
