/* =========================================================================
   BARRABRAVA — Datos del restaurante
   Editá acá todo: carta, horarios, contacto, mapa.
   Los precios están en números (13, $ 13.000) y se formatean solos.
   ========================================================================= */

const RESTAURANTE = {
  nombre: 'Barrabrava',
  claim: 'Cocina de temporada · Mar del Plata',
  // Cambiá el 9 si tu WhatsApp es fijo. Formato: 54 + 9 + area(223) + numero
  whatsapp: '5492235969469',
  // Teléfono para el link tel: (formato internacional sin el 9)
  telefono: '+542235969469',
  telefonoLegible: '0223 596 9469',
  direccion: 'Calle San Lorenzo 1349',
  ciudad: 'B7600 Mar del Plata',
  provincia: 'Provincia de Buenos Aires',
  lat: -38.0177086,
  lng: -57.5439286,
  mapsPlace:
    'https://www.google.com/maps/place/%5BBARRABRAVA%5D+San+Lorenzo/@-38.0176689,-57.5446321,18.13z/data=!4m6!3m5!1s0x9584dd002eda22bf:0x6107bcff697c5253!8m2!3d-38.0177086!4d-57.5439286!16s%2Fg%2F11y8ls9j2l'
};

/* Mensaje pre-escrito que se abre en WhatsApp. Cambialo si querés. */
const MENSAJE_WHATSAPP =
  'Hola Barrabrava. Quiero hacer una reserva. ¿Me confirmás disponibilidad?\n' +
  'Fecha, hora y cantidad de personas:';

/* ------------------------------------------------------------------ */
/*  CARTA                                                              */
/*  Deduplicada del Info.txt original (los platos que se repetían con  */
/*  precios distintos quedaron con el valor más alto).                 */
/*  `desc` es un texto corto derivado del nombre del plato: revisalo   */
/*  antes de publicar. `foto` puede ser null → se muestra placeholder.  */
/* ------------------------------------------------------------------ */
const CARTA = [
  {
    categoria: 'Entradas',
    items: [
      {
        nombre: 'Carpaccio de Lomo',
        precio: 13,
        foto: 'carpaccio-de-lomo.jpg',
        desc: 'Lomo filetado fino, servido frío con hoja verde y aceite de oliva.'
      },
      {
        nombre: 'Ensalada Mediterránea',
        precio: 11,
        foto: null,
        desc: 'Hojas verdes con tomate, pepino y cebolla morada.'
      },
      {
        nombre: 'Tortilla con Alioli',
        precio: 10,
        foto: 'tortilla.jpg',
        desc: 'Tortilla de papa dorada, con alioli de ajo.'
      },
      {
        nombre: 'Tortilla Trufada',
        precio: 14,
        foto: null,
        desc: 'La misma tortilla de papa, con queso y trufa negra.'
      },
      {
        nombre: 'Champiñón del Mesón',
        precio: 13,
        foto: 'champinones-del-meson.jpg',
        desc: 'Champiñón de la casa, al estilo del mesón.'
      },
      {
        nombre: 'Provoleta con Queso Azul',
        precio: 15,
        foto: null,
        desc: 'Provoleta fundida coronada con queso azul.'
      },
      {
        nombre: 'Croquetas de Mortadela y Parmesano',
        precio: 12,
        foto: null,
        desc: 'Croquetas caseras de mortadela con parmesano.'
      },
      {
        nombre: 'Tarta Gallega',
        precio: 12,
        foto: null,
        desc: 'Masa quebrada rellena, receta gallega.'
      }
    ]
  },
  {
    categoria: 'Pescados y Mariscos',
    items: [
      {
        nombre: 'Rabas con Tártara',
        precio: 21,
        foto: 'rabas-con-tartara.jpg',
        desc: 'Rebanadas de pescado rebozadas, con salsa tártara.'
      },
      {
        nombre: 'Gambas al Ajillo',
        precio: 21,
        foto: 'gambas-al-ajillo.jpg',
        desc: 'Gambas salteadas con ajo, aceite y pimentón.'
      },
      {
        nombre: 'Bocata de Calamares',
        precio: 14,
        foto: null,
        desc: 'Calamares en pan, con alioli.'
      },
      {
        nombre: 'Arroz Cremoso con Gambas',
        precio: 17,
        foto: 'arroz-cremoso-con-gambas.jpg',
        desc: 'Arroz meloso y cremoso con gambas.'
      },
      {
        nombre: 'Lasagna de Mariscos',
        precio: 18,
        foto: 'lasagna-de-mariscos.jpg',
        desc: 'Capas de pasta con mariscos y salsa de tomate.'
      },
      {
        nombre: 'Ñoquis Verdes con Mejillones y Cantimpalo',
        precio: 16,
        foto: null,
        desc: 'Ñoquis de espinaca con mejillones y chorizo cantimpalo.'
      }
    ]
  },
  {
    categoria: 'Pastas',
    items: [
      {
        nombre: 'Fusilli con Pesto y Espuma de Parmesano',
        precio: 16,
        foto: null,
        desc: 'Espirales con pesto de albahaca y espuma de parmesano.',
        nota: 'En la carta original figura como “Fuzziles”, “Fucciles” y “Fusilli”.'
      }
    ]
  },
  {
    categoria: 'Carnes',
    items: [
      {
        nombre: 'Bife a la Criolla',
        precio: 16,
        foto: null,
        desc: 'Bife a la criolla, con guarnición.',
        nota: 'También aparece como “Ojo de Bife a la Criolla”.'
      },
      {
        nombre: 'Ternera Braseada con Parmentier',
        precio: 19,
        foto: 'ternera-braseada.jpg',
        desc: 'Ternera braseada, servida sobre puré parmentier.'
      },
      {
        nombre: 'Bondiola Glaseada con Puré de Batata',
        precio: 18,
        foto: 'bondiola-glaseada.jpg',
        desc: 'Bondiola glaseada con puré de batata.',
        nota: 'Versión con teriyaki disponible, al mismo valor.'
      },
      {
        nombre: 'Pepito de Bondiola con Pimientos y Provolone',
        precio: 17,
        foto: null,
        desc: 'Pepito de bondiola con pimientos y provolone.'
      },
      {
        nombre: 'Pepito de Carne con Provolone',
        precio: 17,
        foto: null,
        desc: 'Pepito de carne con provolone y pimientos verdes.'
      }
    ]
  }
];

