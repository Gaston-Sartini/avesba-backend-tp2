// Herramienta del equipo. Esta carpeta (equipo/) se borra en el último paso del proyecto.
// Idea clave: para probar tu parte NO hace falta que tus compañeros hayan terminado.
// Se arma una copia temporal: repo de referencia + tus archivos encima, y se corre ahí.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const REF = path.resolve(RAIZ, "..", "avesba-referencia");
const REF_URL = "https://github.com/Gaston-Sartini/proyecto-tp2-avesba.git";
const REF_COMMIT = "cb011cb";
const ARCHIVO_PERSONA = path.join(RAIZ, ".git", "taller-persona");
const reparto = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "reparto.json"), "utf8"));
const IGNORAR = new Set([".git", "node_modules", "equipo", ".env", "database.sqlite", "database.sqlite-shm", "database.sqlite-wal", "notifications.log"]);

const salir = (mensaje) => {
  console.error(`\n✖ ${mensaje}\n`);
  process.exit(1);
};
const leerNorm = (f) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const posix = (p) => p.split(path.sep).join("/");

function listar(dir, base = dir) {
  const salida = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) salida.push(...listar(full, base));
    else salida.push(posix(path.relative(base, full)));
  }
  return salida;
}

function asegurarReferencia() {
  if (!fs.existsSync(path.join(REF, ".git"))) {
    console.log(`Bajando el repo de referencia en ${REF} ...`);
    execFileSync("git", ["clone", "--quiet", REF_URL, REF], { stdio: "inherit" });
  }
  execFileSync("git", ["-C", REF, "-c", "advice.detachedHead=false", "checkout", "--quiet", REF_COMMIT], { stdio: "inherit" });
}

function persona() {
  if (!fs.existsSync(ARCHIVO_PERSONA)) salir("Primero decí quién sos: node equipo/taller.js soy A   (o B, o C)");
  return fs.readFileSync(ARCHIVO_PERSONA, "utf8").trim();
}

const estadoDe = (rel) => {
  const mio = path.join(RAIZ, rel);
  if (!fs.existsSync(mio)) return "falta";
  return leerNorm(mio) === leerNorm(path.join(REF, rel)) ? "igual" : "distinto";
};

// Copia temporal: referencia completa + lo que hay en tu carpeta encima
function armarCopia() {
  asegurarReferencia();
  if (!fs.existsSync(path.join(RAIZ, "node_modules"))) salir("Falta instalar: corré npm install");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "avesba-taller-"));
  for (const rel of listar(REF)) fs.cpSync(path.join(REF, rel), path.join(dir, rel));
  for (const rel of listar(RAIZ)) fs.cpSync(path.join(RAIZ, rel), path.join(dir, rel));
  const env = fs.existsSync(path.join(RAIZ, ".env")) ? ".env" : ".env.example";
  fs.copyFileSync(path.join(RAIZ, env), path.join(dir, ".env"));
  fs.symlinkSync(path.join(RAIZ, "node_modules"), path.join(dir, "node_modules"), "junction");
  return dir;
}

