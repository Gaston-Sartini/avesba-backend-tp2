import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  evaluarRespuesta,
  calcularPuntos,
  esRachaDestacada,
  porcentaje,
  resumirRespuestas,
  armarMensaje,
} from "../../usecases/game/gameRules.js";

describe("Reglas del juego", () => {
  describe("evaluarRespuesta", () => {
    it("una respuesta igual al nombre correcto es correcta", () => {
      assert.equal(evaluarRespuesta("Tero", "Tero"), true);
    });

    it("no importan las mayúsculas ni los espacios de más", () => {
      assert.equal(evaluarRespuesta("  tERo ", "Tero"), true);
    });

    it("una respuesta distinta es incorrecta", () => {
      assert.equal(evaluarRespuesta("Chingolo", "Tero"), false);
    });
  });

  describe("calcularPuntos", () => {
    it("una correcta vale 10 y cada acierto seguido suma 5 más (igual que el front)", () => {
      assert.deepEqual([1, 2, 3, 4, 5].map((racha) => calcularPuntos(true, racha)), [10, 15, 20, 25, 30]);
      assert.equal(calcularPuntos(true, 10), 55);
    });

    it("una incorrecta vale 0", () => {
      assert.equal(calcularPuntos(false, 0), 0);
    });
  });

  describe("esRachaDestacada", () => {
    it("avisa a los 3, 5 y 10 o más aciertos seguidos", () => {
      assert.deepEqual([3, 5, 10, 12].map(esRachaDestacada), [true, true, true, true]);
      assert.deepEqual([0, 1, 2, 4, 6, 9].map(esRachaDestacada), [false, false, false, false, false, false]);
    });
  });

  describe("porcentaje", () => {
    it("redondea a 2 decimales", () => {
      assert.equal(porcentaje(1, 3), 33.33);
      assert.equal(porcentaje(2, 3), 66.67);
    });

    it("con 0 intentos da 0 (no divide por cero)", () => {
      assert.equal(porcentaje(0, 0), 0);
    });
  });

  describe("resumirRespuestas", () => {
    it("suma puntos y bonus (el de las respuestas viejas), y cuenta intentos y aciertos", () => {
      const respuestas = [
        { es_correcta: true, puntos_obtenidos: 10, bonus_racha: 0 },
        { es_correcta: true, puntos_obtenidos: 10, bonus_racha: 0 },
        { es_correcta: true, puntos_obtenidos: 10, bonus_racha: 5 },
        { es_correcta: false, puntos_obtenidos: 0, bonus_racha: 0 },
      ];
      assert.deepEqual(resumirRespuestas(respuestas), {
        puntos_totales: 35,
        total_intentos: 4,
        total_aciertos: 3,
        porcentaje_acierto: 75,
      });
    });

    it("sin respuestas todo da 0", () => {
      assert.deepEqual(resumirRespuestas([]), {
        puntos_totales: 0,
        total_intentos: 0,
        total_aciertos: 0,
        porcentaje_acierto: 0,
      });
    });
  });

  describe("armarMensaje", () => {
    it("avisa si fue correcta o incorrecta", () => {
      assert.equal(armarMensaje(true), "¡Correcto! ✓");
      assert.equal(armarMensaje(false), "Incorrecto. ✗");
    });
  });
});
