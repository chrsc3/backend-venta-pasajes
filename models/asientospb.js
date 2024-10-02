const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class AsientoPb extends Model {}

AsientoPb.init(
  {
    idAsientoPb: {
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
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ci: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: "asientospb",
  }
);
module.exports = AsientoPb;
