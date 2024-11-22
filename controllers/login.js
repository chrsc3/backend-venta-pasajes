const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const { sequelize } = require("../utils/db");

const { SECRET } = require("../utils/config");
const { Usuarios } = require("../models");
const { Rol } = require("../models");
const { Rol_Permiso } = require("../models");
const { Permiso } = require("../models");

router.post("/", async (request, response) => {
  const body = request.body;

  const user = await Usuarios.findOne({
    where: {
      user: body.user,
    },
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT GROUP_CONCAT(p.nombre) 
            FROM roles_has_permisos rp
            JOIN permisos p ON rp.Permisos_idPermiso = p.idPermiso
            WHERE rp.Roles_idRol = Usuarios.Roles_idRol
          )`),
          "permisos", // Alias para el resultado de los permisos
        ],
      ],
    },
  });
  console.log(user.permisos);

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(body.password, user.password);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: user.user,
    id: user.id,
  };

  const token = jwt.sign(userForToken, SECRET);

  response.status(200).send({
    token,
    user: user.user,
    name: user.nombre,
    idUsuario: user.idUsuario,
    permisos: user.dataValues.permisos.split(","),
  });
});

module.exports = router;
