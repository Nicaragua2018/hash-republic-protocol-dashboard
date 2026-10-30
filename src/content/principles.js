// Los 12 principios de OpenCivic Solutions, con una explicación breve de
// cada uno. La página /sobre los muestra como lista enlazada; cada enlace
// lleva a su explicación (/sobre#principio-N). El 29 oct 2026 Carlos pidió
// reducir los 25 originales a 12, elegidos del medio de la lista (7–18).

const principles = [
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
    text: 'Nadie habla por una comunidad abierta; la evidencia habla por sí misma.',
    explain:
      'En una comunidad abierta y sin dueño, ninguna persona, empresa o fundación puede atribuirse la voz de todos. Lo que sí se puede hacer es reunir evidencia verificable de lo que piensan sus participantes y dejar que esa evidencia hable.',
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
];

export default principles;
