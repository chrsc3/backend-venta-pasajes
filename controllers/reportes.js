const reportesRouter = require("express").Router();
require("express-async-errors");
const { Op } = require("sequelize");
const { Boleto, Viaje, Detalle_Boleto, Usuarios } = require("../models");

reportesRouter.get("/viaje/:idviaje", async (request, response) => {
  const { idviaje } = request.params;
  const Detalle = await Detalle_Boleto.findAll({
    where: { Viajes_idViaje: idviaje },
  });
  const uniqueBoletos = [
    ...new Set(Detalle.map((det) => det.Boletos_idBoleto)),
  ];
  const boletos = await Boleto.findAll({
    where: { idBoleto: uniqueBoletos },
    include: [
      { model: Detalle_Boleto },
      {
        model: Usuarios,
        attributes: ["nombre", "apellido"],
      },
    ],
  });
  response.json(boletos);
});
reportesRouter.post("/fechas", async (request, response) => {
  const { fechaInicio, fechaFin } = request.body;
  const boletos = await Boleto.findAll({
    where: {
      fecha: {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
      },
    },
    include: [
      { model: Detalle_Boleto },
      {
        model: Usuarios,
        attributes: ["nombre", "apellido"],
      },
    ],
  });
  response.json(boletos);
});
module.exports = reportesRouter;
