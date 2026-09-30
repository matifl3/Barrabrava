# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS plano, sin build step. Elegido explícitamente por el usuario: HTML + CSS + JavaScript, sin framework. El contenido vive en `data.js` y la lógica de render y navegación por hash en `app.js`, ambos editables a mano.

## Users

Visitantes locales de Mar del Plata y turistas que buscan dónde cenar en el centro. Llegan por búsqueda o por el enlace de Google Maps del local, casi siempre desde el teléfono, y en general de noche: el restaurante abre a las 20:00. Su trabajo concreto es **decidir si reservar y ver la carta antes de hacerlo**, en pocos segundos y sin llamar primero.

## Product Purpose

Sitio de una sola página para un restaurante real que ya abre. Su propósito es que un desconocido entienda qué es Barrabrava, vea la carta completa con precios y pueda dejar una reserva sin fricción. El éxito es una reserva: alguien que llega al local porque la web lo convenció.

## Positioning

Barrabrava es cocina de temporada en San Lorenzo 1349, en el centro de Mar del Plata. La carta combina mariscos, pastas, carnes y una barra propia; la franja dominante de la casa es la cena tardía (20:00 a la medianoche o la 01:00) con almuerzo de fin de semana. No es un restaurante genérico de barrio: es un local de cena que ya tiene oficio propio, y hoy su única presencia digital es una ficha de Google Maps.

## Operating Context

- Un solo restaurante, un local, un turno por día más el almuerzo de sábado y domingo.
- La reserva no se toma online: se negocia por WhatsApp o llamada telefónica.
- Google Maps es hoy el canal de descubrimiento real; la web tiene que competir con la ficha del Maps sin contradecirla.
- Quienes responden las reservas son el mesero, el dueño o el personal del local; la web no tiene backoffice.

## Capabilities and Constraints

- Navegación de tres vistas (`Inicio`, `Carta`, `Contacto`) con deep-links por hash: `#/inicio`, `#/carta`, `#/contacto`.
- Carta renderizada desde `data.js`: 20 platos deduplicados en 4 categorías (Entradas, Pescados y Mariscos, Pastas, Carnes) más 3 bebidas sin precio en `La Barra`.
- Los precios van de `$ 10,00` a `$ 21,00` y se muestran literalmente así, tal como están en la fuente. El dueño no los multiplicó por 1000; no corregirlos sin confirmación.
- Galería de 5 fotos de platos y ambiente que no están asignados a un plato de la carta.
- Horarios en vivo con estado abierto/cerrado, incluyendo tramos que cruzan medianoche (viernes y sábado hasta la 01:00).
- Formulario de reserva que compone un mensaje y lo abre en WhatsApp con los datos del visitante.
- Embebido de Google Maps más enlace directo a la ficha del local.
- Sin backend, sin base de datos, sin login, sin sistema de gestión.
- **Riesgo conocido y aceptado por el usuario:** el único teléfono del local es el fijo `0223 596 9469`, y el enlace de WhatsApp se construye con él (`wa.me/5492235969469`). El fijo probablemente no recibe mensajes de WhatsApp. El usuario fue avisado y decidió conservarlo. La web debe ofrecer llamada telefónica como vía principal para que la reserva no se rompa.

## Brand Commitments

- Nombre: **Barrabrava**. No hay logo, ni carta impresa, ni identidad previa: todo está en Google Maps. Esta web es la primera identidad visual del local, y su libertad de forma es total.
- Paleta fijada por el usuario: primario `#E5C365`, secundario `#1A1A1A`, fondo `#F9F8F3`, texto `#2B2B2B`, acento/glow `#FFE082`, ilustración `#888888`. Modo claro solamente; el modo oscuro fue descartado explícitamente.
- Tipografía fijada por el usuario: `Playfair Display SC` para display y `Karla` para texto.
- Tono de voz: hospitalario, directo y sin advertising. Cocina de temporada, no sushi, no delivery.
- **Preferencia de pie (canon):** el usuario eligió explícitamente el camino familiar, el estándar de la categoría, por encima de la dirección que tiró el dado. Se ejecuta con fidelidad total, sin ironía ni rareza colada.
- **Vara de oficio:** la carta impresa de temporada de un restaurante de temporada — papel, jerarquía, fotos de plato, tipografía de menú. Si la web se ve peor que esa carta impresa, falló.

## Evidence on Hand

- `Info.txt` es la fuente de verdad de carta, precios, horarios, dirección y teléfono. Ojo: está mal parseado, por eso el original arrastra errores de tipeo y precios en duplicado que ya se deduplicaron en `data.js`.
- 17 fotos reales de platos, bebidas y ambiente en `assets/fotos/`. La mayoría mide `172×224` px, salvo una de `714×832`. Son fotos pequeñas: sirven para ficha y galería, no como hero full-bleed.
- Ficha de Google Maps del local, con su enlace canónico.
- **Lo que no existe y no se puede inventar:** reseñas, testimonios, premios, chef con nombre, año de fundación, número de cubiertos, formas de pago, menú de temporada rotativo. Cualquier dato de ese tipo está prohibido.
- Las descripciones de los platos en `data.js` fueron redactadas por una mano anterior a partir del nombre del plato; el dueño todavía no las validó. Son contenido provisional, no un hecho del negocio.

## Product Principles

1. **La reserva es la única conversión.** Todo lo demás existe para llevarla a cabo. Un visitante que no entiende qué hacer en los primeros segundos es un fallo del sitio, no una limitación de su atención.
2. **No mentir.** Es un local real abierto. Nada de reseñas, premios ni cifras inventadas. La web puede ser ambiciosa visualmente; los hechos van atados a la fuente.
3. **Carta completa y honesta.** El visitante tiene que poder decidir sin llamar. Precios a la vista, fotos reales, carta completa.
4. **Pensado para el teléfono, de noche.** La visita ocurre de noche, en un celular, con una barra de búsqueda de fondo. La reserva tiene que funcionar con una mano.
5. **Ser la mejor carta del local.** Google Maps tiene fotos genéricas y cero carta legible. Ese es el hueco que esta web llena.

## Accessibility & Inclusion

WCAG 2.1 AA como mínimo: contraste verificado en 23 pares, navegación por teclado operativa, precios legibles en pantallas angostas sin overflow horizontal, etiquetas ARIA en navegación y formulario, y estado de apertura nunca oculto solo por color.
