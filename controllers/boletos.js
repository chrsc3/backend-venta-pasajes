const boletoRouter = require("express").Router();
require("express-async-errors");

const { Boleto, Viaje, Detalle_Boleto } = require("../models");

boletoRouter.post("/", async (request, response, next) => {
  try {
    const { nombre, ci, total, Usuarios_idUsuario, detalleBoleto } =
      request.body;
    const boletoModel = Boleto.build({
      fecha: new Date(),
      nombre: nombre,
      ci: ci,
      total: total,
      estado: "activo",
      Usuarios_idUsuario: Usuarios_idUsuario,
    });

    const savedBoleto = await boletoModel.save();
    if (savedBoleto) {
      await Promise.all(
        detalleBoleto.map(async (detalle) => {
          const detalleBoleto = Detalle_Boleto.build({
            precio: detalle.precio,
            numAsiento: detalle.numAsiento,
            nombre: detalle.nombre,
            ci: detalle.ci,
            estado: "activo",
            Boletos_idBoleto: savedBoleto.idBoleto,
            Viajes_idViaje: detalle.Viajes_idViaje,
          });
          await detalleBoleto.save();
        })
      );
    }
    const boletoWithDetails = await Boleto.findByPk(savedBoleto.idBoleto, {
      include: [{ model: Detalle_Boleto }],
    });
    response.status(201).json(boletoWithDetails);
  } catch (error) {
    next(error);
  }
});

boletoRouter.get("/", async (_, response) => {
  const ventas = await Boleto.findAll({
    include: [{ model: Detalle_Boleto }],
  });
  response.json(ventas);
});

module.exports = boletoRouter;
