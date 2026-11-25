/**
 * Reloj inyectable (clase 13).
 * La hora es un dato EXTERNO, igual que la base o una API: si un caso de uso llama a Date.now(),
 * no se lo puede probar con una fecha fija. Por eso los casos de uso reciben un `clock` y nunca
 * leen la hora por su cuenta.
 *
 *  - En producción: createClock() → la hora real.
 *  - Para probar a mano: CLOCK_NOW=2026-12-01T12:00:00Z en el .env ("viajar en el tiempo").
 *  - En los tests: createClock({ fixedNow: "..." }) → siempre el mismo instante.
 *
 * now() devuelve milisegundos (como Date.now()), que es como el proyecto guarda todas las fechas.
 */
function createClock({ fixedNow } = {}) {
  if (!fixedNow) return { now: () => Date.now() };

  const fijo = new Date(fixedNow).getTime();
  if (Number.isNaN(fijo)) {
    throw new Error(`CLOCK_NOW no es una fecha válida: "${fixedNow}"`);
  }
  return { now: () => fijo };
}

export default createClock;
