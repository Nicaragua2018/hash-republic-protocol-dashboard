// Comunicación del widget con el servicio HONEY (/honey/*, mismo dominio).
// Nunca lanza: cualquier fallo se convierte en una respuesta "no_disponible".

export const MAX_TURNOS = 6;
export const MAX_TURNO = 1000;
// Por debajo de los 8 KB que acepta el servidor (MAX_BODY = 8192).
export const MAX_BYTES = 8000;

export const NO_DISPONIBLE = {
  id: null,
  texto:
    'Ahora mismo no puedo responder. Inténtalo más tarde o escribe al equipo desde la página de contacto.',
  estado: 'no_disponible',
  fuentes: [],
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Sin el contenedor, una ruta desconocida podría devolver la página del sitio
// con 200: por eso se exige el JSON {activo: true}.
export async function honeyActivo(fetchFn = fetch) {
  try {
    const res = await fetchFn('/honey/salud', { headers: { Accept: 'application/json' } });
    if (!res.ok) return false;
    const datos = await res.json();
    return datos?.activo === true;
  } catch {
    return false;
  }
}

// El servidor exige pares usuario/asistente completos: se descarta un turno
// suelto al final, los intercambios que fallaron (no se le reenvían al modelo
// textos de error) y se dejan los MAX_TURNOS más recientes.
export function recortarHistorial(historial) {
  const completos = historial.slice(0, historial.length - (historial.length % 2));
  const pares = [];
  for (let i = 0; i < completos.length; i += 2) {
    if (completos[i + 1].estado !== 'no_disponible') pares.push(completos[i], completos[i + 1]);
  }
  return pares.slice(-MAX_TURNOS).map((t) => ({ rol: t.rol, texto: String(t.texto).slice(0, MAX_TURNO) }));
}

// Con acentos o emojis, 6 turnos pueden pasar de 8 KB: se quitan los pares
// más viejos hasta que el cuerpo quepa.
function cuerpoChat(pregunta, historial) {
  let turnos = recortarHistorial(historial);
  let cuerpo = JSON.stringify({ pregunta, historial: turnos });
  while (turnos.length > 0 && new TextEncoder().encode(cuerpo).length > MAX_BYTES) {
    turnos = turnos.slice(2);
    cuerpo = JSON.stringify({ pregunta, historial: turnos });
  }
  return cuerpo;
}

// Solo rutas del propio sitio: una fuente nunca lleva a otro dominio.
const esRutaDelSitio = (u) => typeof u === 'string' && u.startsWith('/') && !u.startsWith('//');

function esFuenteValida(f) {
  return typeof f?.titulo === 'string' && esRutaDelSitio(f?.url);
}

// La imagen solo pasa si es del propio sitio y trae su descripción.
function limpiarFuente({ titulo, url, imagen, imagen_alt }) {
  const fuente = { titulo, url };
  if (esRutaDelSitio(imagen) && typeof imagen_alt === 'string' && imagen_alt) {
    Object.assign(fuente, { imagen, imagen_alt });
  }
  return fuente;
}

export async function preguntar(pregunta, historial, fetchFn = fetch) {
  try {
    const res = await fetchFn('/honey/chat', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: cuerpoChat(pregunta, historial),
    });
    if (res.status === 429) {
      return { ...NO_DISPONIBLE, texto: 'Vas muy rápido. Espera un momento y vuelve a preguntar.' };
    }
    if (!res.ok) return NO_DISPONIBLE;
    const d = await res.json();
    if (typeof d?.texto !== 'string' || typeof d?.estado !== 'string') return NO_DISPONIBLE;
    return {
      id: typeof d.id === 'string' ? d.id : null,
      texto: d.texto,
      estado: d.estado,
      fuentes: Array.isArray(d.fuentes) ? d.fuentes.filter(esFuenteValida).map(limpiarFuente) : [],
    };
  } catch {
    return NO_DISPONIBLE;
  }
}

export async function votar(id, util, fetchFn = fetch) {
  try {
    const res = await fetchFn('/honey/util', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ id, util }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// El globito «¿Dudas? Pregúntale a HONEY» aparece una sola vez por navegador.
// Si el navegador bloquea el almacenamiento no se puede recordar, así que
// no se muestra: mejor eso que repetirlo en cada página.
const AVISO = 'honey-aviso-visto';

export function avisoPendiente(almacen = globalThis.localStorage) {
  try {
    return almacen.getItem(AVISO) !== '1';
  } catch {
    return false;
  }
}

export function marcarAvisoVisto(almacen = globalThis.localStorage) {
  try {
    almacen.setItem(AVISO, '1');
  } catch {
    // Sin almacenamiento: nada que recordar.
  }
}
