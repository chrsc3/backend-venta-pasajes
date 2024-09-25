const oficinasRouter = require("express").Router();
require("express-async-errors");
const { Oficina } = require("../models");

oficinasRouter.post("/", async (request, response, next) => {
  try {
    const { nombre, cuidad, direccion, telefono } = request.body;

    const oficinamodel = Oficina.build({
      nombre: nombre,
      cuidad: cuidad,
      direccion: direccion,
      telefono: telefono,
      estado: "activo",
    });

    const savedOficina = await oficinamodel.save();

    response.status(201).json(savedOficina);
  } catch (error) {
    next(error);
  }
});

oficinasRouter.get("/", async (request, response) => {
  const oficinas = await Oficina.findAll();
  response.json(oficinas);
});

oficinasRouter.get("/:id", async (request, response, next) => {
  try {
    const oficina = await Oficina.findByPk(request.params.id);
    if (oficina) {
      response.json(oficina);
    } else {
      response.status(404).json({ error: "Oficina not found" });
    }
  } catch (error) {
    next(error);
  }
});

oficinasRouter.put("/:id", async (request, response, next) => {
  try {
    const { idOficina, nombre, cuidad, direccion, telefono, estado } =
      request.body;

    const oficinamodel = {
      idOficina: idOficina,
      nombre: nombre,
      cuidad: cuidad,
      direccion: direccion,
      telefono: telefono,
      estado: estado,
    };

    const updatedOficina = await Oficina.update(oficinamodel, {
      where: { idOficina: request.params.id },
    });
    if (!updatedOficina) {
      return response.status(404).json({ error: "Oficina not found" });
    }
    response.json(oficinamodel);
  } catch (error) {
    next(error);
  }
});

oficinasRouter.delete("/:id", async (request, response, next) => {
  try {
    await Oficina.destroy({
      where: { idOficina: request.params.id },
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = oficinasRouter;
