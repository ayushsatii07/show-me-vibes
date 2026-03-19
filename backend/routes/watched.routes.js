const { Router } = require("express");
const { addWatched, getWatched, deleteWatched, updateWatched } = require("../controllers/watched.controller");

const router = Router();

router.post("/watched", addWatched);
router.get("/watched", getWatched);
router.delete("/watched/:id", deleteWatched);
router.put("/watched/:id", updateWatched);

module.exports = router;