function borrarCopia(dir) {
  // Primero se saca el enlace, para no tocar nunca el node_modules real
  fs.unlinkSync(path.join(dir, "node_modules"));
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

function correr(args) {
  const dir = armarCopia();
  const r = spawnSync(process.execPath, args, { cwd: dir, stdio: "inherit" });
  borrarCopia(dir);
  process.exit(r.status ?? 0);
}

const [comando, ...args] = process.argv.slice(2);

switch (comando) {
  case "soy": {
    const letra = (args[0] ?? "").toUpperCase();
    if (!reparto.personas[letra]) salir("Usá: node equipo/taller.js soy A   (o B, o C)");
    fs.writeFileSync(ARCHIVO_PERSONA, letra);
    asegurarReferencia();
    console.log(`Listo: sos Integrante ${letra} (${reparto.personas[letra].nombre}). Referencia lista en ${REF}`);
    break;
  }
  case "estado": {
    asegurarReferencia();
    const yo = persona();
    let hechos = 0;
    let total = 0;
    console.log(`\nIntegrante ${yo} — ${reparto.personas[yo].nombre}\n`);
    for (const l of reparto.personas[yo].lecciones) {
      const estados = l.archivos.map(estadoDe);
      const ok = estados.every((e) => e === "igual");
      console.log(`${ok ? "✔" : "·"} ${l.id}  ${l.titulo}`);
      l.archivos.forEach((a, i) => {
        total++;
        if (estados[i] === "igual") hechos++;
        else console.log(`     ${estados[i] === "falta" ? "falta   " : "distinto"}  ${a}`);
      });
    }
    console.log(`\nAvance: ${hechos}/${total} archivos iguales a la referencia (${Math.round((hechos / total) * 100)}%)`);
    const mios = new Set(reparto.personas[yo].lecciones.flatMap((l) => l.archivos));
    const cambiados = execFileSync("git", ["-C", RAIZ, "status", "--porcelain", "-uall"], { encoding: "utf8" })
      .split("\n")
      .filter(Boolean)
      .map((l) => l.slice(3).replace(/"/g, "").trim())
      .filter((f) => !f.startsWith("equipo/") && !mios.has(f));
    if (cambiados.length) console.log(`\n⚠ Estos cambios NO son de tu parte, revisalos antes de commitear:\n  ${cambiados.join("\n  ")}`);
    break;
  }
  case "comparar": {
    asegurarReferencia();
    if (!args[0]) salir("Usá: node equipo/taller.js comparar ruta/al/archivo.js");
    const rel = posix(args[0]);
    if (!fs.existsSync(path.join(REF, rel))) salir(`${rel} no existe en la referencia`);
    if (!fs.existsSync(path.join(RAIZ, rel))) salir(`Todavía no creaste ${rel}`);
    if (estadoDe(rel) === "igual") {
      console.log(`✔ ${rel} es igual a la referencia`);
      break;
    }
    spawnSync("git", ["--no-pager", "diff", "--no-index", "--ignore-cr-at-eol", path.join(RAIZ, rel), path.join(REF, rel)], { stdio: "inherit" });
    console.log("\nLíneas con - son tuyas. Líneas con + son las de la referencia.");
    break;
  }
  case "traer": {
    // Solo documentos largos y tests: el código de la app se escribe a mano
    asegurarReferencia();
    const rel = posix(args[0] ?? "");
    if (!reparto.traibles.includes(rel)) salir(`Solo se pueden traer tests y documentos largos. Lista:\n  ${reparto.traibles.join("\n  ")}`);
    fs.cpSync(path.join(REF, rel), path.join(RAIZ, rel));
    console.log(`Traído: ${rel}. Ahora leelo entero antes de commitearlo.`);
    break;
  }
  case "test": {
    correr(["--test", ...args]);
    break;
  }
  case "dev": {
    correr(["--env-file=.env", "index.js"]);
    break;
  }
  case "final": {
    asegurarReferencia();
    const ref = listar(REF);
    const mio = listar(RAIZ);
    const faltan = ref.filter((f) => !mio.includes(f));
    const sobran = mio.filter((f) => !ref.includes(f));
    const distintos = ref.filter((f) => mio.includes(f) && estadoDe(f) === "distinto");
    console.log(`\nFaltan: ${faltan.length}  |  Distintos: ${distintos.length}  |  Sobran: ${sobran.length}`);
    for (const [n, l] of [["falta", faltan], ["distinto", distintos], ["sobra", sobran]]) l.forEach((f) => console.log(`  ${n}: ${f}`));
    if (faltan.length + sobran.length + distintos.length) process.exit(1);
    console.log("\n✔ El repo es idéntico a la referencia. Último paso: borrar equipo/ y correr npm test.\n");
    break;
  }
  default:
    console.log(`Comandos:
  node equipo/taller.js soy A            decir quién sos (A, B o C)
  node equipo/taller.js estado           qué archivos te faltan
  node equipo/taller.js test [archivo]   corre los tests con tu código + la referencia
  node equipo/taller.js dev              levanta la API con tu código + la referencia
  node equipo/taller.js comparar archivo tu versión contra la referencia
  node equipo/taller.js traer archivo    baja un test o documento largo
  node equipo/taller.js final            chequeo final de todo el repo`);
}
