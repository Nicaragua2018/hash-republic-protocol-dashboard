// Los 25 principios de OpenCivic Solutions, con una explicación breve de
// cada uno. La página /sobre los muestra como lista enlazada; cada enlace
// lleva a su explicación (/sobre#principio-N).

const principles = [
  {
    text: 'La identidad no es reputación.',
    explain:
      'Que una cuenta pertenezca a una persona real no dice nada de cuánto sabe ni de cuánto debería pesar su opinión. Por eso la reputación no se hereda de un nombre, un cargo o un título genérico: se gana con aportes verificables en un tema concreto.',
  },
  {
    text: 'La reputación no es soberanía.',
    explain:
      'Tener reputación en un tema puede dar algo más de peso a tu opinión, pero no te da el poder de decidir por los demás. La decisión sigue siendo de la comunidad, y ese peso adicional tiene un techo: 1,3 veces como máximo.',
  },
  {
    text: 'La delegación no es sumisión.',
    explain:
      'Delegar tu voto en alguien de confianza para un tema no es entregarle tu voz para siempre. Puedes ver cómo vota en tu nombre, retirarle la delegación en cualquier momento y volver a votar tú directamente. Además, la delegación es por tema, nunca global.',
  },
  {
    text: 'La pericia no es autoridad absoluta.',
    explain:
      'Las personas expertas aportan un juicio técnico valioso, pero también pueden equivocarse o tener intereses. Su opinión pesa más solo dentro de su campo, solo si su capacidad se puede comprobar, y nunca puede anular por sí sola lo que decide la comunidad.',
  },
  {
    text: 'El consenso no es coerción.',
    explain:
      'Llegar a un acuerdo no autoriza a obligar a quien no lo comparte a callarse o a fingir que está de acuerdo. Un consenso legítimo deja constancia de quién disintió y por qué.',
  },
  {
    text: 'Las señales no son votos vinculantes.',
    explain:
      'Muchas consultas recogen señales: lo que una comunidad piensa, prefiere o teme. Son evidencia para quienes deciden, no órdenes automáticas. Confundir una cosa con la otra le daría a una consulta informal un poder que nadie le otorgó.',
  },
  {
    text: 'La síntesis de IA no es ley.',
    explain:
      'La IA puede resumir miles de opiniones y encontrar puntos en común, pero su resumen es una interpretación, no una decisión. Debe poder rastrearse hasta las opiniones originales, ser revisado por personas y declarar qué modelo lo produjo.',
  },
  {
    text: 'La auditoría protege la delegación.',
    explain:
      'Delegar exige confiar, y la confianza se sostiene cuando se puede comprobar. Por eso las delegaciones son públicas: cualquiera puede ver quién representa a quién y detectar si el poder se está concentrando en pocas manos.',
  },
  {
    text: 'La competencia puede guiar el consenso, pero no poseerlo.',
    explain:
      'Quien sabe más puede orientar la discusión, advertir riesgos y proponer caminos. Lo que no puede es apropiarse del resultado: el consenso pertenece a quienes participaron en él.',
  },
  {
    text: 'La comunidad puede delegar juicio, pero nunca ceder soberanía.',
    explain:
      'Una comunidad puede encargar a personas o a sistemas que analicen, recomienden o ejecuten. Lo que nunca transfiere es el derecho a decidir sus propios fines, a revisar esas decisiones y a retirar los encargos.',
  },
  {
    text: 'Nadie habla por Bitcoin; la evidencia habla por sí misma.',
    explain:
      'En una comunidad abierta y sin dueño, como Bitcoin, ninguna persona, empresa o fundación puede atribuirse la voz de todos. Lo que sí se puede hacer es reunir evidencia verificable de lo que piensan sus participantes y dejar que esa evidencia hable. El principio vale para cualquier comunidad abierta.',
  },
  {
    text: 'Ninguna propuesta sin deliberación.',
    explain:
      'Antes de decidir, una propuesta tiene que poder discutirse: conocer los argumentos a favor y en contra, preguntar y corregir. Votar sin deliberar convierte la participación en un sondeo de impulsos.',
  },
  {
    text: 'Ninguna ejecución sin auditoría.',
    explain:
      'Todo lo que se ejecuta —un pago, una regla automatizada, una decisión— debe dejar un registro que permita comprobar después qué se hizo, bajo qué norma y con qué resultado.',
  },
  {
    text: 'Ninguna reputación sin evidencia.',
    explain:
      'La reputación que da peso adicional se basa en aportes que se pueden verificar —trabajo publicado, contribuciones revisadas, experiencia comprobable—, no en la popularidad, la antigüedad ni el dinero.',
  },
  {
    text: 'Ninguna delegación sin revocación.',
    explain:
      'Toda delegación debe poder retirarse en cualquier momento y vencer sola cada cierto tiempo. Una delegación que no se puede revocar deja de ser delegación y se convierte en una cesión de poder.',
  },
  {
    text: 'El consenso bruto debe permanecer visible.',
    explain:
      'Aunque un resultado se ajuste con pesos de reputación o delegación, el resultado simple —una persona, un voto— se muestra siempre junto al ajustado. Así nadie puede esconder lo que piensa la mayoría detrás de un cálculo.',
  },
  {
    text: 'El consenso ponderado debe declarar su método.',
    explain:
      'Si un resultado se ajusta con pesos, hay que decir cómo: con qué fórmula, qué datos y qué límites. Un método oculto es una forma de manipulación, aunque nadie lo pretenda.',
  },
  {
    text: 'Las preocupaciones minoritarias deben preservarse.',
    explain:
      'Que la mayoría decida no borra lo que pensaba la minoría. Sus objeciones quedan registradas en el reporte final, porque a veces la minoría tenía razón y porque una síntesis que la silencia no es deliberación.',
  },
  {
    text: 'El almacenamiento no es autoridad.',
    explain:
      'Guardar un registro —en un servidor, en una base de datos o en una blockchain— no lo vuelve verdadero ni legítimo. Que algo esté almacenado solo prueba que alguien lo guardó.',
  },
  {
    text: 'La verificabilidad es autoridad.',
    explain:
      'Lo que da fuerza a un reporte no es quién lo custodia, sino que cualquiera pueda comprobar cómo se produjo y que nadie lo alteró después. Por eso cada reporte canónico lleva una huella criptográfica y un sello de tiempo.',
  },
  {
    text: 'La ley gobierna al código. Todo código institucional es reversible, actualizable e impugnable.',
    explain:
      'El código ejecuta reglas, pero no es la autoridad suprema. Si una regla programada produce un resultado injusto o estaba mal diseñada, debe poder corregirse, actualizarse o impugnarse por vías institucionales, igual que se reforma una ley.',
  },
  {
    text: 'Automatizar procedimientos no es automatizar soberanía.',
    explain:
      'Un sistema puede verificar requisitos, calcular un reparto acordado o ejecutar un presupuesto aprobado. Lo que no puede es decidir cuáles deben ser esos requisitos, ese reparto o esas prioridades: eso sigue siendo una decisión de las personas.',
  },
  {
    text: 'La soberanía tecnológica pertenece a la comunidad. Ningún componente es insustituible; los datos son siempre exportables.',
    explain:
      'Ninguna herramienta debe volverse imprescindible. La comunidad tiene que poder auditar el sistema, cambiar de proveedor y llevarse sus datos sin perder su memoria ni lo que construyó en común.',
  },
  {
    text: 'Descentralizar infraestructura no es descentralizar poder. El poder se mide, no se presume.',
    explain:
      'Un sistema puede estar repartido en muchos servidores y, aun así, estar controlado por muy pocos. Por eso no basta con preguntar si algo está descentralizado: hay que medir quién puede cambiar las reglas, quién controla el dinero y los datos, y quién responde cuando algo sale mal.',
  },
  {
    text: 'Algunas cosas no se convierten en código: la empatía, la excepción, la negociación, la justicia, la responsabilidad y la capacidad de cambiar de opinión.',
    explain:
      'Hay decisiones que necesitan criterio humano y no caben en una regla automática. Un buen sistema les deja espacio en lugar de pretender reemplazarlas.',
  },
];

export default principles;
