/**
 * Reglas del juego: funciones puras (no usan base de datos ni HTTP), fáciles de testear.
 * Las usan los casos de uso del juego, las métricas y la carga de datos de prueba.
 */

const PUNTOS_POR_ACIERTO = 10; // la primera respuesta correcta de una racha
const PUNTOS_EXTRA_POR_RACHA = 5; // cada acierto seguido suma 5 más que el anterior
const PREGUNTAS_POR_PARTIDA = 10;

// Compara sin importar mayúsculas ni espacios de más
const normalizar = (texto) => texto.trim().toLowerCase();

// ¿La respuesta es correcta?
function evaluarRespuesta(respuestaUsuario, nombreCorrecto) {
  return normalizar(respuestaUsuario) === normalizar(nombreCorrecto);
}

// Puntos de una respuesta: 0 si es incorrecta; si es correcta, 10 + 5 por cada acierto seguido anterior.
// `racha` incluye esta respuesta: 1ª correcta = 10, 2ª = 15, 3ª = 20...
// Es la misma regla que usa el front (calcularPuntos en src/juego/puntaje.js).
function calcularPuntos(esCorrecta, racha) {
  if (!esCorrecta) return 0;
  return PUNTOS_POR_ACIERTO + PUNTOS_EXTRA_POR_RACHA * (racha - 1);
}

// Rachas que merecen un aviso: 3, 5 y de 10 en adelante
const esRachaDestacada = (racha) => racha === 3 || racha === 5 || racha >= 10;

// Porcentaje con 2 decimales (0 si no hubo intentos, para no dividir por cero)
function porcentaje(aciertos, intentos) {
  return intentos > 0 ? Math.round((aciertos / intentos) * 10000) / 100 : 0;
}

// Puntos de una respuesta guardada. bonus_racha queda en 0 desde que la racha va incluida en los puntos,
// pero se sigue sumando para respetar las respuestas viejas que lo tengan.
const puntosDe = (respuesta) => respuesta.puntos_obtenidos + respuesta.bonus_racha;

// Resumen de un conjunto de respuestas (una partida, un jugador o todo el sistema)
function resumirRespuestas(respuestas) {
  const total_intentos = respuestas.length;
  const total_aciertos = respuestas.filter((r) => r.es_correcta).length;
  return {
    puntos_totales: respuestas.reduce((suma, r) => suma + puntosDe(r), 0),
    total_intentos,
    total_aciertos,
    porcentaje_acierto: porcentaje(total_aciertos, total_intentos),
  };
}

// Mensaje que ve el jugador al responder
const armarMensaje = (esCorrecta) => (esCorrecta ? "¡Correcto! ✓" : "Incorrecto. ✗");

export {
  PUNTOS_POR_ACIERTO,
  PUNTOS_EXTRA_POR_RACHA,
  PREGUNTAS_POR_PARTIDA,
  evaluarRespuesta,
  calcularPuntos,
  esRachaDestacada,
  porcentaje,
  puntosDe,
  resumirRespuestas,
  armarMensaje,
};
