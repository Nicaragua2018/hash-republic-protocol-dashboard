// Contenido de la página /proyectos (Nicaragua Decide). Lo usan la página
// en el navegador y scripts/prerender.mjs (datos estructurados y
// llms-full.txt), por eso es JS puro, sin React.
// Fuente: el repositorio del proyecto (README, docs/ROADMAP.md,
// docs/ARCHITECTURE.md, docs/DECISIONS.md). Al cambiar el estado del
// proyecto allá, actualizar aquí (y honey/base/proyectos.md).

export const SITIO_URL = 'https://nicaraguadecide.org';

export const RESUMEN =
  'Nicaragua Decide es una plataforma abierta para que el exilio y la diáspora nicaragüense se organicen y decidan juntos: proponen inquietudes, debaten para encontrar acuerdos, votan soluciones y eligen a quienes los representan, con resultados que se pueden comprobar y la identidad protegida.';

export const FUNCIONES = [
  {
    titulo: 'Dos comunidades y un espacio común',
    texto:
      'Cada persona participa en la comunidad de su territorio de origen (hay 17: los 15 departamentos y las 2 regiones autónomas de Nicaragua) y en la del país o estado donde vive ahora, que se activa al reunir 7 miembros. Además, todos comparten el espacio común Exilio y diáspora.',
  },
  {
    titulo: 'Proponer inquietudes',
    texto:
      'Cualquier miembro plantea una inquietud y los demás la apoyan de forma anónima. Cuando junta suficiente apoyo, la comunidad tiene un plazo para responderla; si no lo hace, se abre a debate sola.',
  },
  {
    titulo: 'Debatir para encontrar acuerdos',
    texto:
      'En vez de un hilo interminable de comentarios, cada quien escribe frases cortas y opina sobre las de los demás: de acuerdo, en desacuerdo o paso. Un mapa de opiniones muestra las frases que unen a quienes piensan distinto.',
  },
  {
    titulo: 'Votar soluciones',
    texto:
      'Si hay una sola solución, apruebas, no apruebas o te abstienes. Si hay varias, ordenas solo las que aceptas, de la que más a la que menos prefieres, y el resultado se calcula con el método de Schulze. Nadie ve cifras antes de que cierre la votación.',
  },
  {
    titulo: 'Cumplir lo decidido',
    texto:
      'Cada solución aprobada tiene una comisión que la lleva adelante, formada con voluntarios, por sorteo verificable o por votación, y que rinde informes a la comunidad.',
  },
  {
    titulo: 'Elegir y revocar cargos',
    texto:
      'La mesa directiva y los coordinadores de cada comunidad se eligen por votación, por un tiempo limitado. Cualquier miembro verificado puede pedir que un cargo se vuelva a votar, y los apoyos a ese pedido son secretos.',
  },
  {
    titulo: 'Las reglas también se votan',
    texto:
      'Plazos, mínimos de participación y demás reglas no los fija nadie desde arriba: la comunidad puede cambiarlos con una votación en la que participe al menos el 30 % de sus miembros.',
  },
  {
    titulo: 'Un asistente que solo sugiere',
    texto:
      'Guardián, el asistente de inteligencia artificial, agrupa inquietudes parecidas, propone borradores de soluciones y cuida el tono de la conversación. Nunca decide, nunca dice qué votar y nunca revela quién votó qué.',
  },
];

export const PROTECCION = [
  'Se entra solo por invitación, y cada persona nueva queda verificada con el aval de dos miembros que ya están dentro.',
  'Lo que se publica dentro de la plataforma solo lo ven sus miembros: quien la visita sin cuenta solo ve cómo funciona.',
  'Tu identidad (correo y nombre real) se guarda aparte de tu perfil público. Propuestas, votos y registros de auditoría usan solo el perfil público.',
  'Las direcciones IP no se guardan tal cual, sino como una huella cifrada que no permite reconstruirlas.',
  'Los registros del sistema nunca incluyen correos, nombres ni contraseñas.',
];

