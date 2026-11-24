import { ConnectionLogModel } from "../models/index.js";
import { initDatabase } from "../../connection/index.js";

const LOG_ATTRIBUTES = ["id", "user_id", "registro_id", "inicio_ms", "fin_ms", "tiempo_conectado_ms", "createdAt"];

// SQLite devuelve los BIGINT como texto en algunos casos: los pasamos a número
const aObjeto = (log) => {
  const plano = log.get({ plain: true });
  for (const campo of ["inicio_ms", "fin_ms", "createdAt"]) {
    if (plano[campo] !== null) plano[campo] = Number(plano[campo]);
  }
  return plano;
};

/**
 * Adaptador DAO para los tramos de tiempo conectado utilizando Sequelize (SQL).
 * Debe respetar la misma interfaz pública que ConnectionLogsMemoryDao.
 */
class ConnectionLogsSequelizeDao {
  async init() {
    await initDatabase();
  }

  async save(data) {
    const { id: _ignored, ...logData } = data;
    const created = await ConnectionLogModel.create(logData);
    return aObjeto(created);
  }

  async getByRegistro(userId, registroId) {
    const log = await ConnectionLogModel.findOne({
      where: { user_id: userId, registro_id: registroId },
      attributes: LOG_ATTRIBUTES,
    });
    return log ? aObjeto(log) : null;
  }

  async getAllByUser(userId) {
    const logs = await ConnectionLogModel.findAll({
      where: { user_id: userId },
      attributes: LOG_ATTRIBUTES,
      order: [["id", "ASC"]],
    });
    return logs.map(aObjeto);
  }

  // Borra todos los tramos de un usuario. Devuelve cuántos borró.
  async deleteByUser(userId) {
    return ConnectionLogModel.destroy({ where: { user_id: userId } });
  }
}

export default ConnectionLogsSequelizeDao;
