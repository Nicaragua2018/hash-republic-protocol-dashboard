// Artículos del blog de OpenCivic Solutions.
// Cada entrada es un objeto simple: nada de CMS todavía, solo contenido
// verificado que vive en el código, como el resto del sitio.

const posts = [
  {
    slug: 'la-evolucion-del-lenguaje-como-tecnologia',
    title: 'La evolución del lenguaje como tecnología',
    dek: 'De la ley escrita al código de máquina, y de vuelta: dos ramas de una misma raíz explican por qué OpenCivic piensa las instituciones como tecnología.',
    date: '2026-10-12',
    author: 'Equipo OpenCivic',
    image: '/ilustracion-lenguaje-tecnologia.svg',
    imageAlt: 'Ilustración dibujada a mano: un tallo nace de un hexágono de panal y se bifurca en un libro, a la izquierda, y un chip, a la derecha, mientras dos abejas vuelan entre ambas ramas',
    body: [
      { type: 'p', text: 'El lenguaje fue la primera tecnología de la humanidad. Antes que la rueda o el fuego, antes que cualquier herramienta de piedra, un grupo de personas descubrió que podía coordinar una cacería, advertir de un peligro o transmitir un conocimiento sin tener que repetir la experiencia desde cero cada vez. Esa capacidad —externalizar un pensamiento para que otra mente lo use— es la definición más simple de tecnología que existe. El lenguaje la cumple antes que ninguna otra cosa.' },
      { type: 'p', text: 'Las abejas, sin lenguaje simbólico, resolvieron una versión limitada del mismo problema con la danza de meneo: una señal que comunica dirección, distancia y calidad de un sitio a toda la colonia. Fue la metáfora fundacional del Hash Republic Protocol. Pero la danza de las abejas muere con quien la baila. El lenguaje humano, en cambio, encontró la manera de sobrevivir a quien lo pronuncia — y ahí empieza la bifurcación que nos interesa.' },

      { type: 'h2', text: 'Primera rama: de la palabra hablada a la ley escrita' },
      { type: 'p', text: 'Mientras el lenguaje oral se transmitía de generación en generación por repetición y memoria, la escritura le dio algo que la voz nunca tuvo: persistencia sin presencia. Una norma ya no necesitaba a nadie que la recordara en voz alta; podía grabarse en piedra, como el Código de Hammurabi hace casi 3.800 años, y seguir rigiendo mucho después de que su autor muriera.' },
      { type: 'p', text: 'De ahí al parlamento, la constitución y el tribunal hay un paso conceptual, no uno tecnológico: todos son formas de fijar lenguaje para que obligue a futuro. Una institución, vista así, no es un edificio ni una burocracia — es lenguaje al que se le dio forma, límites y mecanismo de cumplimiento. Es exactamente la idea que abre el manifiesto de OpenCivic: las instituciones también son tecnología.' },

      { type: 'h2', text: 'Segunda rama: de la lógica formal al código' },
      { type: 'p', text: 'La otra rama nace del mismo impulso pero busca lo opuesto a la ley: en vez de un lenguaje con autoridad sobre personas, uno sin ambigüedad para máquinas. La lógica formal de Aristóteles y, siglos después, el álgebra de Boole, redujeron el razonamiento a símbolos manipulables. En 1936, Alan Turing formalizó qué significa "computar", y de ahí salieron los lenguajes de programación: dialectos cada vez más legibles para humanos, pero que al final se traducen a instrucciones que una máquina ejecuta sin interpretar — sin la libertad de leer entre líneas que tiene un juez.' },
      { type: 'p', text: 'El código es lenguaje al que se le quitó deliberadamente la ambigüedad. Donde la ley necesita un tribunal para decidir qué significa en un caso difícil, el código decide en milisegundos y siempre de la misma manera. Determinismo a cambio de flexibilidad.' },

      { type: 'h2', text: 'El regreso: los LLM cierran el círculo' },
      { type: 'p', text: 'Durante setenta años esa segunda rama exigió una traducción cara: alguien tenía que convertir una intención humana, ambigua por naturaleza, en instrucciones precisas que una máquina pudiera ejecutar. Los modelos de lenguaje —los LLM— son la primera tecnología capaz de saltarse ese paso: se les puede dar una instrucción en el mismo lenguaje ambiguo con el que redactamos una ley, y actúan sobre ella directamente.' },
      { type: 'p', text: 'Es un regreso, no una ruptura. Por primera vez desde que el código se separó de la ley, una misma frase en español puede, a la vez, argumentarse frente a una asamblea y ejecutarse en una máquina. Y por eso trae de vuelta el problema que la segunda rama había resuelto: la ambigüedad. Un LLM puede malinterpretar una instrucción exactamente como un ciudadano puede malinterpretar una ley — con la diferencia de que ahora actúa a la velocidad del código.' },

      { type: 'h2', text: 'Por qué esto le importa a OpenCivic' },
      { type: 'p', text: 'El Hash Republic Protocol es, leído así, un intento concreto de reunir lo mejor de las dos ramas en vez de elegir una: usa lenguaje natural para la deliberación (Pol.is, síntesis de IA), pero exige que cada conclusión quede fijada con la precisión de la segunda rama — un hash SHA-256, un sello de tiempo, un reporte canónico que cualquiera puede verificar matemáticamente. La IA ayuda a entender lo que la gente quiso decir; la criptografía prueba que nadie cambió lo que se dijo después del hecho.' },
      { type: 'p', text: 'Ninguna de las dos ramas basta sola. El lenguaje de la ley sin precisión técnica se vuelve interpretable a conveniencia; el código sin deliberación humana se vuelve autoritario por diseño. Por eso la fórmula de OpenCivic insiste en que ningún componente —ni la democracia, ni la competencia técnica, ni la criptografía— tiene autoridad absoluta por sí solo. Es, literalmente, una constitución para una tecnología que todavía se está escribiendo.' },
      { type: 'p', text: 'Todavía no sabemos si este capítulo de la historia del lenguaje terminará mejor que los anteriores. Pero por primera vez tenemos las herramientas para dejar evidencia verificable de cómo lo intentamos.' },

      { type: 'sources', items: [
        'Código de Hammurabi (c. 1750 a. C.), uno de los primeros cuerpos legales escritos que se conservan.',
        'Turing, A. (1936). "On Computable Numbers, with an Application to the Entscheidungsproblem."',
        'Chomsky, N. (1957). Syntactic Structures — formalización de la gramática como sistema de reglas.',
        'Seeley, T. D. (2010). Honeybee Democracy. Princeton University Press.',
        'Hash Republic Protocol — Whitepaper (OpenCivic Solutions).',
      ]},
    ],
  },
];

export default posts;

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}
