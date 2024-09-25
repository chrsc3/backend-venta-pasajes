const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class Viaje extends Model {}

Viaje.init(
  {
    idViaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    origen: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo origen no puede ser nulo",
        },
      },
    },
    destino: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo destino no puede ser nulo",
        },
      },
    },
    fechaViaje: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo fechaViaje no puede ser nulo",
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
    Buses_idBus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo Buses_idBus no puede ser nulo",
        },
      },
    },
    Oficinas_idOficina: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo Oficinas_idOficina no puede ser nulo",
        },
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "viajes",
  }
);
module.exports = Viaje;
