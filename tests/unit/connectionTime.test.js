import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { inicioDelDiaArgentina, resumirTiempoConectado } from "../../usecases/metrics/connectionTime.js";

const HORA = 60 * 60 * 1000;
// 15/11/2026 a las 10:00 de Argentina (13:00 UTC)
const AHORA = Date.UTC(2026, 10, 15, 13, 0, 0);
const MEDIANOCHE = Date.UTC(2026, 10, 15, 3, 0, 0); // 00:00 de Argentina

const tramo = (inicio, fin) => ({ inicio_ms: inicio, fin_ms: fin, tiempo_conectado_ms: fin - inicio, createdAt: fin });

describe("Tiempo conectado", () => {
  it("el día empieza a las 00:00 de Argentina (UTC-3)", () => {
    assert.equal(inicioDelDiaArgentina(AHORA), MEDIANOCHE);
    assert.equal(inicioDelDiaArgentina(MEDIANOCHE), MEDIANOCHE);
    assert.equal(inicioDelDiaArgentina(MEDIANOCHE - 1), MEDIANOCHE - 24 * HORA);
  });

  it("suma el total y solo la parte de hoy de cada tramo", () => {
    const logs = [
      tramo(MEDIANOCHE - HORA, MEDIANOCHE + HORA), // cruza la medianoche: hoy cuenta 1 h
      tramo(MEDIANOCHE + 2 * HORA, MEDIANOCHE + 3 * HORA), // todo hoy: 1 h
      tramo(MEDIANOCHE - 5 * HORA, MEDIANOCHE - 4 * HORA), // ayer: no cuenta hoy
    ];
    assert.deepEqual(resumirTiempoConectado(logs, AHORA), { hoy_seg: 2 * 3600, total_seg: 4 * 3600 });
  });

  it("los avisos sin tramo cuentan enteros si se guardaron hoy", () => {
    const logs = [
      { inicio_ms: null, fin_ms: null, tiempo_conectado_ms: 90_000, createdAt: AHORA - HORA },
      { inicio_ms: null, fin_ms: null, tiempo_conectado_ms: 30_000, createdAt: MEDIANOCHE - HORA },
    ];
    assert.deepEqual(resumirTiempoConectado(logs, AHORA), { hoy_seg: 90, total_seg: 120 });
  });

  it("sin tramos todo da 0", () => {
    assert.deepEqual(resumirTiempoConectado([], AHORA), { hoy_seg: 0, total_seg: 0 });
  });
});
