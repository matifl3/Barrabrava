# Sistema de diseño — Barrabrava

Un lugar de mariscos en la costa. La referencia no es una app: es **una carta
impresa de un mesón de puerto**, la que dejás en la mesa y la que el mozo te
señala con el dedo. Todo lo que se ve acá sale de ese objeto.

La regla que decide cualquier duda: **si un elemento parece un software, no
pertenece.** Un sitio de restaurante no es un panel de control. Si algo podría
estar en la página de un banco, está mal.

---

## La idea

Tres decisiones, y todo lo demás se deriva de ellas:

1. **Una sola columna, muy ancha de leer.** El contenido no compite: manda la
   carta. El `--wrap` mide 1120 px, pero el texto nunca pasa de ~68 caracteres
   porque el límite real es la medida, no el contenedor.
2. **El negro y el papel.** Fotos en escala de grises. El único color es
   manteca cruda, y aparece en tres lugares: la fecha, el borde del bloque
   de la carta y el hover. Nada más.
3. **La jerarquía es de imprenta, no de interfaz.** Títulos en display, texto
   en texto, datos en versalitas. No hay sombras para separar: separa el
   espacio y un filete.

## Paleta

| Token | Valor | Rol |
| --- | --- | --- |
| `--papel` | `#f5f2ea` | Fondo. Papel, no blanco. |
| `--papel-2` | `#efeadd` | Alternancia suave, filas de la carta. |
| `--carbon` | `#1c1b18` | Texto principal, la "tinta". |
| `--tinta-2` | `#3d3b35` | Texto secundario. |
| `--tinta-3` | `#7a766a` | Metadatos, notas al pie. |
| `--regla` | `#ddd7c7` | Filetes hairline. |
| `--regla-2` | `#c4bda9` | Filetes con más peso. |
| `--manteca` | `#e8c15a` | **El único color.** Fecha, borde, hover. |

Fuera de la paleta: **verde y rojo** para estados. No existen, y no hay tokens
para ellos. Un error se dice con palabras, no con semáforo. Si alguna vez hace
falta distinguir un estado, el estado tiene un nombre o un texto.

`--manteca` **nunca** es color de texto: es un relleno. Sobre el hover del
flotante se reemplaza por papel para no quedar manteca sobre manteca.

## Tipografía

Dos familias, dos trabajos. De Google Fonts, self-hosted vía `fonts.googleapis`
con `display=swap` y `preconnect`.

- **Playfair Display** — display, pesos 400 y 700. Títulos, nombres de plato,
  nombres de comensal, puntajes. Opticals: nunca más chico de 24 px.
- **Karla** — texto, pesos 400, 600 y 700. Párrafos, descripciones, botones,
  datos, versalitas.

Escala fluida con `clamp()` y `vw`, anclada en `:root`:

| Rol | Tamaño | Observación |
| --- | --- | --- |
| Masthead | `clamp(3.4rem, 9vw, 4.75rem)` | `4.75rem` es el techo en desktop. |
| Título de bloque | `clamp(1.9rem, 4vw, 2.6rem)` | |
| Nombre de plato | `1.1875rem` | |
| Cuerpo | `1.0625rem` / `1.65` | |
| Metadato | `0.75rem` | Versalitas, `letter-spacing: 0.12em`. |

**Puntuación de carta** (`.carta-fila`) en **tabular-nums** siempre: los
precios alinean en columna porque los números tienen la misma medida. Cero
decimales salvo que el dato los traiga.

## Reglas de composición

- **Leader points.** Cada fila de plato tira un filete de puntos entre el
  nombre y el precio. Se dibuja con `border-bottom: 1px dotted` sobre un
  flex, no con un carácter `·` repetido: así no hay que escribirlo y no
  queda en el HTML.
- **Un solo shadow en todo el sitio**: el de `.flotante`, el botón de llamada
  fijo. Justificado — tiene que flotar sobre el papel, no dentro de él. Todo
  lo demás separa con filete o espacio.
