/* =========================================================================
   BARRABRAVA — Lógica de la página
   Render de la carta como filas de menú impreso (nombre, puntitos, precio),
   horarios en vivo, índice de categorías y armado del mensaje de WhatsApp.
   ========================================================================= */

(function () {
  'use strict';

  var FOTOS = 'assets/fotos/';

  /* Platos que abren la carta en la portada: los primeros de la categoría
     que define al local. Es un extracto real, no una selección de marketing. */
  var CATEGORIA_PORTADA = 'Pescados y Mariscos';
  var CUANTOS_PORTADA = 4;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };

  /* ---------- utilidades ------------------------------------------- */

  function crear(tag, clase, texto) {
    var el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto != null) el.textContent = texto;
    return el;
  }

  /* "$ 13,00" — mismo formato que el Info.txt original (coma decimal) */
  function precio(n) {
    return '$ ' + n.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function minutos(hhmm) {
    var p = hhmm.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function hhmm(m) {
    m = ((m % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' +
           String(m % 60).padStart(2, '0');
  }

  function linkWA(texto) {
    return 'https://wa.me/' + RESTAURANTE.whatsapp +
           '?text=' + encodeURIComponent(texto);
  }

  function slug(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // saca acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /* ---------- horarios ---------------------------------------------- */

  /* Devuelve true si el local está abierto en el instante `now`.
     Los tramos que cruzan la medianoche (20:00 → 01:00) tienen dos partes:
     la que empieza hoy y la cola que cae mañana. */
  function estaAbierto(now) {
    var dia = now.getDay();
    var t = now.getHours() * 60 + now.getMinutes();
    var ayer = (dia + 6) % 7;

    for (var i = 0; i < HORARIOS.length; i++) {
      var cfg = HORARIOS[i];
      for (var j = 0; j < cfg.tramos.length; j++) {
        var ini = minutos(cfg.tramos[j][0]);
        var fin = minutos(cfg.tramos[j][1]);
        if (fin <= ini) fin += 1440;   // "00:00" o cruce de medianoche

        // 1) la parte que empieza hoy
        if (cfg.dia === dia && t >= ini && t < Math.min(fin, 1440)) return true;

        // 2) la cola de un tramo que empezó AYER y pasó la medianoche
        //    (ej: viernes 20:00–01:00 → abierto a las 00:30 del sábado)
        if (fin > 1440 && cfg.dia === ayer && t < fin - 1440) return true;
      }
    }
    return false;
  }

  /* Próxima apertura, buscando hasta 8 días por delante. */
  function proximaApertura(now) {
    var hoy = now.getDay();
    var t = now.getHours() * 60 + now.getMinutes();

    for (var add = 0; add <= 7; add++) {
      var dia = (hoy + add) % 7;
      for (var i = 0; i < HORARIOS.length; i++) {
        var cfg = HORARIOS[i];
        if (cfg.dia !== dia) continue;
        for (var j = 0; j < cfg.tramos.length; j++) {
          var ini = minutos(cfg.tramos[j][0]);
          if (add === 0 && ini <= t) continue;
          return {
            hora: cfg.tramos[j][0],
            dia: cfg.nombre,
            cuando: add === 0 ? 'hoy' : add === 1 ? 'mañana' : cfg.nombre.toLowerCase()
          };
        }
      }
    }
    return null;
  }

  /* Hora en que termina el tramo vigente ahora mismo (o el de ayer, si
     estamos en la cola de un tramo que cruzó la medianoche). */
  function cierreVigente(now) {
    var dia = now.getDay();
    var t = now.getHours() * 60 + now.getMinutes();

    for (var i = 0; i < HORARIOS.length; i++) {
      var cfg = HORARIOS[i];
      for (var j = 0; j < cfg.tramos.length; j++) {
        var ini = minutos(cfg.tramos[j][0]);
        var fin = minutos(cfg.tramos[j][1]);
        if (fin <= ini) fin += 1440;

        var parteHoy = cfg.dia === dia && t >= ini && t < Math.min(fin, 1440);
        var colaAyer = fin > 1440 && cfg.dia === (dia + 6) % 7 && t < fin - 1440;

        if (parteHoy || colaAyer) return hhmm(fin);
      }
    }
    return '';
  }

  function renderEstado() {
    var now = new Date();
    var abierto = estaAbierto(now);
    var badge = $('#estado-local');
    var texto = $('#estado-texto');

    badge.classList.toggle('estado--abierto', abierto);
    badge.classList.toggle('estado--cerrado', !abierto);

    var prox = proximaApertura(now);
    var cierre = abierto ? cierreVigente(now) : '';

    texto.textContent = abierto
      ? 'Abierto ahora' + (cierre ? ' · cierra a la ' + cierre : '')
      : (prox ? 'Cerrado · abrimos ' + prox.cuando + ' a las ' + prox.hora
              : 'Cerrado');

    var pie = $('#estado-footer');
    if (pie) pie.textContent = abierto ? 'Abierto ahora' : 'Cerrado ahora';
  }

  function renderHorarios() {
    var lista = $('#lista-horarios');
    var hoy = new Date().getDay();
    lista.textContent = '';

    HORARIOS.forEach(function (cfg) {
      var esHoy = cfg.dia === hoy;
      var li = crear('li', 'h');
      li.dataset.hoy = String(esHoy);

      li.appendChild(crear('span', 'h__dia', cfg.nombre));
      if (esHoy) li.appendChild(crear('span', 'h__hoy', 'hoy'));
      li.appendChild(crear('span', 'h__puntitos'));

      var texto = cfg.tramos.map(function (t) {
        return t[0] + ' – ' + t[1];
      }).join('  ·  ');
      li.appendChild(crear('span', 'h__hora', texto));

      lista.appendChild(li);
    });

    var prox = proximaApertura(new Date());
    var caja = $('#horario-proximo');
    if (caja) {
      caja.textContent = '';
      caja.appendChild(document.createTextNode('Próxima apertura: '));
      caja.appendChild(crear('strong', null,
        prox ? prox.dia.toLowerCase() + ' ' + prox.hora : 'sin datos'));
    }
  }

  /* ---------- fila de carta ----------------------------------------- */

  /* Una fila de menú impreso: nombre, puntitos guía y precio alineado a la
     derecha. Los platos sin foto simplemente no la tienen: una carta
     impresa no reserva un recuadro vacío por cada plato. */
  function fila(item, i) {
    var li = crear('li', 'mrow');
    li.style.setProperty('--i', String(i));

    if (item.foto) {
      var foto = crear('div', 'mrow__foto');
      var img = crear('img');
      img.src = FOTOS + item.foto;
      img.alt = item.nombre;
      img.loading = 'lazy';
      img.decoding = 'async';
      // resolución nativa: 172×224 salvo una. No se escalan hacia arriba.
      img.width = 172;
      img.height = 224;
      foto.appendChild(img);
      li.appendChild(foto);
    }

    var cuerpo = crear('div', 'mrow__cuerpo');

    var linea = crear('div', 'mrow__linea');
    linea.appendChild(crear('p', 'mrow__nombre', item.nombre));

    if (item.precio != null) {
      linea.appendChild(crear('span', 'mleader'));
      linea.appendChild(crear('span', 'mrow__precio', precio(item.precio)));
    } else {
      // La barra no tiene precio en el Info.txt: se dice, no se disimula.
      linea.appendChild(crear('span', 'mrow__consulta', 'a consultar'));
    }

    cuerpo.appendChild(linea);
    if (item.desc) cuerpo.appendChild(crear('p', 'mrow__desc', item.desc));
    if (item.nota) cuerpo.appendChild(crear('p', 'mrow__nota', item.nota));

    li.appendChild(cuerpo);
    return li;
  }

  function todasLasCategorias() {
    var cats = CARTA.slice();

    // La barra se agrega como categoría propia, al final
    cats.push({
      categoria: 'La Barra',
      items: BARRA.map(function (b) {
        return { nombre: b.nombre, desc: b.desc, foto: b.foto, precio: null };
      })
    });
    return cats;
  }

  /* ---------- render de la carta ------------------------------------ */

  function renderCarta() {
    var cats = todasLasCategorias();

    /* Índice de categorías, como el índice de una carta impresa.
       Se cuelga del .wrap interno del nav, que es lo que le da recorrido
       al sticky. */
    var filtros = $('#carta-filtros .indice__wrap');
    filtros.textContent = '';
    var ul = crear('ul', 'indice__lista');
    cats.forEach(function (c, i) {
      var li = crear('li');
      var a = crear('a', 'indice__item', c.categoria);
      a.href = '#cat-' + slug(c.categoria);
      a.dataset.cat = String(i);
      li.appendChild(a);
      ul.appendChild(li);
    });
    filtros.appendChild(ul);

    /* Lista */
    var cont = $('#carta-lista');
    cont.textContent = '';

    var n = 0;
    cats.forEach(function (c, i) {
      var sec = crear('section', 'categoria');
      sec.id = 'cat-' + slug(c.categoria);
      sec.dataset.cat = String(i);

      var h = crear('h3', 'categoria__title', c.categoria);
      h.appendChild(crear('span', 'categoria__cuenta',
        c.items.length + (c.items.length === 1 ? ' plato' : ' platos')));
      sec.appendChild(h);

      var lista = crear('ul', 'menu');
      c.items.forEach(function (item) {
        lista.appendChild(fila(item, n++));
      });
      sec.appendChild(lista);
      cont.appendChild(sec);
    });
  }

  /* ---------- portada: extracto real de la carta --------------------- */

  function renderPortada() {
    var cats = todasLasCategorias();
    var cat = null;
    cats.forEach(function (c) { if (c.categoria === CATEGORIA_PORTADA) cat = c; });
    if (!cat) return;

    var cont = $('#carta-portada');
    cont.textContent = '';
    cat.items.slice(0, CUANTOS_PORTADA).forEach(function (item, i) {
      cont.appendChild(fila(item, i));
    });

    var barra = $('#barra-portada');
    barra.textContent = '';
    BARRA.forEach(function (b, i) {
      barra.appendChild(fila({ nombre: b.nombre, desc: b.desc, foto: b.foto }, i));
    });
  }

  /* ---------- galería ------------------------------------------------ */

  function renderGaleria() {
    var cont = $('#galeria-inicio');
    cont.textContent = '';

    GALERIA.forEach(function (g, i) {
      var li = crear('li', 'tira');
      li.style.setProperty('--i', String(i));

      var img = crear('img', 'tira__img');
      img.src = FOTOS + g.foto;
      img.alt = g.nombre;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 172;
      img.height = 224;
      li.appendChild(img);

      var pie = crear('figcaption', 'tira__pie');
      pie.appendChild(crear('span', 'tira__nombre', g.nombre));
      pie.appendChild(crear('span', 'tira__desc', g.desc));
      li.appendChild(pie);

      cont.appendChild(li);
    });
  }

  /* ---------- contacto ---------------------------------------------- */

  /* Una sola familia de íconos: trazo 1.6, 24×24, sin relleno. */
  var ICO = {
    pin: '<path d="M12 21.2s7-6.2 7-11.2a7 7 0 1 0-14 0c0 5 7 11.2 7 11.2Z"/><circle cx="12" r="2.6"/>',
    tel: '<path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.5 19.5 0 0 1-8.5-3 19.2 19.2 0 0 1-5.9-5.9 19.5 19.5 0 0 1-3-8.6A2 2 0 0 1 3.4 2H6a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L7 9.6a15.7 15.7 0 0 0 5.9 5.9l1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2Z"/>',
    wa: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.6-4.4a8.4 8.4 0 1 1 15.4-4.5Z"/><path d="M9 9.4c.3-.7.6-.7 1-.7h.6c.2 0 .5 0 .7.6l.7 1.7c.1.3 0 .5-.1.7l-.4.5c-.1.2-.3.3-.1.6a7 7 0 0 0 3 2.6c.3.1.5 0 .6-.1l.5-.6c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5a2.4 2.4 0 0 1-1.6 1.5c-.6.1-1.4 0-2.7-.8a9.6 9.6 0 0 1-3.8-3.8c-.7-1.2-.9-2-.8-2.5Z"/>'
  };

  function icono(cual) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = ICO[cual];
    return svg;
  }

  function renderContacto() {
    var r = RESTAURANTE;

    /* Link del mapa con las coordenadas exactas */
    $('#mapa-link').href = r.mapsPlace;

    var mapaSrc =
      'https://www.google.com/maps?q=' + r.lat + ',' + r.lng +
      '&z=18&hl=es&output=embed';
    var iframe = $('#mapa');
    iframe.src = mapaSrc;
    iframe.title = 'Mapa de Barrabrava en ' + r.direccion + ', ' + r.ciudad;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen', '');

    /* Datos. Llamar es la vía principal: el único número es un fijo. */
    var datos = $('#datos-contacto');
    datos.textContent = '';

    var filas = [
      { ico: 'pin', label: 'Dirección',
        value: r.direccion + ', ' + r.ciudad, href: r.mapsPlace },
      { ico: 'tel', label: 'Teléfono',
        value: r.telefonoLegible, href: 'tel:' + r.telefono },
      { ico: 'wa', label: 'Reservas por WhatsApp',
        value: 'Escribinos', href: linkWA(MENSAJE_WHATSAPP) }
    ];

    filas.forEach(function (f) {
      var li = crear('li', 'dato');
      li.appendChild(icono(f.ico));

      var div = crear('div', 'dato__txt');
      div.appendChild(crear('span', 'dato__etq', f.label));

      var a = crear('a', 'dato__val', f.value);
      a.href = f.href;
      if (a.href.indexOf('http') === 0) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      div.appendChild(a);
      li.appendChild(div);
      datos.appendChild(li);
    });

    /* Colofón */
    var pie = $('#footer-contacto');
    pie.textContent = '';
    [
      { t: r.direccion, h: r.mapsPlace, ext: true },
      { t: r.ciudad + ', ' + r.provincia, h: r.mapsPlace, ext: true },
      { t: r.telefonoLegible, h: 'tel:' + r.telefono, ext: false },
      { t: 'WhatsApp reservas', h: linkWA(MENSAJE_WHATSAPP), ext: true }
    ].forEach(function (f) {
      var li = crear('li');
      var a = crear('a', null, f.t);
      a.href = f.h;
      if (f.ext) { a.target = '_blank'; a.rel = 'noopener'; }
      li.appendChild(a);
      pie.appendChild(li);
    });
  }

  /* ---------- formulario de reserva --------------------------------- */

  function formatearFecha(iso) {
    // "2026-09-30" → "miércoles 30 de septiembre"
    var p = iso.split('-');
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    var dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
                 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return dias[d.getDay()] + ' ' + d.getDate() + ' de ' + meses[d.getMonth()];
  }

  /* Cada cuántos minutos se ofrece una mesa. Treinta es lo habitual en un
     local de platos. Para ofrecer media hora, el paso se pone como tercer
     dato del tramo: ['20:00', '00:00', 15]. */
  var PASO_MESA = 30;

  /* El selector de hora no muestra el rango del tramo: muestra horas
     concretas, de una en una. Nadie reserva "de 20 a 0"; reservan las 21:30.
     Los tramos que cruzan la medianoche funcionan porque `hhmm` ya da la
     vuelta: 1410 minutos se muestra 23:30, 1500 se muestra 01:00. */
  function cargarHoras(iso) {
    var sel = $('#f-hora');
    sel.textContent = '';
    sel.disabled = false;

    if (!iso) {
      sel.appendChild(opcionVacia('Primero elegí el día.'));
      sel.disabled = true;
      return;
    }

    var p = iso.split('-');
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    var cfg = HORARIOS.filter(function (h) { return h.dia === d.getDay(); })[0];

    if (!cfg || !cfg.tramos.length) {
      sel.appendChild(opcionVacia('Ese día no hay servicio.'));
      sel.disabled = true;
      return;
    }

    /* Con dos tramos (sábado y domingo al mediodía y a la noche) las horas
       se agrupan, para que se vea cuál de los dos turnos se está eligiendo. */
    var uno = cfg.tramos.length < 2;

    cfg.tramos.forEach(function (t) {
      var ini = minutos(t[0]);
      var fin = minutos(t[1]);
      var paso = t[2] || PASO_MESA;

      /* Un tramo que termina a medianoche (o después) tiene el fin por debajo
         del inicio: 20:00 -> 00:00 es 1200 -> 0, y 20:00 -> 01:00 es
         1200 -> 60. Sin este salto el bucle no arranca nunca y el turno de la
         noche se queda sin ni una hora. */
      if (fin <= ini) fin += 1440;

      var grupo = null;
      if (!uno) {
        grupo = document.createElement('optgroup');
        grupo.label = ini < 17 * 60 ? 'Mediodía' : 'Noche';
        sel.appendChild(grupo);
      }
      var destino = grupo || sel;

      /* Ningún turno arranca en el minuto del cierre: el último es el último
         paso que entra antes. */
      for (var m = ini; m < fin; m += paso) {
        var o = document.createElement('option');
        o.value = hhmm(m);
        o.textContent = hhmm(m);
        destino.appendChild(o);
      }
    });
  }

  function opcionVacia(texto) {
    var o = document.createElement('option');
    o.value = '';
    o.textContent = texto;
    o.disabled = true;
    o.selected = true;
    return o;
  }

  function mensajeReserva() {
    var nombre = $('#f-nombre').value.trim();
    var personas = $('#f-personas').value;
    var dia = $('#f-dia').value;
    var hora = $('#f-hora').value;
    var nota = $('#f-nota').value.trim();

    var partes = [];
    var cuantas = personas === '1' ? '1 persona'
               : personas === '7+' ? '7 o más personas'
               : personas + ' personas';
    partes.push('Hola Barrabrava. Quiero reservar para ' + cuantas + '.');

    if (dia) {
      partes.push(formatearFecha(dia) + (hora ? ' a las ' + hora : '') + '.');
    }
    if (nombre) partes.push('Soy ' + nombre + '.');
    if (nota) partes.push(nota);

    partes.push('¿Me confirmás disponibilidad?');
    return partes.join('\n');
  }

  function renderPreview() {
    var caja = $('#preview-mensaje');
    caja.textContent = '';
    caja.appendChild(crear('span', 'previo__etq', 'Así te va a llegar:'));
    caja.appendChild(crear('span', 'previo__txt', mensajeReserva()));
  }

  /* El error se dice con palabras. Un borde solo no le llega a un lector de
     pantalla, y un color solo no le llega a quien no distingue el rojo. */
  function marcarError(sel, texto) {
    var campo = $(sel);
    if (!campo) return;
    var wrap = campo.closest('.campo');
    if (!wrap) return;

    var err = wrap.querySelector('.campo__error');
    if (!err) {
      err = crear('p', 'campo__error');
      err.id = 'err-' + campo.id.replace(/^f-/, '');
      wrap.appendChild(err);
    }
    err.textContent = texto;
    err.hidden = false;
    campo.setAttribute('aria-invalid', 'true');
    campo.setAttribute('aria-describedby', err.id);
  }

  function limpiarError(sel) {
    var campo = $(sel);
    if (!campo) return;
    campo.removeAttribute('aria-invalid');
    var wrap = campo.closest('.campo');
    var err = wrap ? wrap.querySelector('.campo__error') : null;
    if (err) err.hidden = true;
  }

  function initForm() {
    var hoy = new Date();
    var isoHoy = hoy.getFullYear() + '-' +
      String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
      String(hoy.getDate()).padStart(2, '0');

    var fDia = $('#f-dia');
    fDia.min = isoHoy;
    fDia.value = isoHoy;
    cargarHoras(isoHoy);

    /* `aria-live` re-anuncia el mensaje entero en cada tecla. Se muestra
       apenas el usuario deja de escribir. */
    var tPrev = null;
    function pedirPreview() {
      clearTimeout(tPrev);
      tPrev = setTimeout(renderPreview, 400);
    }

    ['#f-nombre', '#f-personas', '#f-dia', '#f-hora', '#f-nota']
      .forEach(function (sel) {
        var el = $(sel);
        el.addEventListener('input', function () {
          if (sel === '#f-dia') cargarHoras(fDia.value);
          limpiarError(sel);
          pedirPreview();
        });
        el.addEventListener('change', function () {
          if (sel === '#f-dia') cargarHoras(fDia.value);
          limpiarError(sel);
          pedirPreview();
        });
      });

    renderPreview();

    $('#form-reserva').addEventListener('submit', function (ev) {
      ev.preventDefault();

      // validación: el foco va al primer campo que falta, y se explica por qué
      ['#f-nombre', '#f-dia', '#f-hora'].forEach(limpiarError);

      var falta = [];
      if (!$('#f-nombre').value.trim()) {
        falta.push(['#f-nombre', 'Poné tu nombre para que el mostrador sepa quién reserva.']);
      }
      if (!fDia.value) falta.push(['#f-dia', 'Elegí un día.']);
      if (!$('#f-hora').value) falta.push(['#f-hora', 'Elegí una hora de las que aparecen.']);

      if (falta.length) {
        falta.forEach(function (f) { marcarError(f[0], f[1]); });
        $(falta[0][0]).focus();
        return;
      }

      var btn = $('#btn-enviar');
      var original = btn.innerHTML;
      btn.textContent = 'Abriendo WhatsApp…';
      btn.disabled = true;

      window.open(linkWA(mensajeReserva()), '_blank', 'noopener');

      setTimeout(function () {
        btn.innerHTML = original;
        btn.disabled = false;
      }, 1600);
    });
  }

  /* ---------- reseñas de Google -------------------------------------- */
  /* Salen de RESENAS, en data.js: reseñas reales que el local copia desde
     Google Maps. No hay API: tomarlas en vivo exigiría una clave de Maps
     Platform con facturación, y Google además prohíbe cachear el contenido.
     Actualizarlas es trabajo del local. */

  /* Una estrella dibujada, no un glifo: la carta no usa emojis ni fuentes de
     íconos. El puntaje numérico ya está en texto, así que va de adorno. */
  function estrella(llena) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'resenas__estrella' + (llena ? ' resenas__estrella--llena' : ''));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M12 3.6l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z');
    p.setAttribute('fill', 'currentColor');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    return svg;
  }

  function filaEstrellas(nota) {
    var cont = crear('span', 'resenas__nota-graf');
    var enteras = Math.floor(nota);
    for (var i = 1; i <= 5; i++) cont.appendChild(estrella(i <= enteras));
    return cont;
  }

  /* Cada cuántos milisegundos pasa de una reseña a la siguiente. */
  var PASO_RESENAS = 7000;

  var resIdx = 0;
  var resTimer = null;
  var resAuto = true;
  var resManual = false;

  function todos(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function renderResenas() {
    var datos = RESENAS || {};
    var resenas = datos.lista || [];
    var bloque = $('#bloque-resenas');

    /* Sin reseñas cargadas no hay sección: no queda un título con nada
       debajo. */
    if (!resenas.length) { bloque.hidden = true; return; }
    bloque.hidden = false;

    $('#resenas-maps').href = RESTAURANTE.mapsPlace;

    /* La nota global es opcional. Si el local no la carga no se inventa, y
       si queda desactualizada se edita acá junto con las reseñas. */
    if (datos.puntaje != null && datos.cantidad != null) {
      $('#resenas-puntaje').textContent = Number(datos.puntaje).toLocaleString('es-AR', {
        minimumFractionDigits: 1, maximumFractionDigits: 1
      });
      $('#resenas-conteo').textContent = 'sobre ' +
        Number(datos.cantidad).toLocaleString('es-AR') + ' reseñas en Google';
      $('#resenas-global').hidden = false;
    }

    var pista = $('#resenas-pista');
    pista.textContent = '';

    resenas.forEach(function (r, i) {
      var fig = crear('figure', 'resena');
      fig.setAttribute('role', 'group');
      fig.setAttribute('aria-roledescription', 'reseña');
      fig.setAttribute('aria-label', (i + 1) + ' de ' + resenas.length);

      var cita = crear('blockquote', 'resena__texto', '“' + r.texto + '”');
      if (r.url) cita.setAttribute('cite', r.url);
      fig.appendChild(cita);

      var pie = crear('figcaption', 'resena__pie');
      pie.appendChild(filaEstrellas(r.nota || 0));

      if (r.foto) {
        var foto = crear('img', 'resena__foto');
        foto.src = r.foto;
        foto.alt = '';
        foto.width = 32;
        foto.height = 32;
        foto.loading = 'lazy';
        pie.appendChild(foto);
      }

      /* El nombre del autor va junto al texto, no escondido: la reseña es
         de alguien, y el link lleva a su perfil en Maps. */
      if (r.url) {
        var a = crear('a', 'resena__autor', r.autor);
        a.href = r.url;
        a.target = '_blank';
        a.rel = 'noopener';
        pie.appendChild(a);
      } else {
        pie.appendChild(crear('span', 'resena__autor', r.autor));
      }

      if (r.cuando) pie.appendChild(crear('span', 'resena__cuando', r.cuando));

      fig.appendChild(pie);
      pista.appendChild(fig);
    });

    if (resenas.length > 1) dibujarControles();
    resIdx = 0;
    ajustarAltoPista();
    mostrarResena(0);
    if (resenas.length > 1) arrancarReloj();
  }

  /* La pista reserva el alto de la reseña más larga. Sin esto el bloque
     saltea 27 px cada vez que pasa a la más corta, y se nota: la página se
     mueve abajo mientras alguien está leyendo. Se mide con todas las
     reseñas a la vista y después se muestra sólo una. */
  function ajustarAltoPista() {
    var pista = $('#resenas-pista');
    var d = diapositivas();
    pista.style.minHeight = '';

    d.forEach(function (el) { el.hidden = false; });
    var alto = 0;
    d.forEach(function (el) {
      alto = Math.max(alto, el.getBoundingClientRect().height);
    });
    /* El pixel de sobra es por el redondeo: getBoundingClientRect devuelve
       decimales y el alto de la fila se trunca a entero al pintar. */
    pista.style.minHeight = Math.ceil(alto) + 1 + 'px';
  }

  /* ---------- carrusel de reseñas ----------------------------------- */

  function diapositivas() {
    return todos('#resenas-pista .resena');
  }

  function mostrarResena(i, manual) {
    var d = diapositivas();
    if (!d.length) return;
    /* El último cambio lo pidió una persona: a partir de acá el contador se
       anuncia aunque el carrusel siga girando. */
    if (manual) resManual = true;
    resIdx = (i + d.length) % d.length;

    d.forEach(function (el, j) {
      var activa = j === resIdx;
      el.hidden = !activa;
      el.classList.toggle('resena--entra', activa);
    });

    todos('#resenas-ctrl [data-punto]').forEach(function (b, j) {
      var activa = j === resIdx;
      b.setAttribute('aria-current', activa ? 'true' : 'false');
    });

    /* El contador existe para el lector de pantalla. Se anuncia cuando el
       cambio lo pidió la persona (o cuando el carrusel está detenido); si el
       carrusel gira solo, anunciarlo cada 7 segundos es una molestia, así que
       el texto se actualiza igual pero mudo. */
    actualizarAnuncio();
  }

  function actualizarAnuncio() {
    var estado = $('#resenas-estado');
    if (!estado) return;
    estado.textContent = 'Reseña ' + (resIdx + 1) + ' de ' + diapositivas().length;
    estado.setAttribute('aria-live', (resManual || !resAuto) ? 'polite' : 'off');
  }

  function dibujarControles() {
    var ctrl = $('#resenas-ctrl');
    ctrl.textContent = '';

    ctrl.appendChild(botonCarrusel('Anterior', 'carrusel__flecha', svgFlecha(-1), function () {
      mostrarResena(resIdx - 1, true);
    }));

    /* Con una sola reseña no hay nada que pasar, así que el botón de pausa
       no se dibuja. Con varias sí: WCAG 2.2.2 pide que si el contenido se
       mueve solo más de cinco segundos, exista la forma de detenerlo. */
    var btnPausa = botonCarrusel('Pausar', 'carrusel__pausa', svgPausa(), function () {
      resAuto = !resAuto;
      btnPausa.setAttribute('aria-label', resAuto ? 'Pausar' : 'Seguir');
      btnPausa.setAttribute('aria-pressed', resAuto ? 'false' : 'true');
      btnPausa.textContent = '';
      btnPausa.appendChild(resAuto ? svgPausa() : svgJugar());
      /* El atributo aria-live depende de si el carrusel gira: al pausar hay
         que recalcularlo, o el contador sigue mudo con el carrusel detenido. */
      actualizarAnuncio();
      if (resAuto) arrancarReloj(); else detenerReloj();
    });
    btnPausa.setAttribute('aria-pressed', 'false');
    ctrl.appendChild(btnPausa);

    ctrl.appendChild(botonCarrusel('Siguiente', 'carrusel__flecha', svgFlecha(1), function () {
      mostrarResena(resIdx + 1, true);
    }));

    var puntos = crear('ol', 'carrusel__puntos');
    puntos.setAttribute('aria-label', 'Ir a la reseña');
    diapositivas().forEach(function (el, i) {
      var li = crear('li');
      var b = crear('button', 'carrusel__punto');
      b.type = 'button';
      b.dataset.punto = '1';
      b.setAttribute('aria-label', 'Reseña ' + (i + 1));
      b.setAttribute('aria-current', i === resIdx ? 'true' : 'false');
      b.addEventListener('click', function () { mostrarResena(i, true); });
      li.appendChild(b);
      puntos.appendChild(li);
    });
    ctrl.appendChild(puntos);

    /* Con el mouse encima o con el foco dentro, el carrusel se frena: nadie
       quiere que le cambie la reseña de abajo mientras la está leyendo. */
    var caja = $('#carrusel-resenas');
    caja.addEventListener('mouseenter', detenerReloj);
    caja.addEventListener('mouseleave', function () { if (resAuto) arrancarReloj(); });
    caja.addEventListener('focusin', detenerReloj);
    caja.addEventListener('focusout', function (e) {
      if (!caja.contains(e.relatedTarget) && resAuto) arrancarReloj();
    });
  }

  function botonCarrusel(etiqueta, clase, svg, alHacerClic) {
    var b = crear('button', 'carrusel__boton ' + clase);
    b.type = 'button';
    b.setAttribute('aria-label', etiqueta);
    b.appendChild(svg);
    b.addEventListener('click', alHacerClic);
    return b;
  }

  function svgFlecha(dir) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.6');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    return svg;
  }

  function svgPausa() {
    return svgIcono('M9 6v12M15 6v12');
  }

  function svgJugar() {
    return svgIcono('M8 5l11 7-11 7z');
  }

  function svgIcono(d) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.6');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    return svg;
  }

  function arrancarReloj() {
    detenerReloj();
    /* Si la persona pidió menos movimiento, el carrusel no avanza solo: se
       cambia con los botones. */
    if (!resAuto) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    resTimer = setTimeout(function () {
      mostrarResena(resIdx + 1);
      arrancarReloj();
    }, PASO_RESENAS);
  }

  function detenerReloj() {
    if (resTimer) { clearTimeout(resTimer); resTimer = null; }
  }

  /* Al cambiar el ancho, la reseña más larga puede ser otra: se vuelve a
     medir. Con un empujón para no estar midiendo en cada píxel. */
  var tResize = null;
  window.addEventListener('resize', function () {
    clearTimeout(tResize);
    tResize = setTimeout(function () {
      if (document.getElementById('bloque-resenas').hidden) return;
      var visible = resIdx;
      ajustarAltoPista();
      mostrarResena(visible);
    }, 200);
  });
  /* ---------- navegación por pestañas ------------------------------- */

  var VISTAS = ['inicio', 'carta', 'contacto'];

  /* El momento único de la página: los puntitos guía se dibujan una vez,
     al entrar en la carta. El estado final es el estado natural del CSS,
     así que sin JS o sin animación la página se ve igual. */
  function dibujarPuntitos() {
    var v = $('#view-carta');
    if (!v || v.dataset.puntitos === '1') return;
    v.dataset.puntitos = '1';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { v.classList.add('is-drawn'); });
    });
  }

  function irA(nombre) {
    /* Un hash que no es una vista (`#cat-entradas`, `#main`) es un ancla
       dentro de la vista actual: lo resuelve el navegador. Antes esto lo
       coercía a 'inicio' y el índice de la carta sacaba de la carta. */
    if (VISTAS.indexOf(nombre) === -1) return;

    VISTAS.forEach(function (v) {
      $('#view-' + v).hidden = (v !== nombre);
    });

    document.querySelectorAll('.index__item').forEach(function (t) {
      var activo = t.dataset.tab === nombre;
      t.setAttribute('aria-current', activo ? 'page' : 'false');
    });

    // al cambiar de pestaña hay que volver arriba, si no quedás en el medio
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (nombre === 'carta') {
      marcarIndiceInicial();
      dibujarPuntitos();
    }
  }

  function rutaActual() {
    var h = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return h || 'inicio';
  }

  /* Al scrollear la carta, se marca la categoría visible */
  function observarCategorias() {
    var secciones = document.querySelectorAll('.categoria');
    if (!secciones.length || !('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = e.target.dataset.cat;
        document.querySelectorAll('#carta-filtros .indice__item').forEach(function (c) {
          c.setAttribute('aria-current', c.dataset.cat === i ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

    secciones.forEach(function (s) { obs.observe(s); });
  }

  function marcarIndiceInicial() {
    var primero = document.querySelector('#carta-filtros .indice__item');
    if (primero) primero.setAttribute('aria-current', 'true');
  }

  /* ---------- arranque ---------------------------------------------- */

  function init() {
    var r = RESTAURANTE;
    var telHref = 'tel:' + r.telefono;

    // La vía principal es llamar: el único número es un fijo y el enlace
    // de WhatsApp se arma con ese mismo fijo.
    $('#hero-llamar').href = telHref;
    $('#llamar-flotante').href = telHref;
    $('#hero-whatsapp').href = linkWA(MENSAJE_WHATSAPP);

    renderPortada();
    renderGaleria();
    renderCarta();
    renderContacto();
    renderHorarios();
    renderEstado();
    renderResenas();
    initForm();
    observarCategorias();

    $('#anio').textContent = new Date().getFullYear();

    window.addEventListener('hashchange', function () {
      var r = rutaActual();
      if (VISTAS.indexOf(r) !== -1) irA(r);
    });
    var inicial = rutaActual();
    irA(VISTAS.indexOf(inicial) === -1 ? 'inicio' : inicial);

    // el estado abierto/cerrado se refresca cada minuto
    setInterval(renderEstado, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
