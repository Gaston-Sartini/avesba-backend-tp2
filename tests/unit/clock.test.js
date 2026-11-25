import { describe, it } from "node:test";
import assert from "node:assert/strict";
import createClock from "../../utils/clock.js";

describe("Reloj", () => {
  it("sin fecha fija da la hora real", () => {
    const antes = Date.now();
    const ahora = createClock().now();
    assert.ok(ahora >= antes && ahora <= Date.now());
  });

  it("con fecha fija devuelve siempre el mismo instante, en milisegundos", () => {
    const clock = createClock({ fixedNow: "2026-12-01T12:00:00Z" });
    assert.equal(clock.now(), Date.UTC(2026, 11, 1, 12, 0, 0));
    assert.equal(clock.now(), clock.now());
  });

  it("una fecha inválida corta el arranque", () => {
    assert.throws(() => createClock({ fixedNow: "mañana" }), /CLOCK_NOW no es una fecha válida/);
  });
});