/* ------------------------------------------------------------------ */
/*  BARRA — los platos con foto de bebida. Sin precio en el Info.txt */
/* ------------------------------------------------------------------ */
const BARRA = [
  { nombre: 'Gimlet', foto: 'gimlet.jpg', desc: 'Gin con lima y azúcar, bien frío.' },
  { nombre: 'Lunfa de Sidra', foto: 'lunfa-sidra.jpg', desc: 'Lunfa gelada de sidra.' },
  { nombre: 'Sangría', foto: 'sangria.jpg', desc: 'Frutos rojos con vino tinto.' }
];

/* ------------------------------------------------------------------ */
/*  GALERÍA — fotos sin plato asignado en la carta                      */
/* ------------------------------------------------------------------ */
const GALERIA = [
  { nombre: 'Langostinos a la plancha', foto: 'langostinos-a-la-plancha.jpg', desc: 'Del mar, a la plancha.' },
  { nombre: 'Barrabrava', foto: 'galeria-01.jpg', desc: 'Un plato de la casa.' },
  { nombre: 'De la barra', foto: 'galeria-02.jpg', desc: 'La noche en Barrabrava.' },
  { nombre: 'Ambiente', foto: 'galeria-03.jpg', desc: 'Un rincón del mesón.' },
  { nombre: 'Un brindis', foto: 'galeria-04.jpg', desc: 'Para cerrar la noche.' }
];

