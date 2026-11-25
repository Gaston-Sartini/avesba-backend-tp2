import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import answerQuestion from "../../usecases/game/answerQuestion.js";
import { AHORA_MS, crearDobles, partidaActiva } from "./dobles.js";

const jugador = { id: 1, role: "jugador" };

describe("Caso de uso: answerQuestion", () => {
  let dobles, sesion;
  const responder = (ave_id, respuesta_usuario) => answerQuestion({ ave_id, respuesta_usuario }, jugador, dobles);

  beforeEach(async () => {
    dobles = crearDobles();
    sesion = await partidaActiva(dobles);
  });

  it("feliz: una correcta vale 10, la guarda con la hora del reloj y sube la racha", async () => {
    assert.deepEqual(await responder(1, "Hornero"), { es_correcta: true, puntos_obtenidos: 10, mensaje: "¡Correcto! ✓" });

    const [guardada] = await dobles.gameResultsDao.getBySession(sesion.id);
    assert.equal(guardada.createdAt, AHORA_MS);
    assert.equal(guardada.bonus_racha, 0);
    assert.equal((await dobles.gameSessionsDao.getById(sesion.id)).streak_actual, 1);
  });

  it("borde: cada acierto seguido vale 5 más, y a los 3 se emite la racha", async () => {
    const puntos = [];
    for (const [id, nombre] of [[1, "Hornero"], [2, "Benteveo"], [3, "Tero"]]) {
      puntos.push((await responder(id, nombre)).puntos_obtenidos);
    }
    assert.deepEqual(puntos, [10, 15, 20]);
    assert.deepEqual(
      dobles.emitidos.map((e) => [e.nombre, e.datos.racha]),
      [["game.streakAchieved", 3]]
    );
  });

  it("borde: un error vale 0 y corta la racha", async () => {
    await responder(1, "Hornero");
    assert.equal((await responder(2, "Chingolo")).puntos_obtenidos, 0);
    assert.equal((await dobles.gameSessionsDao.getById(sesion.id)).streak_actual, 0);
    assert.equal((await responder(3, "Tero")).puntos_obtenidos, 10);
  });

  it("violación: responder dos veces la misma ave da ALREADY_ANSWERED, y el estado no cambia", async () => {
    await responder(1, "Hornero");
    await assert.rejects(responder(1, "Hornero"), { code: "ALREADY_ANSWERED", statusCode: 400 });
    assert.equal((await dobles.gameResultsDao.getBySession(sesion.id)).length, 1);
    assert.equal((await dobles.gameSessionsDao.getById(sesion.id)).streak_actual, 1);
  });

  it("violación: un ave que no está en el lote da BIRD_NOT_IN_BATCH, y no se guarda nada", async () => {
    await assert.rejects(responder(99, "Carancho"), { code: "BIRD_NOT_IN_BATCH" });
    assert.deepEqual(await dobles.gameResultsDao.getBySession(sesion.id), []);
    assert.deepEqual(dobles.emitidos, []);
  });

  it("violación: sin partida activa da NO_ACTIVE_SESSION", async () => {
    await assert.rejects(answerQuestion({ ave_id: 1, respuesta_usuario: "Hornero" }, { id: 2, role: "jugador" }, dobles), {
      code: "NO_ACTIVE_SESSION",
      statusCode: 404,
    });
  });
});
