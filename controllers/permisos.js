const permisosRouter = require("express").Router();
require("express-async-errors");
const { Permiso } = require("../models");

permisosRouter.get("/", async (request, response) => {
  const permisos = await Permiso.findAll();
  response.json(permisos);
});

module.exports = permisosRouter;
