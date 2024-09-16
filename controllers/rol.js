const rolesRouter = require("express").Router();
require("express-async-errors");
const { Usuarios, Rol, Permiso, Rol_Permiso } = require("../models");

rolesRouter.post("/", async (request, response, next) => {
  try {
    const { nombre } = request.body;

    // Check if username is unique
    const existingRol = await Rol.findOne({
      where: { nombre: nombre },
    });
    if (existingRol) {
      return response.status(400).json({ error: "Rol already exists" });
    }
    const rolmodel = Rol.build({
      nombre: nombre,
    });

    const savedRol = await rolmodel.save();

    const returnRol = await Rol.findByPk(savedRol.idRol, {
      include: [
        {
          model: Rol_Permiso,
          include: [Permiso],
        },
      ],
    });

    response.status(201).json(returnRol);
  } catch (error) {
    next(error);
  }
});
rolesRouter.get("/", async (request, response) => {
  const roles = await Rol.findAll({
    include: [
      {
        model: Rol_Permiso,
        include: [Permiso],
      },
    ],
  });
  response.json(roles);
});
rolesRouter.get("/:id", async (request, response, next) => {
  try {
    const rol = await Rol.findByPk(request.params.id, {
      include: [
        {
          model: Rol_Permiso,
          include: [Permiso],
        },
      ],
    });
    if (rol) {
      response.json(rol);
    } else {
      response.status(404).json({ error: "Rol not found" });
    }
  } catch (error) {
    next(error);
  }
});

rolesRouter.put("/:id", async (request, response, next) => {
  try {
    const { idRol, nombre, roles_has_permisos } = request.body;

    const rolmodel = {
      idRol: idRol,
      nombre: nombre,
    };

    const updatedRol = await Rol.update(rolmodel, {
      where: { idRol: request.params.id },
    });

    if (!updatedRol) {
      return response.status(404).json({ error: "Rol not found" });
    }
    const updatedRolPermiso = await Rol_Permiso.destroy({
      where: { Roles_idRol: request.params.id },
    });
    if (roles_has_permisos) {
      roles_has_permisos.forEach(async (permiso) => {
        await Rol_Permiso.create({
          Roles_idRol: request.params.id,
          Permisos_idPermiso: permiso,
        });
      });
    }
    const returnRol = await Rol.findByPk(rolmodel.idRol, {
      include: [
        {
          model: Rol_Permiso,
          include: [Permiso],
        },
      ],
    });
    response.json(returnRol);
  } catch (error) {
    next(error);
  }
});

rolesRouter.delete("/:id", async (request, response, next) => {
  try {
    const users = await Usuarios.findAll({
      where: { Roles_idRol: request.params.id },
    });
    const rol_permiso = await Rol_Permiso.findAll({
      where: { Roles_idRol: request.params.id },
    });
    if (users.length > 0) {
      return response.status(400).json({
        error: "Cannot delete role with associated users",
      });
    }
    if (rol_permiso.length > 0) {
      return response.status(400).json({
        error: "Cannot delete role with associated permissions",
      });
    }
    await Rol.destroy({
      where: { idRol: request.params.id },
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = rolesRouter;
