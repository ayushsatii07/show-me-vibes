const { Router } = require("express");
const { getExploreData } = require("../controllers/explore.controller");

const router = Router();

router.get("/explore", getExploreData);

module.exports = router;
