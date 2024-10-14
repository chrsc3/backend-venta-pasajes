const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = require("express").Router();

const { SECRET } = require("../utils/config");
const User = require("../models/usuarios");

router.post("/", async (request, response) => {
  const body = request.body;

  const user = await User.findOne({
    where: {
      user: body.user,
    },
  });

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

  response
    .status(200)
    .send({
      token,
      user: user.user,
      name: user.nombre,
      idUsuario: user.idUsuario,
    });
});

module.exports = router;
