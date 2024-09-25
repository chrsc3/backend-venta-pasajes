const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class Viaje_Chofer extends Model {}

Viaje_Chofer.init(
  {
    Viajes_idViaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    Choferes_idChofer: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "viajes_has_choferes",
  }
);
module.exports = Viaje_Chofer;
