const boletoRouter = require("express").Router();
require("express-async-errors");

const { Boleto, Viaje, Detalle_Boleto } = require("../models");
const { Op } = require("sequelize");

boletoRouter.get("/ventasDia", async (request, response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const ventas = await Boleto.findAll({
    include: [
      {
        model: Detalle_Boleto,
        include: [
          {
            model: Viaje,
            attributes: ["idViaje", "origen", "destino"],
          },
        ],
      },
    ],
    where: {
      fecha: {
        [Op.between]: [today, tomorrow],
      },
    },
  });
  const viajesMap = {};

  ventas.forEach((boleto) => {
    boleto.detalle_boletos.forEach((detalle) => {
      const viaje = detalle.viaje;
      const idViaje = viaje.idViaje;
      const monto = parseInt(detalle.precio); // Asumiendo que 'precio' es el monto recaudado

      if (!viajesMap[idViaje]) {
        viajesMap[idViaje] = {
          idViaje: viaje.idViaje,
          origen: viaje.origen,
          destino: viaje.destino,
          totalRecaudado: 0,
          totalPasajeros: 0,
        };
      }
      viajesMap[idViaje].totalRecaudado += monto;
      viajesMap[idViaje].totalPasajeros++;
    });
  });

  const viajes = Object.values(viajesMap);

  response.json(viajes);
});
module.exports = boletoRouter;
