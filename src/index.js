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

  const query = db.prepare("SELECT * FROM users WHERE email=? and password=?");
  const userLog = query.get(email, password);

  if (userLog !== undefined) {
    console.log("Inicio de sesión correcto");
    res.json({
      success: true,
      userId: userLog.userId,
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
      success: false,
      errorMessage: "el usuario ya existe",
    });
  }
});

server.post("/user/profile", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const userId = req.headers.userid;

  const query = db.prepare(
    "UPDATE users SET email=?, password=? WHERE userId=?"
  );
  const userUpdate = query.run(email, password, userId);

  if (userUpdate.changes !== 0) {
    res.json({
      success: true,
      message: "modificado con exito",
    });
  } else {
    res.json({
      success: false,
      message: "ha ocurrido un error",
    });
  }
});

server.get("/user/profile", (req, res) => {
  const query = db.prepare("SELECT * FROM users WHERE userId=?");
  const getProf = query.get(req.headers.userid);

  res.json({
    success: true,
    email: getProf.email,
    password: getProf.password,
  });
});

// Anterior query user/movies.
// server.get("/user/movies", (req, res)=> {
//const userId = req.headers.userid;
//  const query = db.prepare("SELECT movieId FROM rel_movies_users WHERE userId = ?");
//  const foundMovies = query.all(userId);
//  console.log(foundMovies);
//    res.json({
//      "success": true,
//      "movies": []
//    }) })

server.get("/user/movies", (req, res) => {
  // preparamos la query para obtener los movieIds
  const movieIdsQuery = db.prepare(
    "SELECT movieId FROM rel_movies_users WHERE userId = ?"
  );
  // obtenemos el id de la usuaria
  const userId = req.headers.userid;
  // ejecutamos la query
  const movieIds = movieIdsQuery.all(userId); // que nos devuelve algo como [{ movieId: 1 }, { movieId: 2 }];

  // obtenemos las interrogaciones separadas por comas
  const moviesIdsQuestions = movieIds.map((id) => "?").join(", "); // que nos devuelve '?, ?'
  // preparamos la segunda query para obtener todos los datos de las películas
  const moviesQuery = db.prepare(
    `SELECT * FROM movies WHERE id IN (${moviesIdsQuestions})`
  );

  // convertimos el array de objetos de id anterior a un array de números
  const moviesIdsNumbers = movieIds.map((movie) => movie.movieId); // que nos devuelve [1.0, 2.0]
  // ejecutamos segunda la query
  const movies = moviesQuery.all(moviesIdsNumbers);

  // respondemos a la petición con
  res.json({
    success: true,
    movies: movies,
  });
});

//servidor de estáticos
const staticServerPath = "./web/public";
server.use(express.static(staticServerPath));
