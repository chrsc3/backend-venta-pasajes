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
    const { numAsiento, estado, nombre, ci, Viajes_idViaje } = request.body;

    const asientomodel = {
      numAsiento,
      estado,
      nombre,
      ci,
    };

    const updatedAsiento = await AsientoPb.update(asientomodel, {
      where: {
        idAsientoPb: request.params.id,
        Viajes_idViaje: request.params.idViaje,
      },
    });
    if (!updatedAsiento) {
      return response.status(404).json({ error: "AsientoPb not found" });
    }
    response.json(asientomodel);
  } catch (error) {
    next(error);
  }
});

module.exports = asientospbRouter;
