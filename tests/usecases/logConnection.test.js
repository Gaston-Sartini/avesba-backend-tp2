import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import logConnection from "../../usecases/activity/logConnection.js";
import { AHORA_MS, crearDobles } from "./dobles.js";

const jugador = { id: 7, role: "jugador" };

describe("Caso de uso: logConnection", () => {
  let dobles;
  const tramo = (cambios = {}) => ({
    registroId: "tramo-1",
    inicioMs: AHORA_MS - 5000,
    finMs: AHORA_MS,
    tiempoConectado: 5000,
    ...cambios,
  });

  beforeEach(() => {
    dobles = crearDobles();
  });

  it("feliz: guarda el tramo a nombre del actor, con la hora del reloj, y avisa", async () => {
    assert.deepEqual(await logConnection(tramo(), jugador, dobles), { status: "ok", tiempo_conectado_ms: 5000 });

    const [guardado] = await dobles.connectionLogsDao.getAllByUser(7);
    assert.equal(guardado.user_id, 7);
    assert.equal(guardado.createdAt, AHORA_MS);
    assert.deepEqual(dobles.emitidos, [{ nombre: "user.disconnected", datos: { userId: 7, tiempoConectado: 5000 } }]);
  });

  it("borde: sin tramo (solo tiempoConectado) también se guarda", async () => {
    await logConnection({ tiempoConectado: 1000 }, jugador, dobles);
    const [guardado] = await dobles.connectionLogsDao.getAllByUser(7);
    assert.equal(guardado.registro_id, null);
  });

  it("borde: un reintento del mismo tramo responde ok sin guardarlo de nuevo ni volver a avisar", async () => {
    await logConnection(tramo(), jugador, dobles);
    assert.deepEqual(await logConnection(tramo(), jugador, dobles), { status: "ok", tiempo_conectado_ms: 5000 });
    assert.equal((await dobles.connectionLogsDao.getAllByUser(7)).length, 1);
    assert.equal(dobles.emitidos.length, 1);
  });

  it("violación: el mismo registroId con otro intervalo da 409, y el estado no cambia", async () => {
    await logConnection(tramo(), jugador, dobles);
    await assert.rejects(logConnection(tramo({ inicioMs: AHORA_MS - 4000, tiempoConectado: 4000 }), jugador, dobles), {
      code: "REGISTRO_DUPLICATED",
      statusCode: 409,
    });
    assert.equal((await dobles.connectionLogsDao.getAllByUser(7)).length, 1);
  });

  it("violación: un tramo incoherente o que termina en el futuro da INVALID_INTERVAL", async () => {
    await assert.rejects(logConnection(tramo({ tiempoConectado: 1 }), jugador, dobles), { code: "INVALID_INTERVAL" });
    const futuro = AHORA_MS + 10 * 60 * 1000; // el reloj fijo permite saber exactamente qué es "el futuro"
    await assert.rejects(logConnection(tramo({ inicioMs: futuro - 5000, finMs: futuro }), jugador, dobles), {
      code: "INVALID_INTERVAL",
    });
    assert.deepEqual(await dobles.connectionLogsDao.getAllByUser(7), []);
  });
});
