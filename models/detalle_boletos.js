const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class Detalle_Boleto extends Model {}

Detalle_Boleto.init(
  {
    idDetalle_Boletos: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo precio no puede ser nulo",
        },
      },
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
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo nombre no puede ser nulo",
        },
      },
    },
    ci: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo ci no puede ser nulo",
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
    Boletos_idBoleto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo Boletos_idBoleto no puede ser nulo",
        },
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "detalle_boletos",
  }
);
module.exports = Detalle_Boleto;
