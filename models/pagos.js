const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class Pago extends Model {}

Pago.init(
  {
    idPago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo monto no puede ser nulo",
        },
        min: {
          args: [0.01],
          msg: "El monto debe ser mayor que 0",
        },
      },
    },
    metodo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo metodo no puede ser nulo",
        },
        isIn: {
          args: [["efectivo", "tarjeta", "transferencia", "online"]],
          msg: "El metodo debe ser uno de: efectivo, tarjeta, transferencia, online",
        },
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo fecha no puede ser nulo",
        },
      },
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "activo",
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
    Usuarios_idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "pagos",
  }
);

module.exports = Pago;
