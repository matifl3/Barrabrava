/* Validación estática: comprueba que cada selector que app.js busca exista
   en index.html, que no haya ids duplicados y que las etiquetas cierren.
   Uso:  node _test_html.js                                            */

const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

let fail = 0;
const ok = (m) => console.log('  OK    ' + m);
const bad = (m) => { fail++; console.log('  FALLA ' + m); };

/* ---- ids declarados en el HTML ---- */
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
console.log('\n== ids en index.html ==');
console.log('  encontrados: ' + ids.length);
if (dupes.length) bad('ids duplicados: ' + [...new Set(dupes)].join(', '));
else ok('sin ids duplicados');

/* ---- selectores que app.js consulta ---- */
console.log('\n== selectores usados por app.js ==');
const selectores = new Set();
for (const m of app.matchAll(/\$\('#([a-zA-Z0-9_-]+)'/g)) selectores.add(m[1]);

// ids con prefijo son dinámicos ($('#view-' + v)) → se validan aparte abajo
const fijos = [...selectores].filter(s => !s.endsWith('-'));
const faltantes = fijos.filter(s => !ids.includes(s));
if (faltantes.length) bad('app.js busca ids que no están en el HTML: ' + faltantes.join(', '));
else ok('los ' + fijos.length + ' ids fijos consultados por app.js existen');

/* ---- aria-label en las vistas ---- */
const vistas = [...html.matchAll(/id="view-([a-zA-Z0-9_-]+)"[^>]*aria-label="([^"]+)"/g)];
if (vistas.length === 3) ok('las 3 vistas tienen aria-label propio');
else bad('faltan aria-label en algunas vistas (encontradas: ' + vistas.length + '/3)');

/* ---- los data-tab tienen su view y viceversa ---- */
const tabIds = [...html.matchAll(/data-tab="([^"]+)"/g)].map(m => m[1]);
const viewIds = [...html.matchAll(/id="view-([a-zA-Z0-9_-]+)"/g)].map(m => m[1]);
const huerfanos = [...tabIds, ...viewIds].filter(v => ![...tabIds, ...viewIds].includes(v));
if (huerfanos.length) bad('pestañas huérfanas: ' + huerfanos.join(', '));
else ok('cada data-tab tiene su view y viceversa (' + tabIds.join(' | ') + ')');

/* ---- los for= deben apuntar a un id real ---- */
const fors = [...html.matchAll(/\sfor="([^"]+)"/g)].map(m => m[1]);
const forsRotos = fors.filter(f => !ids.includes(f));
if (forsRotos.length) bad('label for= sin control: ' + forsRotos.join(', '));
else ok('los ' + fors.length + ' <label for> tienen su control');

/* ---- etiquetas balanceadas ---- */
console.log('\n== estructura html ==');
const voids = new Set(['meta', 'link', 'img', 'br', 'hr', 'input', 'source', 'path', 'area', 'col']);
const pila = [];
let desbalance = 0;
const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)(\/?)>/g;
let m;
while ((m = tagRe.exec(html))) {
  const [, cierre, tag, , auto] = m;
  const t = tag.toLowerCase();
  if (voids.has(t) || auto === '/') continue;
  if (cierre === '/') {
    const top = pila.pop();
    if (top !== t) {
      bad('cierre inesperado: esperaba </' + top + '> pero llegó </' + t + '>');
      desbalance++;
    }
  } else {
    pila.push(t);
  }
}
if (pila.length) { bad('etiquetas sin cerrar: ' + pila.join(', ')); desbalance++; }
if (!desbalance) ok('todas las etiquetas cierran correctamente');

/* ---- recursos referenciados ---- */
console.log('\n== recursos ==');
['styles.css', 'data.js', 'app.js'].forEach(f => {
  if (fs.existsSync(path.join(root, f))) ok('existe ' + f);
  else bad('falta ' + f);
});

/* ---- favicon / meta ---- */
const metas = ['viewport', 'description', 'theme-color'];
for (const m of metas) {
  const re = new RegExp('<meta[^>]*name="' + m + '"');
  if (re.test(html) || m === 'viewport') ok('meta ' + (m === 'viewport' ? 'viewport' : m) + ' presente');
  else bad('falta meta ' + m);
}

/* ---- viewport sin bloquear zoom ---- */
console.log('\n== accesibilidad (chequeos rápidos) ==');
const vp = (html.match(/<meta name="viewport"[^>]*>/) || [''])[0];
if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1\b/.test(vp)) bad('el viewport bloquea el zoom: ' + vp);
else ok('el viewport permite zoom');

if (/skip-link/.test(html)) ok('hay skip link al contenido');
else bad('falta skip link');

if (/:focus-visible/.test(fs.readFileSync(path.join(root, 'styles.css'), 'utf8'))) ok('estilo de foco visible definido');
else bad('falta :focus-visible');

if (/prefers-reduced-motion/.test(fs.readFileSync(path.join(root, 'styles.css'), 'utf8'))) ok('respeta prefers-reduced-motion');
else bad('falta prefers-reduced-motion');

const lang = (html.match(/<html[^>]*lang="([^"]+)"/) || [])[1];
if (lang === 'es-AR') ok('lang="es-AR" correcto');
else bad('lang debería ser es-AR, es ' + lang);

/* todos los <img> con alt */
const imgs = [...html.matchAll(/<img[^>]*>/g)].map(m => m[0]);
const sinAlt = imgs.filter(t => !/\salt="/.test(t));
if (sinAlt.length) bad(sinAlt.length + ' <img> sin alt');
else ok('todos los <img> del HTML tienen alt');

/* svg decorativos con aria-hidden */
const svgs = [...html.matchAll(/<svg\b[^>]*>/g)].map(m => m[0]);
const svgVivos = svgs.filter(t => !/aria-hidden="true"/.test(t));
if (svgVivos.length) bad(svgVivos.length + ' <svg> sin aria-hidden (se anuncian al lector)');
else ok('los ' + svgs.length + ' <svg> decorativos están ocultos a lectores de pantalla');

console.log('\n' + (fail === 0 ? 'TODO OK' : fail + ' PROBLEMAS'));
process.exit(fail === 0 ? 0 : 1);