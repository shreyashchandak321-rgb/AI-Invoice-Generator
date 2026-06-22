const { app, connectDB } = require("../backend/server");

let isConnected = false;

module.exports = async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