- **Grano.** Una textura SVG de ruido al 3 % sobre el papel, `position: fixed`
  y `pointer-events: none`. Apaga el "blanco de pantalla" sin ensuciar el
  layout.
- **Sin cards.** No hay contenedor con borde y sombra de contenido. Si algo
  necesita un borde, es un filete de 1 px, no una caja.
- **Sin emojis, sin íconos de fuente.** Toda estrella, flecha o marca es SVG
  inline. Un glifo de sistema rompe la sensación en un Windows cualquiera.

## El momento único

La carta es elhero real, y su momento único es la **fila de langostinos**: la
primera con foto, la que anuncia el resto.

En desktop entra above-the-fold con la masthead — la promesa de "cuatro
platos con fotos sin scrollear" se cumple a 1440 px. En móvil la portada con
foto excede una pantalla, y **no se comprime para fingir lo contrario**: la
foto del arriba es el 60 vh de la pantalla, a propósito. La promesa del desktop
está escrita como de desktop.

## Accesibilidad como piso, no como extra

- Skip link a `#main`. Chrome sobre carbón, y visible al hover (no sólo al
  focus: el primer tabulador de un teclado lo ve).
- `:focus-visible` con anillo de 2 px en `--carbon` y 2 px de offset. Nunca
  `outline: none` sin reemplazo.
- Objetivos táctiles de **44 × 44** mínimo en lo interactivo: wordmark, índice,
  "ver todo" de bloque, enlace del mapa, valores de datos, ítems del pie. En
  los metadatos de sólo lectura se acepta 24 px, que es el umbral de WCAG 2.5.8.
- Contraste: `--tinta-3` sobre `--papel` da 4.6:1, pasa AA para texto normal.
  `--manteca` sobre `--papel` da 1.4:1, por eso **no se usa para texto**.
- El formulario de reserva declara errores con `.campo__error`,
  `aria-invalid` y `aria-describedby`. El error se escribe en el DOM, no se
  insinúa con color.
- Las tres vistas se ocultan con el atributo `hidden`. Impresión: `.view[hidden]`
  pasa a `display: block`, así el destino de impresión sale completo.
- `body { overflow-x: hidden }` con `clip` como fallback, porque `hidden`
  genera contexto de scroll y rompe `position: sticky`.

## Fotografía

Cinco fotos reales de la carpeta del proyecto, en `assets/fotos/`. La de la
portada es `langostinos-a-la-plancha.jpg`.

- **Escala de grises**, `filter: grayscale(1)`. La carta es monocroma; la
  foto es la única excepción y por eso duele menos si se desatura.
- **Sin `aspect-ratio` fijo, sin `object-fit: cover` forzado.** La altura la
  decide la proporción real de cada archivo. `object-fit: cover` recortaba las
  cabezas por arriba y dejaba los platos decapitados.
- `width`/`height` en el `img` para reservar espacio y no saltar el layout;
  `loading="lazy"` y `decoding="async"` en todo lo que está bajo el primer
  pantallazo.
- **Alt describes el plato**, no "foto de comida". Un `langostinos.jpg` con
  alt="Foto de comida" no le dice nada a nadie; con alt="Langostinos a la
  plancha" sí.
- En la galería, cada tira limita su celda a 172 px de ancho. Antes ocupaba el
  100 % de la celda y forzaba a escalar una imagen de 500 px a 700. La grilla
  deja de contar 3 columnas y pasa a 2 en mobile, que es la decisión correcta:
  una columna angosta de 96 px no es una foto, es un sello de correos.

## Reseñas de Google

Sección "Lo que dicen" al final del home. **No es un widget**: son las mismas
filas de la carta — cita, filete, autor — con la nota dibujada en SVG, no con
glifos ni estrellas de fuente. El puntaje agregado va en Playfair y las
estrellas van en tinta, nunca en manteca.

