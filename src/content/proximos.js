// Calendario de próximos artículos del blog: uno por semana, cada lunes.
// Al publicar uno, se quita de aquí en el mismo PR que agrega el artículo.
// `slug` solo lo llevan los artículos que ya estuvieron publicados y vuelven:
// así su dirección muestra cuándo regresan en vez de una página rota.
// Cada dato de las sinopsis tiene su fuente verificada en el artículo.

const PROXIMOS = [
  {
    fecha: '2026-11-02',
    titulo: 'Democracias fatigadas',
    sinopsis:
      '¿Y si lo que sientes no fuera apatía, sino cansancio? El politólogo Manuel Alcántara le puso nombre a lo que viven millones en América Latina, y advirtió que una democracia fatigada puede incubar autoritarismos. Qué la agota, y qué puede despertarla.',
  },
  {
    fecha: '2026-11-09',
    titulo: 'Nepal: cuando el Estado deja de escuchar',
    sinopsis:
      'En septiembre de 2025, un gobierno bloqueó las redes sociales para callar a sus jóvenes. Días después había decenas de muertos, el primer ministro renunció y una generación eligió a su líder interina en un lugar que nadie imaginaba. La lección que ningún gobierno debería ignorar.',
  },
  {
    fecha: '2026-11-16',
    titulo: 'vTaiwan: los hackers cívicos que le enseñaron a un gobierno a escuchar',
    sinopsis:
      'En 2015, la llegada de Uber enfrentó a taxistas, conductores y pasajeros en Taiwán. Un grupo de programadores voluntarios propuso algo inaudito: que miles de personas buscaran juntas aquello en lo que sí estaban de acuerdo. El gobierno escuchó, y reguló siguiendo ese acuerdo.',
  },
  {
    fecha: '2026-11-23',
    titulo: 'La necesaria modernización de las instituciones públicas',
    slug: 'de-las-instituciones-analogicas-a-las-instituciones-programables',
    sinopsis:
      'La democracia está agotada y desactualizada. Votamos como en el siglo pasado y hacemos trámites pensados para el papel. Qué cambiar, qué proteger y por qué hay motivos de sobra para la esperanza.',
  },
  {
    fecha: '2026-11-30',
    titulo: 'La democracia de las abejas',
    sinopsis:
      'Cada primavera, miles de abejas deben elegir un nuevo hogar sin jefe, sin campaña y sin fraude, y suelen elegir el mejor. Lo que la ciencia descubrió sobre cómo deciden juntas puede enseñarnos a decidir mejor.',
  },
  {
    fecha: '2026-12-07',
    titulo: 'Lo que aprendimos de las Notas de la Comunidad de X',
    slug: 'lo-que-aprendimos-de-las-notas-de-la-comunidad',
    sinopsis:
      '¿Pueden ponerse de acuerdo sobre los hechos personas que no se soportan? Un experimento con millones de usuarios dice que sí… hasta que las máquinas empezaron a escribir la mitad de lo que se ve.',
  },
  {
    fecha: '2026-12-14',
    titulo: 'Decidim: votar, y vigilar que se cumpla',
    sinopsis:
      'Prometer es fácil; cumplir, no tanto. En Barcelona nació una plataforma abierta donde la gente propone, vota y luego sigue paso a paso si lo decidido de verdad se hizo. Lo que pasa cuando las promesas dejan rastro.',
  },
  {
    fecha: '2026-12-21',
    titulo: 'Soberanía tecnológica',
    slug: 'soberania-tecnologica-y-de-ia',
    sinopsis:
      'Las máquinas más poderosas del mundo aprendieron de lo que escribimos todos. Entonces, ¿de quién son? Dos papas, separados por 135 años, se hicieron la misma pregunta, y sus respuestas te pueden sorprender.',
  },
  {
    fecha: '2026-12-28',
    titulo: 'Las DAO: organizaciones sin dueño',
    sinopsis:
      'Imagina una organización sin jefe, donde las reglas las cumple un programa y nadie puede tocar el dinero a escondidas. Ya existen. La primera grande perdió unos 50 millones de dólares en un solo día. Lo que su caída nos enseña sobre el poder.',
  },
  {
    fecha: '2027-01-04',
    titulo: 'Bittensor: pagar por lo que se aporta',
    sinopsis:
      '¿Y si tu recompensa dependiera solo de lo que aportas, y no de a quién conoces? Una red abierta de inteligencia artificial lo está intentando. Lo que promete es enorme, y lo que enseña sobre sus fallas también.',
  },
];

export default PROXIMOS;

export function proximoPorSlug(slug) {
  return PROXIMOS.find((p) => p.slug === slug);
}
