import { NOMBRES_ARGENTINOS } from "../../birds/argentineNames.js";
import { elegir } from "../game/buildQuestions.js";
import {
  PREGUNTAS_POR_PARTIDA,
  evaluarRespuesta,
  calcularBonusRacha,
  resumirRespuestas,
} from "../game/gameRules.js";

const CANTIDAD_MODERADORES = 3;
const DIA_MS = 24 * 60 * 60 * 1000;

const NOMBRES = [
  "Lucía",
  "Mateo",
  "Valentina",
  "Santiago",
  "Sofía",
  "Thiago",
  "Camila",
  "Benjamín",
  "Martina",
  "Joaquín",
  "Emma",
  "Bautista",
  "Julieta",
  "Tomás",
  "Catalina",
  "Lautaro",
];
const APELLIDOS = [
  "González",
  "Rodríguez",
  "Gómez",
  "Fernández",
  "López",
  "Martínez",
  "Pérez",
  "Sánchez",
  "Romero",
  "Díaz",
  "Torres",
  "Álvarez",
  "Ruiz",
  "Ramírez",
  "Flores",
  "Acosta",
];

const azar = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const unoDe = (lista) => lista[azar(0, lista.length - 1)];
const emailJugador = (n) => `jugador${String(n).padStart(3, "0")}@example.com`;

async function simularPartida(
  user,
  precision,
  { gameSessionsDao, gameResultsDao },
) {
  const aves = Object.entries(NOMBRES_ARGENTINOS).map(([id, nombre]) => ({
    id: Number(id),
    nombre,
  }));
  const lote = elegir(aves, PREGUNTAS_POR_PARTIDA);
  const inicio = Date.now() - azar(0, 60) * DIA_MS;

  let racha = 0;
  const respuestas = lote.map((ave, i) => {
    const acierta = Math.random() < precision;
    const respuesta = acierta
      ? ave.nombre
      : unoDe(aves.filter((otra) => otra.id !== ave.id)).nombre;
    const { esCorrecta, puntos } = evaluarRespuesta(respuesta, ave.nombre);
    racha = esCorrecta ? racha + 1 : 0;
    return {
      user_id: user.id,
      ave_id: ave.id,
      ave_nombre: ave.nombre,
      respuesta_usuario: respuesta,
      es_correcta: esCorrecta,
      puntos_obtenidos: puntos,
      bonus_racha: esCorrecta ? calcularBonusRacha(racha) : 0,
      streak_en_respuesta: racha,
      createdAt: inicio + (i + 1) * 10_000,
    };
  });

  const resumen = resumirRespuestas(respuestas);
  const session = await gameSessionsDao.create({
    user_id: user.id,
    estado: "terminada",
    preguntas: null,
    place_id: 10434,
    locale: "es-AR",
    streak_actual: racha,
    streak_maximo: Math.max(...respuestas.map((r) => r.streak_en_respuesta)),
    puntos_totales: resumen.puntos_totales,
    total_intentos: resumen.total_intentos,
    total_aciertos: resumen.total_aciertos,
    createdAt: inicio,
    terminadaAt: inicio + azar(120, 900) * 1000,
  });

  await gameResultsDao.saveMany(
    respuestas.map((r) => ({ ...r, session_id: session.id })),
  );
}

async function seedPlayers(
  { cantidad, password },
  { usersDao, gameSessionsDao, gameResultsDao, hasher },
) {
  if (!cantidad || (await usersDao.getByEmail(emailJugador(1)))) return 0;

  const passwordHash = await hasher.hash(password);

  for (let n = 1; n <= cantidad; n++) {
    const creado = Date.now() - azar(1, 90) * DIA_MS;
    const user = await usersDao.save({
      nombre: unoDe(NOMBRES),
      apellido: unoDe(APELLIDOS),
      email: emailJugador(n),
      passwordHash,
      role: n <= CANTIDAD_MODERADORES ? "moderador" : "jugador",
      is_active: true,
      createdAt: creado,
      updatedAt: creado,
      lastLogin: Math.min(creado + azar(1, 30) * DIA_MS, Date.now()),
    });

    const precision = 0.2 + Math.random() * 0.7;
    const partidas = azar(1, 5);
    for (let p = 0; p < partidas; p++) {
      await simularPartida(user, precision, {
        gameSessionsDao,
        gameResultsDao,
      });
    }
  }

  console.log(
    `[seed] ${cantidad} jugadores de prueba creados (contraseña: ${password})`,
  );
  return cantidad;
}

export default seedPlayers;
