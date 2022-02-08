const express = require("express");
const cors = require("cors");
const movies = require("./data/movies.json");
const users = require("./data/users.json");
const Database = require("better-sqlite3");

// create and config server
const server = express();
server.use(cors());
server.use(express.json());
server.set("view engine", "ejs");

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});
//servidor de estáticos para las imágenes
const staticServerPathImg = "./web/src/public-movies-images/";
server.use(express.static(staticServerPathImg));
const staticServerPathStyles = "./web/src/stylesheets/";
server.use(express.static(staticServerPathStyles));

// Base de datos
const db = new Database("./src/db/database.db", { verbose: console.log });

//escribimos los endpoints
server.get("/movies", (req, res) => {
  let movies = [];
  const query = db.prepare(
    "SELECT * FROM movies WHERE gender= ? ORDER BY title DESC "
  );
  const queryAll = db.prepare("SELECT * FROM movies ORDER BY title DESC ");
  if (req.query.gender === "") {
    movies = queryAll.all();
  } else {
    movies = query.all(req.query.gender);
  }
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

server.get("/movie/:movieId", (req, res) => {
  const urlParams = req.params.movieId;
  const foundMovie = movies.find((movie) => movie.id === urlParams);
  if (!foundMovie.title) {
    foundMovie.title = "";
  }
  // no hace falta else porque si existe, nos devuelve el valor que toca
  console.log(foundMovie);
  res.render("movie", foundMovie);
});

server.post("/sign-up", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const querySelectUser = db.prepare("SELECT * FROM users WHERE email=?");
  const foundUser = querySelectUser.get(email);

  if (foundUser === undefined) {
    const query = db.prepare(
      "INSERT INTO users (email, password) VALUES (?,?)"
    );
    const newUser = query.run(email, password);
    res.json({
      success: true,
      userId: newUser.lastInsertRowid,
    });
  } else {
    res.json({
      error: true,
      errorMessage: "el usuario ya existe",
    });
  }
});


// REVISAR PARA COMPLETAR EJERCICIO 5, 4.6
server.post("/profile", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = req.headers('user-id');

const query =  db.prepare("UPDATE users SET email=?, password=? WHERE userId=?");
const userUpdate = query.run(email,password);

if(userUpdate.changes !== 0) {
  res.json({
    error: false,
    message: "modificado con exito"
  })
} else {
  res.json ({
    error: true, 
    message: "ha ocurrido un error"
  })
}
  
})

//servidor de estáticos
const staticServerPath = "./web/public";
server.use(express.static(staticServerPath));
