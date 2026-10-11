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
      { type: 'p', text: 'Imagina el momento en que alguien, por primera vez, señaló una nube cargada y dijo una palabra para "tormenta". No hizo falta inventar la rueda ni domesticar el fuego: bastó esa palabra para que el resto del grupo supiera qué hacer sin tener que vivir la tormenta en carne propia. Sacar un pensamiento de una cabeza y meterlo en otra — eso, probablemente, sea la tecnología más vieja que tenemos. Y como toda tecnología, no se quedó quieta.' },
      { type: 'p', text: 'Las abejas llegaron a una versión parecida del mismo problema, aunque sin palabras: la danza de meneo, ese baile que le avisa a toda la colmena dónde hay un buen sitio para anidar y qué tan seguras están de que vale la pena ir. Es la metáfora que le da nombre al Hash Republic Protocol. Pero la danza se apaga con la abeja que la baila. El lenguaje humano encontró algo que ninguna danza logró: sobrevivir a quien lo dijo. Y ahí, nos parece, empieza la historia que de verdad vale la pena contar.' },

      { type: 'h2', text: 'Primera rama: cuando la palabra se volvió ley' },
      { type: 'p', text: 'Mientras solo hablamos, dependemos de que alguien recuerde lo que dijimos. En cuanto empezamos a escribir, eso cambió: una norma ya no necesitaba a nadie repitiéndola en voz alta generación tras generación. Podía grabarse en piedra —como el Código de Hammurabi, hace casi 3.800 años— y seguir rigiendo mucho después de que quien la escribió ya no estuviera ahí para defenderla.' },
      { type: 'p', text: 'De ahí al parlamento, la constitución o el tribunal hay un paso más corto de lo que parece. Ninguno de los tres es, en el fondo, un edificio: son formas distintas de fijar lenguaje para que siga obligando en el futuro, incluso cuando ya nadie recuerde bien por qué se escribió así. Esa es, literalmente, la idea con la que arrancamos en OpenCivic — las instituciones también son tecnología. No lo decimos como metáfora bonita: lo decimos porque, visto de cerca, no encontramos una diferencia real.' },

      { type: 'h2', text: 'Segunda rama: cuando la lógica se volvió código' },
      { type: 'p', text: 'La otra rama nace de una necesidad casi opuesta. La ley quiere obligar a personas; esta rama quiere hablarle a máquinas, y para eso necesita quitarle al lenguaje justo la ambigüedad que lo hace útil entre humanos. Aristóteles ya andaba cerca de esto con la lógica formal; siglos después, Boole la convirtió en álgebra. En 1936 Alan Turing se preguntó, en serio, qué quiere decir "calcular" — y de esa pregunta salieron, con el tiempo, los lenguajes de programación: cada vez más fáciles de leer para nosotros, pero que al final se traducen en instrucciones que una máquina ejecuta sin margen para interpretar nada. Un juez puede leer entre líneas. Un compilador, no.' },
      { type: 'p', text: 'El código, en el fondo, es lenguaje al que le quitamos la ambigüedad a propósito. Donde la ley necesita un tribunal para decidir qué significa en un caso difícil, el código ya decidió — y siempre de la misma manera, en milisegundos. Ganamos precisión. Perdimos flexibilidad.' },

      { type: 'h2', text: 'El regreso: los modelos de lenguaje cierran el círculo' },
      { type: 'p', text: 'Durante unos setenta años, pasar de una intención humana a una instrucción que una máquina pudiera ejecutar costaba traducción: alguien tenía que convertir algo ambiguo en algo exacto. Los modelos de lenguaje son la primera tecnología que se salta ese paso casi por completo. Les hablamos con el mismo lenguaje impreciso con el que redactamos una ley, un correo o una queja — y actúan directamente sobre eso.' },
      { type: 'p', text: 'A nosotros esto nos parece menos una ruptura que un regreso. Por primera vez desde que el código se separó de la ley, la misma frase puede argumentarse frente a una asamblea y, a la vez, ejecutarse en una máquina. El problema es que trae de vuelta justo lo que la segunda rama se había tomado setenta años en resolver: la ambigüedad. Un modelo de lenguaje puede malinterpretar una instrucción exactamente igual que un ciudadano malinterpreta una ley — solo que ahora actúa a la velocidad del código, no a la velocidad de un juicio.' },

      { type: 'h2', text: 'Por qué nos importa esto en OpenCivic' },
      { type: 'p', text: 'Leído así, el Hash Republic Protocol es nuestro intento de no tener que elegir entre las dos ramas. Usamos lenguaje natural para deliberar —Pol.is, síntesis hecha con IA— pero exigimos que cada conclusión quede fijada con la precisión de la otra rama: un hash SHA-256, un sello de tiempo, un reporte canónico que cualquiera puede verificar sin tener que confiar en nuestra palabra. La IA ayuda a entender lo que la gente quiso decir. La criptografía prueba que nadie lo cambió después.' },
      { type: 'p', text: 'Ninguna rama basta sola, y lo hemos visto fallar de las dos maneras: lenguaje legal sin precisión técnica termina interpretándose a conveniencia de quien tenga más poder; código sin deliberación humana termina siendo autoritario por diseño, aunque nadie lo haya planeado así. Por eso la fórmula de OpenCivic se empeña en que ningún componente —ni la democracia, ni la competencia técnica, ni la criptografía— mande solo. Es, en los hechos, una constitución para una tecnología que todavía estamos escribiendo entre todos.' },
      { type: 'p', text: 'No sabemos todavía si este capítulo va a terminar mejor que los anteriores. Lo que sí tenemos, por primera vez, son las herramientas para dejar constancia verificable de cómo lo intentamos — y esa, para nosotros, ya es una diferencia que vale la pena perseguir.' },

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
