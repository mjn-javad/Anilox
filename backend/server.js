const db = require("./db");
const configs = require("./configs");
const app = require("./app");

async function startServer() {
  try {
    await db.getConnection();
    app.listen(configs.PORT, () => {
      console.log("Server Is Running On Port " + configs.PORT);
    });
  } catch (err) {
    console.log(err);
    db.end();
  }
}

startServer();
