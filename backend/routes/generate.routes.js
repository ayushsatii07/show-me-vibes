const { Router } = require("express");
const { generate } = require("../controllers/generate.controller");
const validate = require("../middleware/validate");

const router = Router();

// Health check
router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Generate a random recommendation
router.post("/generate", validate, generate);

module.exports = router;
