import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../connection/index.js";

/**
 * Un tramo de tiempo conectado de un jugador (lo manda el front al cerrar sesión o la pestaña).
 * De esta tabla salen el tiempo conectado de hoy y el total de las métricas.
 */
class ConnectionLogModel extends Model {}

ConnectionLogModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // user_id lo conecta la asociación (ver models/index.js)
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Identificador del tramo que genera el front: si reintenta el envío, no se guarda dos veces
    registro_id: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    // Inicio y fin del tramo en milisegundos (null en los avisos que no los mandan)
    inicio_ms: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    fin_ms: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    tiempo_conectado_ms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ConnectionLog",
    tableName: "user_connection_logs",
    timestamps: false,
    // El mismo tramo de un mismo usuario no puede guardarse dos veces
    indexes: [{ unique: true, fields: ["user_id", "registro_id"] }],
  }
);

export default ConnectionLogModel;