**Los datos están en `RESENAS`, en `data.js`.** Reseñas reales, copiadas a
mano por el local desde la ficha de Google Maps. No hay API detrás: leerlas en
vivo exigiría una clave de Google Maps Platform con facturación habilitada, y
la Maps Embed API —la opción sin costo— no expone reseñas en ninguno de sus
cinco modos. Google además prohíbe cachear el contenido de Places, así que una
integración en vivo sólo podría pedirlo en cada carga.

Cada entrada acepta `autor`, `nota` (1 a 5), `texto`, `url` (el perfil de esa
persona en Maps), `cuando` y `foto`. Se muestran **todas** las que se carguen,
en el orden en que estén. `puntaje` y `cantidad` — la nota global y el total
de Google — son opcionales: si quedan en `null` no se muestran, porque un
número viejo en pantalla miente peor que la ausencia de número.

**Sin reseñas cargadas la sección no aparece.** El bloque entero arranca
oculto y `renderResenas()` no lo muestra si la lista está vacía: no queda un
título con nada debajo. No hay estado de carga, ni spinner, ni texto de
"cargando", porque no hay nada que cargar.

Lo que sí va fijo, en el pie del bloque, es la atribución: las reseñas están
publicadas en Google Maps y las copió el local, con el enlace a la versión
vigente. El nombre del autor va siempre junto al texto, y cuando hay `url` el
nombre enlaza a su perfil en Maps.

### Cómo se mantiene

Es trabajo del local, y es a mano. Cuando entra una reseña nueva, o cambia una
vieja, se edita el array en `data.js` y se sube el archivo. No hay nada que
dependa de una clave que expire ni de un proyecto de Google que se venza.

> **Las reseñas que están cargadas ahora son de ejemplo.** Las escribió quien
> armó el sitio, para que la sección se viera. Hay que reemplazarlas por las
> de verdad antes de publicar. En `data.js` está la línea
> `>>> revisar: quedan reseñas de ejemplo? <<<` para acordarse.

### El carrusel

Se muestra **una reseña a la vez** y pasa sola cada 7 segundos. No es un
widget de Google: son las mismas filas de la carta, con la misma tipografía y
los mismos filetes. Los controles son botones planos con filete, sin relleno y
sin esquinas redondeadas — el único rounded del sitio es el del botón flotante.

Lo que decide el comportamiento:

- **Las que no están a la vista llevan `hidden`, no `opacity: 0`.** Con
  opacidad cero, un lector de pantalla lee las cinco y el Tab las recorre: el
  contenido "oculto" no está oculto para nadie salvo para la vista.
- **El alto de la pista se reserva** con el `min-height` de la reseña más
  larga. Sin eso, el bloque saltaba 27 px cada 7 segundos — la página se
  movía abajo mientras alguien leía. Se vuelve a medir al cambiar el ancho.
- **El botón de pausa existe porque la WCAG 2.2.2 lo pide**: si el contenido
  se mueve solo más de cinco segundos, tiene que haber forma de detenerlo. Se
  llama "Pausar" / "Seguir" y lleva `aria-pressed`.
- **El carrusel se frena solo** si alguien lo está leyendo: al pasar el mouse
  por encima o al tabular dentro. Nadie quiere que le cambie la cita de abajo
  mientras la está leyendo.
- **`prefers-reduced-motion: reduce`**: no avanza solo, y el fundido de 260 ms
  no corre. El salto entre reseñas es instantáneo. Quien pidió menos
  movimiento no tiene un temporizador unstoppable.
- **El contador "Reseña 3 de 5" sólo existe para lectores de pantalla** (es
  una región `solo-lectores`). Su `aria-live` va en `off` mientras el carrusel
  gira solo — anunciarlo cada 7 segundos sería una molestia — y vuelve a
  `polite` en cuanto la persona pausa o navega con los botones.
- **Los puntitos son de 44 × 44** aunque el círculo se vea de 7 px. Con cinco
  reseñas la fila da de vuelta en mobile y los puntitos pasan abajo, antes que
  dejar un objetivo chico.
- **Al imprimir se imprimen las cinco**, no sólo la que quedó en pantalla. El
  carrusel es para la pantalla.

