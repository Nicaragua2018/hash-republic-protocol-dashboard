---
slug: lo-que-aprendimos-de-las-notas-de-la-comunidad
title: "Información verificable: lo que aprendimos de las Notas de la Comunidad de X"
dek: El experimento masivo más parecido a nuestro principio de información verificable acierta en el mecanismo y tropieza en la concentración. Tres lecciones para quien diseñe la próxima versión.
date: 2026-10-11
author: Equipo OpenCivic
ia: asistido
image: /ilustracion-notas-comunidad.svg
imageAlt: Ilustración dibujada a mano: una publicación con una nota de contexto debajo; a la izquierda un grupo de personas en azul y a la derecha uno en amarillo, unidos por un arco por el que vuela una abeja, y abajo un sello hexagonal
ogImage: /og-notas-comunidad.png
---

Cuando hablamos de desinformación, la tentación es darle más peso a quien parece saber más: al experto, al verificador profesional, al que tiene la insignia. En OpenCivic creemos que ese camino tiene un problema de fondo. La respuesta no es decidir quién merece más voz, sino poner fuentes confiables al alcance de todos y dejar que cualquiera pueda comprobarlas.

Hay un experimento enorme que se parece bastante a esa idea, y vale la pena mirarlo de cerca, con sus aciertos y sus fallas: las Notas de la Comunidad de X.

## Cómo funcionan

El sistema nació en Twitter en enero de 2021 con el nombre de Birdwatch. Tras la compra de la empresa por Elon Musk fue rebautizado, ampliado y convertido en la pieza central de su estrategia contra la desinformación.

La mecánica es sencilla de explicar y difícil de engañar. Cualquier colaborador inscrito puede proponer una nota de contexto, con fuentes, debajo de una publicación. Pero la nota no se publica porque mucha gente la apruebe, sino solo si la califican como útil personas que normalmente no están de acuerdo entre sí. No gana la mayoría: gana el puente entre grupos que suelen discrepar. Es la misma idea que usa Pol.is, la herramienta de deliberación detrás de vTaiwan. Y hay un detalle que nos importa mucho: el algoritmo y los datos son abiertos, cualquiera puede revisarlos.

## Lo que dicen los datos

Desde 2025, X permite que cuentas de inteligencia artificial escriban notas a través de su API. Las personas siguen siendo las únicas que las califican. Dos fuentes independientes muestran qué pasó después.

Un estudio del R Street Institute, publicado en junio de 2026, analizó 423.915 notas escritas entre septiembre de 2025 y marzo de 2026. Encontró que solo el 8,9% de las notas escritas por personas llegó a publicarse, frente al 18% de las escritas por IA. Con su propia métrica de calidad, las notas de IA acertaron en el 88,8% de los casos, contra el 68,5% de las humanas.

El medio Indicator, especializado en verificación, miró la otra cara: en las tres primeras semanas de mayo de 2026, solo ocho cuentas de IA escribieron el 50,3% de todas las notas visibles en la plataforma.

Conviene leer estas fuentes sabiendo quién las firma. R Street es un centro de pensamiento con posiciones de política pública propias; Indicator es un medio dedicado a la verificación. Que coincidan en los datos y discrepen en la valoración hace del caso un buen punto de partida, no una conclusión cerrada.

## Tres lecciones

**Qué adoptar.** El criterio de puente para validar información: una afirmación vale más cuando la respaldan personas que suelen discrepar, no cuando la aplaude un solo bando. También el código y los datos abiertos, y una división del trabajo en la que la IA propone y las personas califican.

**Qué evitar.** La concentración. Que ocho cuentas automatizadas produzcan la mitad de lo que se ve es una forma de captura algorítmica, aunque cada nota haya pasado por calificadores humanos. Ese tipo de concentración debería medirse y publicarse, igual que se publica el resultado. Los datos sugieren, además, que la participación humana no se sostiene sola: sin comunidad ni incentivos, el espacio lo ocupa quien puede escribir a escala.

**Qué añadir.** Procedencia criptográfica. Una nota que remite a un enlace no garantiza que ese enlace diga mañana lo mismo que hoy. Una fuente guardada con su huella criptográfica y un sello de tiempo sí permite comprobar que nadie la cambió después. Es justamente lo que hacen los reportes canónicos del [Hash Republic Protocol](/proyectos/hash-republic-protocol).

## Lo que cambia para nosotros

De este caso sacamos tres reglas de diseño para OpenCivic: la IA puede proponer, pero deciden personas; la concentración de quién propone se mide y se muestra, no se esconde; y cada fuente queda fijada de forma verificable. Con esas tres reglas empezaremos a publicar notas verificadas: desmentidos breves, con fuentes que cualquiera pueda seguir hasta su origen.

## Fuentes

- [Community Notes — Wikipedia.](https://en.wikipedia.org/wiki/Community_Notes)
- [Código abierto del algoritmo de las Notas de la Comunidad — GitHub.](https://github.com/twitter/communitynotes)
- [R Street Institute (2026). AI Writers on Community Notes: An Evaluation of Seven Months of Data.](https://www.rstreet.org/research/ai-writers-on-community-notes-an-evaluation-of-seven-months-of-data/)
- [Indicator (2026). 8 AI bots now write 50% of X's Community Notes.](https://indicator.media/p/8-ai-bots-now-write-50-of-x-s-community-notes)
- [Columbia Journalism Review — análisis sobre los verificadores de IA en las Notas de la Comunidad.](https://www.cjr.org/analysis/x-twitter-ai-fact-checkers-community-notes-misinformation-bots.php)
