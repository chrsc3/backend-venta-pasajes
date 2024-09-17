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
    const { idChofer, nombre, numLicencia, telefono, estado } = request.body;

    const chofermodel = {
      idChofer: idChofer,
      nombre: nombre,
      numLicencia: numLicencia,
      telefono: telefono,
      estado: estado,
    };

    const updatedChofer = await Chofer.update(chofermodel, {
      where: { idChofer: request.params.id },
    });
    if (!updatedChofer) {
      return response.status(404).json({ error: "Chofer not found" });
    }
    response.json(chofermodel);
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
