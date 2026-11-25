import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import createUser from "../../usecases/users/createUser.js";
import deleteUser from "../../usecases/users/deleteUser.js";
import { AHORA_MS, crearDobles, hasherFalso } from "./dobles.js";

const datos = { nombre: "Ana", apellido: "Paz", email: "ana@test.com", password: "Password123" };

describe("Caso de uso: createUser", () => {
  let dobles;
  beforeEach(() => {
    dobles = { ...crearDobles(), hasher: hasherFalso };
  });

  it("feliz: crea un jugador con la hora del reloj, guarda el hash y avisa", async () => {
    const user = await createUser(datos, dobles);
    assert.equal(user.role, "jugador");
    assert.equal(user.createdAt, AHORA_MS);
    assert.equal(user.passwordHash, undefined); // el DAO nunca lo devuelve
    assert.equal((await dobles.usersDao.getCredentialsByEmail("ana@test.com")).passwordHash, "hash:Password123");
    assert.equal(dobles.emitidos[0].nombre, "user.registered");
  });

  it("violación: un email repetido da EMAIL_DUPLICATED, y no se crea otro ni se avisa de nuevo", async () => {
    await createUser(datos, dobles);
    await assert.rejects(createUser({ ...datos, nombre: "Otra" }, dobles), { code: "EMAIL_DUPLICATED", statusCode: 409 });
    assert.equal(await dobles.usersDao.count(), 1);
    assert.equal(dobles.emitidos.length, 1);
  });
});

describe("Caso de uso: deleteUser", () => {
  let dobles, admin, jugador;
  beforeEach(async () => {
    dobles = { ...crearDobles(), hasher: hasherFalso };
    admin = await createUser({ ...datos, email: "admin@test.com", role: "admin" }, dobles);
    jugador = await createUser(datos, dobles);
  });

  it("feliz: borra al usuario junto con su tiempo conectado", async () => {
    await dobles.connectionLogsDao.save({ user_id: jugador.id, tiempo_conectado_ms: 1000, createdAt: AHORA_MS });
    await deleteUser(jugador.id, admin, dobles);
    assert.equal(await dobles.usersDao.getById(jugador.id), null);
    assert.deepEqual(await dobles.connectionLogsDao.getAllByUser(jugador.id), []);
  });

  it("violación: un admin no puede borrarse a sí mismo, y sigue existiendo", async () => {
    await assert.rejects(deleteUser(admin.id, admin, dobles), { code: "CANNOT_DELETE_SELF", statusCode: 409 });
    assert.ok(await dobles.usersDao.getById(admin.id));
  });
});
