/**
 * Adaptador DAO en memoria para los tramos de tiempo conectado.
 * Respeta la misma interfaz pública que ConnectionLogsSequelizeDao.
 */
// Mismos valores por defecto que ConnectionLogModel (así los dos DAOs devuelven lo mismo)
const DEFAULTS = { registro_id: null, inicio_ms: null, fin_ms: null };

class ConnectionLogsMemoryDao {
  #logs = [];
  #nextId = 1;

  async save(data) {
    const { id: _ignored, ...logData } = data;
    const newLog = { id: this.#nextId++, ...DEFAULTS, ...logData };
    this.#logs.push(newLog);
    return { ...newLog };
  }

  // El tramo con ese registro_id de ese usuario (o null): sirve para no guardar dos veces un reintento
  async getByRegistro(userId, registroId) {
    const log = this.#logs.find((l) => l.user_id === Number(userId) && l.registro_id === registroId);
    return log ? { ...log } : null;
  }

  // Todos los tramos de un usuario
  async getAllByUser(userId) {
    return this.#logs.filter((l) => l.user_id === Number(userId)).map((l) => ({ ...l }));
  }

  // Borra todos los tramos de un usuario. Devuelve cuántos borró.
  async deleteByUser(userId) {
    const antes = this.#logs.length;
    this.#logs = this.#logs.filter((l) => l.user_id !== Number(userId));
    return antes - this.#logs.length;
  }
}

export default ConnectionLogsMemoryDao;
