require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🎬 FlickPick backend running on http://localhost:${PORT}`);
    console.log(`   Health check → GET  http://localhost:${PORT}/api/health`);
    console.log(`   Generate     → POST http://localhost:${PORT}/api/generate\n`);
});
