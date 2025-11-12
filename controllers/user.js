const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
require("express-async-errors");
const { Usuarios } = require("../models");

usersRouter.post("/", async (request, response, next) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      direccion,
      user,
      password,
      Roles_idRol,
    } = request.body;

    // Check if username and password are provided
    if (!user || !password) {
      return response
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Check if username and password have at least 3 characters
    if (user.length < 3 || password.length < 3) {
      return response.status(400).json({
        error: "Username and password must have at least 3 characters",
      });
    }

    // Check if username is unique
    const existingUser = await Usuarios.findOne({
      where: { user: user },
    });
    if (existingUser) {
      return response.status(400).json({ error: "Username already exists" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const usermodel = Usuarios.build({
      nombre: nombre,
      apellido: apellido,
      telefono: telefono,
      direccion: direccion,
      user: user,
      password: passwordHash,
      estado: "activo",
      Roles_idRol: Roles_idRol,
    });

    const savedUser = await usermodel.save();

    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/", async (request, response) => {
  const users = await Usuarios.findAll();
  response.json(users);
});
usersRouter.get("/:id", async (request, response, next) => {
  try {
    const user = await Usuarios.findByPk(request.params.id);
    if (user) {
      response.json(user);
    } else {
      response.status(404).json({ error: "Usuarios not found" });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:id", async (request, response, next) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      direccion,
      user,
      password,
      estado,
      Roles_idRol,
    } = request.body;

    const usuario = await Usuarios.findByPk(request.params.id);
    if (!usuario) {
      return response.status(404).json({ error: "Usuarios not found" });
    }

    await usuario.update({
      nombre,
      apellido,
      telefono,
      direccion,
      user,
      password,
      estado: estado || "activo",
      Roles_idRol,
    });

    response.json(usuario);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:id", async (request, response, next) => {
  try {
    await Usuarios.destroy({
      where: { idUsuario: request.params.id },
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
