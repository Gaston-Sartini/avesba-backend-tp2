import { describe, it } from "node:test";
import assert from "node:assert/strict";
import buildRanking, { buildPlayerRow } from "../../usecases/game/buildRanking.js";

const users = [
  { id: 1, nombre: "Ana", apellido: "A" },
  { id: 2, nombre: "Beto", apellido: "B" },
  { id: 3, nombre: "Caro", apellido: "C" },
];

const respuesta = (user_id, es_correcta, puntos = es_correcta ? 10 : 0) => ({
  user_id,
  es_correcta,
  puntos_obtenidos: puntos,
  bonus_racha: 0,
});

describe("Ranking", () => {
  it("ordena por puntos de mayor a menor y numera las posiciones", () => {
    const ranking = buildRanking(users, [respuesta(1, true), respuesta(2, true), respuesta(2, true, 15), respuesta(3, true, 20)]);

    assert.deepEqual(
      ranking.map((j) => [j.user_id, j.puntos_totales, j.posicion]),
      [
        [2, 25, 1],
        [3, 20, 2],
        [1, 10, 3],
      ]
    );
  });

  it("cuenta aciertos y fallos de cada jugador", () => {
    const [primero] = buildRanking(users, [respuesta(1, true), respuesta(1, false), respuesta(1, false)]);
    assert.deepEqual(primero, { user_id: 1, nombre: "Ana", apellido: "A", puntos_totales: 10, aciertos: 1, fallos: 2, posicion: 1 });
  });

  it("deja afuera a los que todavía no sumaron puntos", () => {
    assert.equal(buildRanking(users, []).length, 0);
    const ranking = buildRanking(users, [respuesta(1, true), respuesta(2, false)]);
    assert.deepEqual(ranking.map((j) => j.user_id), [1]);
  });

  it("si empatan en puntos, desempata por aciertos y después por antigüedad", () => {
    const ranking = buildRanking(users, [respuesta(3, true), respuesta(2, true), respuesta(1, true, 5), respuesta(1, true, 5)]);
    assert.deepEqual(
      ranking.map((j) => j.user_id),
      [1, 2, 3]
    );
  });
});

describe("Fila de un jugador", () => {
  it("si está en el ranking, devuelve su fila con la posición", () => {
    const respuestas = [respuesta(1, true), respuesta(2, true, 20)];
    const ranking = buildRanking(users, respuestas);
    assert.equal(buildPlayerRow(users[0], respuestas, ranking).posicion, 2);
  });

  it("si no sumó puntos, devuelve sus números con posición null", () => {
    const respuestas = [respuesta(1, true), respuesta(3, false), respuesta(3, false)];
    const ranking = buildRanking(users, respuestas);
    assert.deepEqual(buildPlayerRow(users[2], respuestas, ranking), {
      user_id: 3,
      nombre: "Caro",
      apellido: "C",
      puntos_totales: 0,
      aciertos: 0,
      fallos: 2,
      posicion: null,
    });
  });
});