/* ------------------------------------------------------------------ */
/*  HORARIOS                                                            */
/*  dia: 0 = domingo … 6 = sábado.ahora: "HH:MM" en formato 24 h.       */
/*  Un día puede tener dos tramos (cena + mediodía del fin de semana).  */
/* ------------------------------------------------------------------ */
const HORARIOS = [
  { dia: 1, nombre: 'Lunes', tramos: [['20:00', '00:00']] },
  { dia: 2, nombre: 'Martes', tramos: [['20:00', '00:00']] },
  { dia: 3, nombre: 'Miércoles', tramos: [['20:00', '00:00']] },
  { dia: 4, nombre: 'Jueves', tramos: [['20:00', '00:00']] },
  { dia: 5, nombre: 'Viernes', tramos: [['20:00', '01:00']] },
  { dia: 6, nombre: 'Sábado', tramos: [['12:00', '15:30'], ['20:00', '01:00']] },
  { dia: 0, nombre: 'Domingo', tramos: [['12:00', '15:30'], ['20:00', '00:00']] }
];
/* ------------------------------------------------------------------ */
/*  RESEÑAS                                                            */
/*                                                                     */
/*  Reseñas reales de Google Maps, copiadas a mano. No hay API: para   */
/*  leerlas en vivo haría falta una clave de Maps Platform con         */
/*  facturación, y Google además prohíbe guardar el contenido.         */
/*                                                                     */
/*  CÓMO CARGAR UNA:                                                   */
/*    1. Abrí la ficha de Barrabrava en Google Maps.                  */
/*    2. Tocá "Escribir una reseña" → "Todas las reseñas".           */
/*    3. Copiá acá autor, nota, texto, fecha y link a su perfil.       */
/*                                                                     */
/*  Campos:                                                            */
/*    autor  (obligatorio)  nombre que figura en Maps                  */
/*    nota   (obligatorio)  1 a 5, entero                             */
/*    texto  (obligatorio)  la reseña, tal cual la escribió            */
/*    url    (recomendado)  link al perfil de esa persona en Maps     */
/*    cuando (opcional)     "hace 3 meses", "marzo 2026"...           */
/*    foto   (opcional)  link a la foto del avatar, si la hay          */
/*                                                                     */
/*  `puntaje` y `cantidad` son la nota global y el total de reseñas    */
/*  de Google. Opcionales: si quedan en null no se muestran, porque    */
/*  un número viejo en pantalla es peor que ninguno.                   */
/*                                                                     */
/*  La lista se pinta tal cual, sin recortes: se muestran todas las    */
/*  que cargues, en el orden en que las pongas.                        */
/*  Sin reseñas, la sección no aparece en el sitio.                    */
/* ------------------------------------------------------------------ */
/* ==================================================================== */
/*  >>>  DATOS DE EJEMPLO.  REEMPLAZAR ANTES DE PUBLICAR.  <<<          */
/*                                                                      */
/*  Estas reseñas NO son reales. Las escribió el que armó el sitio,      */
/*  para que la sección se viera. Hay que reemplazarlas por las de       */
/*  verdad, copiadas de la ficha de Google.                             */
/*                                                                      */
/*  Borraste esta línea cuando las hayas cambiado de verdad:             */
/*     >>> revisar: quedan reseñas de ejemplo? <<<                       */
/* ==================================================================== */
const RESENAS = {
  puntaje: 4.6,    // nota global de Google
  cantidad: 212,   // total de reseñas en Google
  lista: [
    {
      autor: 'Carla M.',
      nota: 5,
      texto: 'Los langostinos de la plancha son los mejores que probé en Mar del Plata. Y el pulpo a la parrilla, con alcaparras y limón, es de otro planeta.',
      cuando: 'hace 3 semanas'
    },
    {
      autor: 'Diego A.',
      nota: 5,
      texto: 'Fuimos un jueves sin reserva y en diez minutos nos sentaron igual. El servicio es rápido y la comida valió la espera.',
      cuando: 'hace 2 meses'
    },
    {
      autor: 'Florencia R.',
      nota: 4,
      texto: 'Excelente la pasta, pedí los ravioles que no fallan. El local es chico y se llena, así que paciencia con la mesa.',
      cuando: 'hace 4 meses'
    },
    {
      autor: 'Nicolás P.',
      nota: 5,
      texto: 'Cena de cumpleaños. Nos recomendaron el pulpo y el vitel toné, dos platos que no tienen error. Nos trataron muy bien.',
      cuando: 'marzo 2026'
    },
    {
      autor: 'Sofía L.',
      nota: 5,
      texto: 'Volvimos tres veces desde que abrieron. La carta es corta y todo lo que está en ella está bien hecho.',
      cuando: 'diciembre 2025'
    }
  ]
};