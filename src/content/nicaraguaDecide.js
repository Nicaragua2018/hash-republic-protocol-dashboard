// Contenido de la página /proyectos (Nicaragua Decide). Lo usan la página
// en el navegador y scripts/prerender.mjs (datos estructurados y
// llms-full.txt), por eso es JS puro, sin React.
// Fuente: el repositorio del proyecto (README, docs/ROADMAP.md,
// docs/ARCHITECTURE.md, docs/DECISIONS.md). Al cambiar el estado del
// proyecto allá, actualizar aquí.

export const RESUMEN =
  'Nicaragua Decide es una plataforma abierta para que la comunidad nicaragüense en el exilio y la diáspora delibere, vote y elija representantes por sorteo, con resultados que se pueden comprobar y sin exponer la identidad de quien participa.';

export const FUNCIONES = [
  {
    titulo: 'Deliberar por territorio',
    texto:
      'Cada persona participa en el grupo de su departamento de origen (los 17 de Nicaragua). Allí se presentan propuestas, se comentan y cada quien deja una señal: apoyo, neutral u objeción.',
  },
  {
    titulo: 'Votar ordenando opciones',
    texto:
      'En lugar de marcar una sola casilla, ordenas las opciones de la que más a la que menos prefieres. El resultado se calcula con el método de Schulze, que elige la opción que gana frente a cada una de las demás.',
  },
  {
    titulo: 'Elegir por sorteo',
    texto:
      'Para formar asambleas o comisiones se puede sortear entre las personas elegibles, como en un jurado. El sorteo se puede repetir y comprobar paso a paso.',
  },
  {
    titulo: 'Dejar rastro de todo',
    texto:
      'Cada acción importante queda en un registro de auditoría que la propia base de datos impide modificar o borrar.',
  },
];

export const PROTECCION = [
  'Se entra solo por invitación: no hay registro público abierto a cualquiera.',
  'Tu identidad (correo y nombre real) se guarda aparte de tu perfil público. Propuestas, votos y registros de auditoría usan solo el perfil público.',
  'Las direcciones IP no se guardan tal cual, sino como una huella cifrada que no permite reconstruirlas.',
  'Los registros del sistema nunca incluyen correos, nombres ni contraseñas.',
  'La sesión vive en cookies protegidas que el navegador no deja leer a otros programas de la página.',
];

export const VERIFICACION = [
  'Cada votación guarda las tablas completas de comparación entre opciones, para que cualquier participante pueda recalcular el resultado por su cuenta.',
  'Cada sorteo publica su semilla y guarda la lista de personas elegibles de ese momento: con esos dos datos, cualquiera puede repetir el cálculo y obtener el mismo resultado.',
  'El resultado de una consulta es evidencia para la comunidad, no una orden automática: el juicio final siempre es humano.',
];

export const ESTADO =
  'El prototipo funcional está completo: autenticación por invitación, grupos territoriales, deliberación, votación, sorteo, auditoría y panel de administración, con 155 pruebas automáticas que pasan. Todavía no se usa con personas reales.';

export const SIGUIENTES = [
  'Validarlo en un servidor propio y hacer una primera votación piloto.',
  'Verificación en dos pasos para entrar a la cuenta.',
  'Cifrar los datos personales guardados.',
  'Herramientas públicas para verificar votaciones y sorteos sin depender del servidor.',
];

export const FAQ = [
  {
    pregunta: '¿Qué es Nicaragua Decide?',
    respuesta: RESUMEN,
  },
  {
    pregunta: '¿Quién puede participar?',
    respuesta:
      'Por ahora, personas invitadas. Una persona administradora envía la invitación por correo, quien la recibe crea su cuenta y, una vez verificada, puede proponer, votar y participar en sorteos.',
  },
  {
    pregunta: '¿Cómo protege mi identidad?',
    respuesta:
      'Tu correo y tu nombre real se guardan separados de tu perfil público, y todo lo que haces en la plataforma queda asociado solo a ese perfil. Las direcciones IP se guardan como una huella cifrada y los registros del sistema nunca incluyen datos personales.',
  },
  {
    pregunta: '¿Cómo sé que una votación no fue manipulada?',
    respuesta:
      'Cada votación guarda las tablas completas con las que se calculó el resultado, para que cualquier participante pueda recalcularlo, y cada acción queda en un registro de auditoría que no se puede modificar ni borrar.',
  },
  {
    pregunta: '¿Qué es el método de Schulze?',
    respuesta:
      'Es un método de votación por preferencias: cada persona ordena las opciones y se compara cada opción contra cada una de las demás. Gana la que resulta preferida en esos enfrentamientos, lo que evita que una opción gane solo porque las demás dividieron el voto.',
  },
  {
    pregunta: '¿Para qué sirve el sorteo?',
    respuesta:
      'Para elegir personas al azar entre quienes cumplen los requisitos, por ejemplo para una asamblea, de forma que nadie pueda escoger a dedo. La semilla del sorteo es pública y cualquiera puede repetir el cálculo.',
  },
  {
    pregunta: '¿Las consultas son obligatorias o vinculantes?',
    respuesta:
      'No por sí solas. Nicaragua Decide produce evidencia de lo que piensa una comunidad; las señales no son votos vinculantes y el juicio final siempre es de las personas.',
  },
  {
    pregunta: '¿En qué estado está el proyecto?',
    respuesta: `${ESTADO} El siguiente paso es validarlo en un servidor propio y hacer una primera votación piloto.`,
  },
];
