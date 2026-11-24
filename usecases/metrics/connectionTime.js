/**
 * Tiempo conectado a partir de los tramos guardados. Funciones puras: fáciles de testear.
 * "Hoy" es el día de Argentina (UTC-3, sin horario de verano).
 */
const DIA_MS = 24 * 60 * 60 * 1000;
const DESFASE_ARGENTINA_MS = 3 * 60 * 60 * 1000;

// Las 00:00 de hoy en Argentina, en milisegundos
function inicioDelDiaArgentina(ahora) {
  return Math.floor((ahora - DESFASE_ARGENTINA_MS) / DIA_MS) * DIA_MS + DESFASE_ARGENTINA_MS;
}

// Cuánto de un tramo cae dentro de hoy. Si el tramo no tiene inicio y fin (avisos viejos), cuenta entero si se guardó hoy.
function aporteDeHoy(log, inicioHoy, ahora) {
  if (log.inicio_ms === null || log.fin_ms === null) {
    return log.createdAt >= inicioHoy ? log.tiempo_conectado_ms : 0;
  }
  const desde = Math.max(log.inicio_ms, inicioHoy);
  const hasta = Math.min(log.fin_ms, ahora);
  return Math.max(hasta - desde, 0);
}

// { hoy_seg, total_seg }: lo que se muestra en "Mis métricas"
function resumirTiempoConectado(logs, ahora = Date.now()) {
  const inicioHoy = inicioDelDiaArgentina(ahora);
  const totalMs = logs.reduce((suma, log) => suma + log.tiempo_conectado_ms, 0);
  const hoyMs = logs.reduce((suma, log) => suma + aporteDeHoy(log, inicioHoy, ahora), 0);
  return { hoy_seg: Math.floor(hoyMs / 1000), total_seg: Math.floor(totalMs / 1000) };
}

export { inicioDelDiaArgentina, resumirTiempoConectado };
