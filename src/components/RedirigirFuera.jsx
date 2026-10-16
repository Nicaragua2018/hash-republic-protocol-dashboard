import { useEffect } from 'react';

// El panel técnico de Hash Republic Protocol salió del sitio (16 oct 2026) y
// quedó archivado en GitHub. Las visitas directas las redirige nginx con un
// 301; esto cubre los enlaces que se siguen dentro del sitio sin recargar.
export const PANEL_HRP_ARCHIVO =
  'https://github.com/Nicaragua2018/hash-republic-protocol-dashboard/tree/archivo-panel-hrp';

export default function RedirigirFuera({ a }) {
  useEffect(() => {
    window.location.replace(a);
  }, [a]);
  return null;
}
