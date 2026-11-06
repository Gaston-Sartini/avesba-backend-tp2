/*
* Reglas del juego: funciones puras (no necesitan ni base de datos ni HTTP), faciles de testear.
* Las usan los casos de uso del juego, métricas y la carga de datos de prueba
*/
const PUNTOS_POR_ACIERTO = 10;
const PREGUNTAS_POR_PARTIDA = 10;

// funcion para normalizar el texto a comparar.
const normalizar = (texto) => texto.trim().toLowerCase();

// funcion para evaluar la respuesta del jugador y retornar el puntaje obtenido y si acertó o no.
function evaluarRespuesta(respuestaUsuario, nombreCorrecto) {
    const esCorrecta = normalizar(respuestaUsuario) === normalizar(nombreCorrecto);
    return { esCorrecta, puntos: esCorrecta ? PUNTOS_POR_ACIERTO : 0 };
}

// Bonus por racha de aciertos seguidos:
function calcularBonusRacha(racha) {
    if (racha === 3) return 5;
    if (racha === 5) return 15;
    if (racha >= 10) return 50;
    return 0;
}

// Porcentaje con 2 decimales (0 si no hubo intentos, para no dividir por cero)
function porcentaje(aciertos, intentos) {
    return intentos > 0 ? Math.round((aciertos / intentos) * 10000) / 100 : 0;
}

// Puntos de una respuesta: los base más el bonus por racha
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
function armarMensaje(esCorrecta, racha, bonus) {
    let mensaje = esCorrecta ? "¡Correcto! ✓" : "Incorrecto. ✗";
    if(bonus > 0) {
        if (racha === 3) mensaje += ` 🔥 ¡Racha de 3! +${bonus} pts bonus`;
        else if (racha === 5) mensaje += ` 🔥🔥 ¡Racha de 5! +${bonus} pts bonus`
        else mensaje += ` 🔥🔥🔥 ¡RACHA ÉPICA! +${bonus} pts bonus`;
    }
    return mensaje;
}

export {
    PUNTOS_POR_ACIERTO,
    PREGUNTAS_POR_PARTIDA,
    evaluarRespuesta,
    calcularBonusRacha,
    porcentaje,
    puntosDe,
    resumirRespuestas,
    armarMensaje
};