const choferesRouter = require("express").Router();
require("express-async-errors");
const { Chofer } = require("../models");

choferesRouter.post("/", async (request, response, next) => {
  try {
    const { nombre, numLicencia, telefono } = request.body;

    const chofermodel = Chofer.build({
      nombre: nombre,
      numLicencia: numLicencia,
      telefono: telefono,
      estado: "activo",
    });

    const savedChrofer = await chofermodel.save();

    response.status(201).json(savedChrofer);
  } catch (error) {
    next(error);
  }
});
choferesRouter.get("/", async (_, response) => {
  const choferes = await Chofer.findAll();
  response.json(choferes);
});
choferesRouter.get("/:id", async (request, response, next) => {
  try {
    const chofer = await Chofer.findByPk(request.params.id);
    if (chofer) {
      response.json(chofer);
    } else {
      response.status(404).json({ error: "Chofer not found" });
    }
  } catch (error) {
    next(error);
  }
});

choferesRouter.put("/:id", async (request, response, next) => {
  try {
    const { nombre, numLicencia, telefono, estado } = request.body;

    const chofer = await Chofer.findByPk(request.params.id);
    if (!chofer) {
      return response.status(404).json({ error: "Chofer not found" });
    }

    await chofer.update({
      nombre,
      numLicencia,
      telefono,
      estado,
    });

    response.json(chofer);
  } catch (error) {
    next(error);
  }
});

choferesRouter.delete("/:id", async (request, response, next) => {
  try {
    await Chofer.destroy({
      where: { idChofer: request.params.id },
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = choferesRouter;
