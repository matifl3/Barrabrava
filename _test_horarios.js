/* Test de la lógica de horarios: no toca la DOM, sólo las funciones puras.
   Se ejecuta con:  node _test_horarios.js                             */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const data = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

// --- extraemos sólo las funciones puras de app.js -----------------------
const partes = ['estaAbierto', 'proximaApertura', 'cierreVigente', 'minutos', 'hhmm', 'slug', 'precio'];
let extraido = '';
for (const nombre of partes) {
  const re = new RegExp('(?:^|\\n)\\s*function ' + nombre + '\\s*\\(', 'm');
  const m = re.exec(app);
  if (!m) throw new Error('no encontré la función ' + nombre);
  // retrocedemos hasta el inicio de la línea
  const ini = app.lastIndexOf('\n', m.index) + 1;
  // contamos llaves desde la apertura de la función
  let i = app.indexOf('{', m.index), prof = 0, fin = -1;
  for (; i < app.length; i++) {
    const c = app[i];
    if (c === '{') prof++;
    else if (c === '}') { prof--; if (prof === 0) { fin = i + 1; break; } }
  }
  extraido += app.slice(ini, fin) + '\n\n';
}

const ctx = vm.createContext({ console });
vm.runInContext(data, ctx);
vm.runInContext(extraido, ctx);

// `const` no se vuelve propiedad del global, lo leemos desde el contexto
const D = vm.runInContext('({RESTAURANTE, CARTA, BARRA, GALERIA, HORARIOS, MENSAJE_WHATSAPP})', ctx);

// --- helpers de test ----------------------------------------------------
const { estaAbierto, proximaApertura, cierreVigente, precio, slug } = ctx;

// dow: 0=domingo 1=lunes ... 6=sabado
function cuando(dow, hh, mm) {
  // 2026-09-27 es domingo, 2026-09-28 lunes, ... 2026-10-03 sabado
  const d = new Date(2026, 8, 27 + dow, hh, mm, 0, 0);
  return d;
}
const NOM = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

let ok = 0, fail = 0;
function test(desc, real, esperado) {
  if (real === esperado) { ok++; console.log('  OK   ' + desc); }
  else { fail++; console.log('  FALLA ' + desc + '\n         esperado: ' + esperado + '\n         real:     ' + real); }
}

console.log('\n== estaAbierto ==');
test('lunes 19:59 cerrado (abre 20:00)', estaAbierto(cuando(1, 19, 59)), false);
test('lunes 20:00 abierto',              estaAbierto(cuando(1, 20, 0)), true);
test('lunes 23:59 abierto',              estaAbierto(cuando(1, 23, 59)), true);
test('martes 00:00 cerrado (cierra a medianoche)', estaAbierto(cuando(2, 0, 0)), false);
test('martes 00:01 cerrado',             estaAbierto(cuando(2, 0, 1)), false);
test('martes 12:00 cerrado (no hay almuerzo)', estaAbierto(cuando(2, 12, 0)), false);

test('viernes 23:00 abierto',            estaAbierto(cuando(5, 23, 0)), true);
test('sábado 00:30 abierto (cola del viernes)', estaAbierto(cuando(6, 0, 30)), true);
test('sábado 00:59 abierto',             estaAbierto(cuando(6, 0, 59)), true);
test('sábado 01:00 cerrado',             estaAbierto(cuando(6, 1, 0)), false);
test('sábado 12:00 abierto (almuerzo)',   estaAbierto(cuando(6, 12, 0)), true);
test('sábado 15:29 abierto',             estaAbierto(cuando(6, 15, 29)), true);
test('sábado 15:30 cerrado',             estaAbierto(cuando(6, 15, 30)), false);
test('sábado 20:00 abierto',             estaAbierto(cuando(6, 20, 0)), true);

test('domingo 12:00 abierto (almuerzo)',  estaAbierto(cuando(0, 12, 0)), true);
test('domingo 15:30 cerrado',             estaAbierto(cuando(0, 15, 30)), false);
test('domingo 23:00 abierto',             estaAbierto(cuando(0, 23, 0)), true);
test('lunes 00:30 cerrado (domingo cierra 00:00)', estaAbierto(cuando(1, 0, 30)), false);

console.log('\n== cierreVigente ==');
test('lunes 21:00 cierra 00:00', cierreVigente(cuando(1, 21, 0)), '00:00');
test('viernes 23:00 cierra 01:00', cierreVigente(cuando(5, 23, 0)), '01:00');
test('sábado 00:30 cierra 01:00 (cola)', cierreVigente(cuando(6, 0, 30)), '01:00');
test('sábado 13:00 cierra 15:30', cierreVigente(cuando(6, 13, 0)), '15:30');
test('lunes 12:00 sin cierre (cerrado)', cierreVigente(cuando(1, 12, 0)), '');

