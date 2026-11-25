import { EventEmitter } from "node:events";
import UsersMemoryDao from "../../dao/users/UsersMemoryDao.js";
import GameSessionsMemoryDao from "../../dao/gameSessions/GameSessionsMemoryDao.js";
import GameResultsMemoryDao from "../../dao/gameResults/GameResultsMemoryDao.js";
import ConnectionLogsMemoryDao from "../../dao/connectionLogs/ConnectionLogsMemoryDao.js";
import createClock from "../../utils/clock.js";

/**
 * Dobles para probar los casos de uso SIN servidor ni base:
 *  - los DAO en memoria (la misma interfaz que los de Sequelize),
 *  - un reloj fijo (siempre la misma hora: los resultados no dependen de cuándo se corre el test),
 *  - un bus de eventos espía (anota cada evento que se emite).
 * Así se prueba la regla de negocio sola, que es lo que hace el profe en tests/usecases.
 */
const AHORA = "2026-11-15T13:00:00Z"; // 10:00 de Argentina
const AHORA_MS = Date.parse(AHORA);

function crearDobles() {
  const events = new EventEmitter();
  const emitidos = [];
  const emitOriginal = events.emit.bind(events);
  events.emit = (nombre, datos) => {
    emitidos.push({ nombre, datos });
    return emitOriginal(nombre, datos);
  };

  return {
    usersDao: new UsersMemoryDao(),
    gameSessionsDao: new GameSessionsMemoryDao(),
    gameResultsDao: new GameResultsMemoryDao(),
    connectionLogsDao: new ConnectionLogsMemoryDao(),
    clock: createClock({ fixedNow: AHORA }),
    events,
    emitidos,
  };
}

// Un hasheador falso: los casos de uso solo conocen el contrato { hash, compare }
const hasherFalso = {
  hash: async (plain) => `hash:${plain}`,
  compare: async (plain, hash) => hash === `hash:${plain}`,
};

// Una partida activa con un lote de 3 aves, lista para responder
async function partidaActiva(dobles, userId = 1) {
  const preguntas = [
    { id: 1, nombre: "Hornero" },
    { id: 2, nombre: "Benteveo" },
    { id: 3, nombre: "Tero" },
  ];
  return dobles.gameSessionsDao.create({ user_id: userId, estado: "activa", preguntas, createdAt: AHORA_MS });
}

export { AHORA, AHORA_MS, crearDobles, hasherFalso, partidaActiva };