export const VERIFICACION = [
  'Cada votación publica, junto con su resultado, las tablas completas de comparación entre opciones, para que cualquier miembro pueda recalcularlo por su cuenta.',
  'Cada sorteo publica su semilla y guarda la lista de personas elegibles de ese momento: con esos dos datos, cualquiera puede repetir el cálculo y obtener el mismo resultado.',
  'Cada acción importante queda en un registro de auditoría que la propia base de datos impide modificar o borrar, y que los miembros pueden consultar en la página «Observar».',
];

export const ESTADO =
  'Nicaragua Decide ya está en línea en nicaraguadecide.org. Abre poco a poco y por invitación, empezando por sus primeros miembros, entre ellos el grupo de exiliados RENACER. La versión actual cubre todo el ciclo: inquietudes, debate, votación, comisiones, elección de cargos y cambio de reglas.';

export const SIGUIENTES = [
  'Sumar a los primeros 200 miembros, comunidad por comunidad.',
  'Verificación en dos pasos para entrar a la cuenta.',
  'Cifrar los datos personales guardados.',
  'Herramientas públicas para verificar votaciones y sorteos sin depender del servidor.',
  'Más adelante: llaves en el propio dispositivo y pruebas criptográficas, incluidas pruebas de conocimiento cero, para demostrar que eres miembro sin revelar quién eres.',
];

export const REPO_URL = 'https://github.com/Nicaragua2018/decide-nicaragua';

export const FAQ = [
  {
    pregunta: '¿Qué es Nicaragua Decide?',
    respuesta: RESUMEN,
  },
  {
    pregunta: '¿Dónde está la plataforma?',
    respuesta:
      'En nicaraguadecide.org. Sin cuenta se puede ver cómo funciona; para participar hace falta una invitación.',
  },
  {
    pregunta: '¿Quién puede participar?',
    respuesta:
      'Nicaragüenses en el exilio y la diáspora, por invitación. Un miembro te invita y, para quedar verificado, necesitas el aval de dos personas que ya están dentro. Así, detrás de cada voz hay una persona real.',
  },
  {
    pregunta: '¿Cómo protege mi identidad?',
    respuesta:
      'Tu correo y tu nombre real se guardan separados de tu perfil público, y todo lo que haces en la plataforma queda asociado solo a ese perfil. Lo que se publica dentro solo lo ven los miembros, las direcciones IP se guardan como una huella cifrada y los registros del sistema nunca incluyen datos personales.',
  },
  {
    pregunta: '¿Quién toma las decisiones?',
    respuesta:
      'Los miembros, votando. Hasta las reglas, los plazos y los mínimos de participación se votan. El asistente de inteligencia artificial solo puede proponer o sugerir; las decisiones siempre se toman de forma orgánica, verificable y democrática.',
  },
  {
    pregunta: '¿Cómo sé que una votación no fue manipulada?',
    respuesta:
      'Cada votación publica las tablas completas con las que se calculó el resultado, para que cualquier miembro pueda recalcularlo, y cada acción queda en un registro de auditoría que no se puede modificar ni borrar.',
  },
  {
    pregunta: '¿Qué es el método de Schulze?',
    respuesta:
      'Es un método de votación por preferencias: cada persona ordena las opciones y se compara cada opción contra cada una de las demás. Gana la que resulta preferida en esos enfrentamientos, lo que evita que una opción gane solo porque las demás dividieron el voto.',
  },
  {
    pregunta: '¿Para qué sirve el sorteo?',
    respuesta:
      'Para formar comisiones eligiendo al azar entre quienes se ofrecen o cumplen los requisitos, de forma que nadie pueda escoger a dedo. La semilla del sorteo es pública y cualquiera puede repetir el cálculo.',
  },
  {
    pregunta: '¿En qué estado está el proyecto?',
    respuesta: `${ESTADO} Lo siguiente es sumar a los primeros 200 miembros y reforzar la seguridad.`,
  },
];