console.log('\n== proximaApertura ==');
let p = proximaApertura(cuando(1, 21, 0));
test('lunes 21:00 → abre hoy 20:00 ya pasó, va a martes', p.cuando + ' ' + p.hora, 'mañana 20:00');

p = proximaApertura(cuando(1, 12, 0));
test('lunes 12:00 → abre hoy 20:00', p.cuando + ' ' + p.hora, 'hoy 20:00');

p = proximaApertura(cuando(2, 0, 30));
test('martes 00:30 → abre hoy 20:00', p.cuando + ' ' + p.hora, 'hoy 20:00');

p = proximaApertura(cuando(6, 16, 0));
test('sábado 16:00 → abre hoy 20:00', p.cuando + ' ' + p.hora, 'hoy 20:00');

p = proximaApertura(cuando(6, 2, 0));
test('sábado 02:00 → abre hoy al mediodía', p.cuando + ' ' + p.hora, 'hoy 12:00');

p = proximaApertura(cuando(0, 23, 30));
test('domingo 23:30 → abre mañana 20:00', p.cuando + ' ' + p.hora, 'mañana 20:00');

p = proximaApertura(cuando(0, 16, 0));
test('domingo 16:00 → abre hoy 20:00', p.cuando + ' ' + p.hora, 'hoy 20:00');

console.log('\n== precio / slug ==');
test('precio(13) = $ 13,00', precio(13), '$ 13,00');
test('precio(21) = $ 21,00', precio(21), '$ 21,00');
test('precio(10) = $ 10,00', precio(10), '$ 10,00');
test('slug("Pescados y Mariscos")', slug('Pescados y Mariscos'), 'pescados-y-mariscos');
test('slug("La Barra")', slug('La Barra'), 'la-barra');
test('slug("Ñoquis Verdes con Mejillones")', slug('Ñoquis Verdes con Mejillones'), 'noquis-verdes-con-mejillones');

console.log('\n== datos: cobertura de fotos ==');
const fotos = fs.readdirSync(path.join(root, 'assets', 'fotos'));
const usadas = new Set();
for (const c of D.CARTA) for (const it of c.items) if (it.foto) usadas.add(it.foto);
for (const b of D.BARRA) usadas.add(b.foto);
for (const g of D.GALERIA) usadas.add(g.foto);

const huerfanas = fotos.filter(f => !usadas.has(f));
const rotas = [...usadas].filter(f => !fotos.includes(f));
console.log('  fotos en disco: ' + fotos.length + ' | referenciadas: ' + usadas.size);
console.log('  huerfanas (en disco, sin usar): ' + (huerfanas.length ? huerfanas.join(', ') : 'ninguna'));
console.log('  referenciadas pero inexistentes: ' + (rotas.length ? rotas.join(', ') : 'ninguna'));
if (huerfanas.length || rotas.length) fail++;

console.log('\n== datos: precios ==');
const precios = [];
for (const c of D.CARTA) for (const it of c.items) precios.push(it.precio);
test('todos los precios son enteros', precios.every(p => Number.isInteger(p)), true);
test('todos los platos tienen nombre y desc', D.CARTA.every(c => c.items.every(i => i.nombre && i.desc)), true);
const nombres = D.CARTA.flatMap(c => c.items.map(i => i.nombre));
test('no hay nombres duplicados en la carta', new Set(nombres).size === nombres.length, true);
console.log('  total de platos: ' + nombres.length + ' | rango de precios: $ ' +
  Math.min(...precios) + ' – $ ' + Math.max(...precios));

console.log('\n== datos: WhatsApp y mapa ==');
test('whatsapp es sólo dígitos', /^\d{10,15}$/.test(D.RESTAURANTE.whatsapp), true);
test('mensaje precargado no vacío', D.MENSAJE_WHATSAPP.length > 10, true);
const lat = D.RESTAURANTE.lat, lng = D.RESTAURANTE.lng;
test('coordenadas dentro de Mar del Plata (lat≈-38.018, lng≈-57.544)',
  lat > -38.05 && lat < -37.95 && lng > -57.60 && lng < -57.48, true);
test('coordenadas = las del link de Maps de Info.txt', lat === -38.0177086 && lng === -57.5439286, true);

console.log('\n' + (fail === 0 ? 'TODO OK (' + ok + ' pruebas)' : ok + ' OK, ' + fail + ' FALLAS'));
process.exit(fail === 0 ? 0 : 1);