const asientospaRouter = require("express").Router();
require("express-async-errors");
const { AsientoPa } = require("../models");

asientospaRouter.get("/", async (_, response) => {
  const asientos = await AsientoPa.findAll();
  response.json(asientos);
});

asientospaRouter.get("/:idViaje", async (request, response, next) => {
  try {
    const asientos = await AsientoPa.findAll({
      where: { Viajes_idViaje: request.params.idViaje },
    });
    if (asientos) {
      response.json(asientos);
    } else {
      response.status(404).json({ error: "AsientoPa not found" });
    }
  } catch (error) {
    next(error);
  }
});

asientospaRouter.put("/:id/:idViaje", async (request, response, next) => {
  try {
    const { numAsiento, estado, nombre, ci } = request.body;

    const asiento = await AsientoPa.findOne({
      where: {
        idAsientoPa: request.params.id,
        Viajes_idViaje: request.params.idViaje,
      },
    });

    if (!asiento) {
      return response.status(404).json({ error: "AsientoPa not found" });
    }

    await asiento.update({
      numAsiento,
      estado,
      nombre,
      ci,
    });

    response.json(asiento);
  } catch (error) {
    next(error);
  }
});

module.exports = asientospaRouter;
