const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class Boleto extends Model {}

Boleto.init(
  {
    idBoleto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("fecha");
        if (!rawValue) return null;
        // Devolver la fecha sin conversión a UTC
        const date = new Date(rawValue);
        // Ajustar para zona horaria local (GMT-4)
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 19).replace("T", " ");
      },
      validate: {
        notNull: {
          msg: "El campo fecha no puede ser nulo",
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
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo total no puede ser nulo",
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
        isIn: {
          args: [["activo", "reserva", "anulado"]],
          msg: "El estado debe ser 'activo', 'reserva' o 'anulado'",
        },
      },
    },
    Usuarios_idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo Usuarios_idUsuario no puede ser nulo",
        },
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "boletos",
  }
);

module.exports = Boleto;