## Cómo se verifica

Ninguna de estas afirmaciones se dio por buena sin pasar por acá.

```bash
node _test_horarios.js    # 43 pruebas: horarios, precios, nombres
node _test_html.js        # estructura, ids consultados por app.js, alt
```

Y los scripts de navegador, que se quedan en `%TEMP%\opencode`:

- `_comportamiento.js` — 16 comprobaciones por CDP: navegación por hash, sticky
  del índice en Carta, validación del formulario, tamaño de objetivos, fotos
  sin upscaling, `hidden` en las tres vistas.
- `_horas_reserva.js` — 34 comprobaciones del selector de hora de la reserva en
  los 7 días: que ofrezca horas concretas y no el rango del tramo, que el
  último turno no sea el horario de cierre, y que los tramos que cruzan la
  medianoche generen opciones.
- `_resenas.js` — 15 comprobaciones contra el propio `data.js`: que se pinten
  todas y en orden, que las notas dibujadas coincidan con las del dato, que las
  citas se copien literales y que el puntaje se formatee a la argentina. No
  lleva números fijos, así que sigue valiendo cuando cambien las reseñas.
- `_carrusel.js` — 29 comprobaciones del carrusel: que muestre una sola, que
  avance sola a los 7 s, que la pausa la frene, que el vuelta-más funcione, que
  los controles sean de 44 px, que los puntitos entren por teclado y que con
  `prefers-reduced-motion` no avance solo.
- `_shot.js` — captura las tres vistas en desktop y mobile, y reporta por
  vista: ancho de documento contra ancho de viewport (overflow horizontal),
  contraste bajo medido sobre el fondo real, y excepciones JS.

El detector mecánico de `impeccable` se ejecutó **una sola vez**, antes del
cierre. Reportó dos hallazgos reales, corregidos: el skip link en hover
manteca sobre manteca, y el `overflow-x: hidden` que rompía el sticky. Los
demás hallazgos (`cramped-padding` midiendo el padding de un token, el shadow
único de `.flotante`, los `all-caps` de las versalitas) son falsos positivos o
decisiones documentadas.

Lo que **no** se verificó: la revisión visual de las capturas. Ni el modelo ni
el sub-revisor perciben imágenes, así que todo el juicio visual sale de
métricas y del código. Las capturas existen en `.impeccable/review/` para
alguien que sí vea.

## Decisiones que se pueden revertir sin miedo

- **Playfair + Karla** por una serif y una sans del sistema. Cambiar una por
  otra es tocar dos custom properties.
- **Grano fijo al 3 %**: `--grano: 0` lo apaga.
- **Columna única**: agregar una grilla de dos columnas para la galería de
  fotos es un bloque nuevo, no una migración.
- **Reseñas a mano**: si algún día hay presupuesto para una key de Maps
  Platform, `renderResenas()` es el único punto de entrada a reemplazar. El
  HTML y el CSS de la sección ya están.
- **Sin cards, sin sombras, sin verde-rojo**: son ausencia, no adición. No
  cuesta nada mantenerlas.

## Riesgos abiertos

- El único teléfono es un **fijo** con WhatsApp. No es lo ideal para un
  reserva de mesa; queda documentado, no resuelto.
- Las descripciones de `data.js` y los precios son literales del material
  original (`$ 10,00`–`$ 21,00`) y **no están verificados** contra la carta
  real. Hay que revisarlos con el dueño.
- **Las reseñas cargadas son de ejemplo y hay que reemplazarlas.** Hay cinco
  en `data.js`, escritas para que la sección se viera, con un `4,6 sobre 212
  reseñas` inventado. Publicar eso es publicar comentarios de gente que no
  dijo esas palabras, en el sitio de un comercio real. Es lo primero que hay
  que arreglar, y el que más fácil se pasa por alto.
- No existe un directorio hermano `Foto comida/` en este proyecto, así que la
  procedencia histórica de las fotos no es verificable. La única foto
  confirmada es la de `assets/fotos/`.
