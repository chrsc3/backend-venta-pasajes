const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class AsientoPa extends Model {}

AsientoPa.init(
  {
    idAsientoPa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numAsiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo numAsiento no puede ser nulo",
        },
      },
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo estado no puede ser nulo",
        },
      },
    },
    Viajes_idViaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo Viajes_idViaje no puede ser nulo",
        },
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "asientospa",
  }
);
module.exports = AsientoPa;
