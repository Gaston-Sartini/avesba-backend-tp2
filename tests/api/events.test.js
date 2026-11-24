import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer, registerPlayer } from "../helpers.js";

const JUEGO = "/api/inaturalist/juego";

// Notificador espía: mismo contrato notify({ subject, body }), pero guarda los avisos para revisarlos
function crearNotificadorEspia() {
  const avisos = [];
  return { avisos, async notify(aviso) { avisos.push(aviso); } };
}

// Los listeners son asíncronos: esperamos un "tick" para que terminen
const esperar = () => new Promise((resolve) => setImmediate(resolve));

describe("Eventos y notificaciones", () => {
  let api;
  const espia = crearNotificadorEspia();
  before(async () => (api = await startServer({ notifier: espia })));
  after(() => api.close());

  it("al registrarse un jugador se manda la bienvenida", async () => {
    const player = await registerPlayer(api, { nombre: "Eva", apellido: "Luna" });
    await esperar();
    assert.ok(espia.avisos.some((a) => a.subject === "Bienvenida" && a.body.includes(player.email)));
  });

  it("al lograr una racha de 3 y al terminar la partida se avisa", async () => {
    const { token } = await registerPlayer(api);
    await api.post(`${JUEGO}/iniciar`, undefined, { token });
    const { preguntas } = (await api.get(`${JUEGO}/sesion`, { token })).body;
    for (const pregunta of preguntas.slice(0, 3)) {
      await api.post(`${JUEGO}/respuesta`, { ave_id: pregunta.id, respuesta_usuario: pregunta.nombre }, { token });
    }
    await api.post(`${JUEGO}/terminar`, undefined, { token });
    await esperar();

    assert.ok(espia.avisos.some((a) => a.subject === "Racha" && a.body.includes("3 aciertos seguidos")));
    assert.ok(espia.avisos.some((a) => a.subject === "Partida terminada" && a.body.includes("45 puntos")));
  });

  describe("POST /api/user-connection-log (tiempo conectado que manda el front)", () => {
    const LOG = "/api/user-connection-log";
    const yo = async () => {
      const player = await registerPlayer(api);
      const me = await api.get("/users/me", { token: player.token });
      return { ...player, id: me.body.id };
    };

    it("pide estar logueado", async () => {
      assert.equal((await api.post(LOG, { tiempoConectado: 1000 })).status, 401);
    });

    it("acepta el JSON como texto plano (así lo manda sendBeacon), lo guarda y avisa", async () => {
      const player = await yo();
      const response = await api.request("POST", LOG, {
        body: JSON.stringify({ userId: 999, tiempoConectado: 125000 }),
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        token: player.token,
      });
      assert.equal(response.status, 201);
      assert.deepEqual(response.body, { status: "ok", tiempo_conectado_ms: 125000 });
      await esperar();
      // El userId del cliente se ignora: el tramo es del usuario logueado
      assert.ok(espia.avisos.some((a) => a.subject === "Desconexión" && a.body === `El usuario ${player.id} estuvo conectado 125 segundos`));
      assert.equal((await api.daos.connectionLogsDao.getAllByUser(player.id)).length, 1);
    });

    it("un reintento del mismo tramo no se guarda dos veces, y otro tramo con el mismo registroId da 409", async () => {
      const player = await yo();
      const fin = Date.now();
      const tramo = { registroId: "tramo-1", inicioMs: fin - 5000, finMs: fin, tiempoConectado: 5000 };
      assert.equal((await api.post(LOG, tramo, { token: player.token })).status, 201);
      assert.equal((await api.post(LOG, tramo, { token: player.token })).status, 201);
      assert.equal((await api.daos.connectionLogsDao.getAllByUser(player.id)).length, 1);

      const otro = await api.post(LOG, { ...tramo, inicioMs: fin - 4000, tiempoConectado: 4000 }, { token: player.token });
      assert.equal(otro.status, 409);
      assert.equal(otro.body.error.code, "REGISTRO_DUPLICATED");
    });

    it("con datos inválidos responde 400", async () => {
      const { token } = await yo();
      const noJson = await api.request("POST", LOG, { body: "esto no es json", headers: { "Content-Type": "text/plain" }, token });
      assert.equal(noJson.status, 400);
      assert.equal((await api.post(LOG, { tiempoConectado: -5 }, { token })).status, 400);
      assert.equal((await api.post(LOG, { tiempoConectado: 24 * 60 * 60 * 1000 + 1 }, { token })).status, 400);

      const fin = Date.now();
      const incoherente = await api.post(LOG, { registroId: "x", inicioMs: fin - 5000, finMs: fin, tiempoConectado: 1 }, { token });
      assert.equal(incoherente.body.error.code, "INVALID_INTERVAL");
      const incompleto = await api.post(LOG, { inicioMs: fin - 5000, tiempoConectado: 5000 }, { token });
      assert.equal(incompleto.body.error.code, "INVALID_INTERVAL");
    });
  });
});

describe("Si el notificador falla", () => {
  let api;
  const notificadorRoto = {
    async notify() {
      throw new Error("se cayó el servidor de mails");
    },
  };
  before(async () => (api = await startServer({ notifier: notificadorRoto })));
  after(() => api.close());

  it("el registro igual funciona (la notificación no afecta al caso de uso)", async () => {
    const response = await api.post("/auth/register", {
      nombre: "Ana",
      apellido: "Paz",
      email: `roto.${Date.now()}@test.com`,
      password: "SecurePassword123!",
    });
    assert.equal(response.status, 201);
  });
});
