// Lógica del recorrido guiado de Inicio, sin React, para probarla con node --test.

// Evento para empezar el recorrido desde Inicio o desde HONEY.
export const EVENTO_RECORRIDO = 'oc:recorrido';

// Cada paso señala los elementos marcados con data-recorrido="<id>".
export const PASOS = [
  {
    id: 'inicio',
    titulo: 'Hola, soy HONEY',
    texto:
      'Te enseño el sitio en un minuto. OpenCivic hace tecnología abierta para que las comunidades conversen, decidan y comprueben juntas.',
  },
  {
    id: 'pasos',
    titulo: 'Lo que puedes hacer',
    texto:
      'Deliberar, decidir y comprobar: es lo que permite Nicaragua Decide, nuestro proyecto para la diáspora nicaragüense.',
  },
  {
    id: 'piezas',
    titulo: 'Las reglas que lo cuidan',
    texto: 'Cuatro piezas, cada una con su límite. El juicio final siempre es humano.',
  },
  {
    id: 'blog',
    titulo: 'Un artículo cada lunes',
    texto: 'Ideas con fuentes verificables sobre democracia e instituciones. Aquí ves los más recientes.',
  },
  {
    id: 'boletin',
    titulo: 'No te pierdas nada',
    texto: 'Suscríbete gratis al boletín y recibe cada artículo en tu correo. También puedes contribuir.',
  },
  {
    id: 'menu',
    titulo: 'Todo está en el menú',
    texto: 'Qué es OpenCivic, el blog, el proyecto, cómo unirte y el contacto.',
  },
  {
    id: 'honey',
    titulo: 'Y aquí me tienes',
    texto:
      'Si te queda una duda, pregúntame cuando quieras. Respondo con los documentos públicos del proyecto.',
  },
];

const visible = (e) => {
  const r = e.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};

// Un mismo paso puede marcar varios elementos (el menú de escritorio y el
// botón del celular): se usa el primero que se vea.
export function elegirObjetivo(elementos) {
  return elementos.find(visible) ?? null;
}

// buscar(id) devuelve los elementos marcados con ese id.
export function pasosDisponibles(pasos, buscar) {
  return pasos.filter((p) => elegirObjetivo(buscar(p.id)) !== null);
}

const MARGEN = 16;

// Dónde poner la tarjeta (coordenadas de la ventana): debajo del elemento si
// cabe, si no encima, y siempre dentro de la pantalla.
export function posicionTarjeta(rect, vista, tarjeta) {
  const maxLeft = vista.ancho - tarjeta.ancho - MARGEN;
  const left = Math.max(MARGEN, Math.min(rect.left, maxLeft));
  const maxTop = vista.alto - tarjeta.alto - MARGEN;
  if (rect.bottom + MARGEN + tarjeta.alto <= vista.alto - MARGEN) return { top: rect.bottom + MARGEN, left };
  if (rect.top - MARGEN - tarjeta.alto >= MARGEN) return { top: rect.top - MARGEN - tarjeta.alto, left };
  return { top: Math.max(MARGEN, maxTop), left };
}
