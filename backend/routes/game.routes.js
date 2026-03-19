const { Router } = require("express");
const { getGamePair, getNextMovie } = require("../controllers/game.controller");

const router = Router();

router.get("/game/pair", getGamePair);
router.get("/game/next", getNextMovie);

module.exports = router;
