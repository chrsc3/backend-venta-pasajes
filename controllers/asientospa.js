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
    const { numAsiento, estado, nombre, ci, Viajes_idViaje } = request.body;

    const asientomodel = {
      numAsiento,
      estado,
      nombre,
      ci,
    };

    const updatedAsiento = await AsientoPa.update(asientomodel, {
      where: {
        idAsientoPa: request.params.id,
        Viajes_idViaje: request.params.idViaje,
      },
    });
    if (!updatedAsiento) {
      return response.status(404).json({ error: "AsientoPa not found" });
    }
    response.json(asientomodel);
  } catch (error) {
    next(error);
  }
});

module.exports = asientospaRouter;
