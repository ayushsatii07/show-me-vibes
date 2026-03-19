const { Router } = require("express");
const { getProviders } = require("../controllers/providers.controller");

const router = Router();

// GET /api/providers/:type/:id
// type: "movie" | "tv"
router.get("/providers/:type/:id", getProviders);

module.exports = router;
