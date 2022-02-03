const express = require("express");
const cors = require("cors");
const movies = require("./data/movies.json");
const users = require("./data/users.json");

// create and config server
const server = express();
server.use(cors());
server.use(express.json());

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

//servidor de estáticos
const staticServerPath = "./web/public";
server.use(express.static(staticServerPath));
const staticServerPathImg = "./web/src/public-movies-images/";
server.use(express.static(staticServerPathImg));

//escribimos los endpoints
server.get("/movies", (req, res) => {
  const response = {
    success: true,
    movies: movies,
  };
  res.json(response);
});

server.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //const userId =  users.map((user) => user.id);

  if (
    users.find((user) => user.email === email && user.password === password)
  ) {
    console.log("Inicio de sesión correcto");
    //console.log(userId);
    res.json({
      success: true,
      userId: email,
    });
  } else {
    res.status(404);
    res.json({
      success: false,
      errorMessage: "Usuaria/o no encontrada/o",
    });
  }
});
