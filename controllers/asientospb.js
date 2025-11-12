const asientospbRouter = require("express").Router();
require("express-async-errors");
const { AsientoPb } = require("../models");

asientospbRouter.get("/", async (_, response) => {
  const asientos = await AsientoPb.findAll();
  response.json(asientos);
});

asientospbRouter.get("/:idViaje", async (request, response, next) => {
  try {
    const asientos = await AsientoPb.findAll({
      where: { Viajes_idViaje: request.params.idViaje },
    });
    if (asientos) {
      response.json(asientos);
    } else {
      response.status(404).json({ error: "AsientoPb not found" });
    }
  } catch (error) {
    next(error);
  }
});

asientospbRouter.put("/:id/:idViaje", async (request, response, next) => {
  try {
    const { numAsiento, estado, nombre, ci } = request.body;

    const asiento = await AsientoPb.findOne({
      where: {
        idAsientoPb: request.params.id,
        Viajes_idViaje: request.params.idViaje,
      },
    });

    if (!asiento) {
      return response.status(404).json({ error: "AsientoPb not found" });
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

module.exports = asientospbRouter;
