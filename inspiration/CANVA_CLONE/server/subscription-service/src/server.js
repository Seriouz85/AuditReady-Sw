require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const subscriptionRoutes = require("./routes/subscription-routes");

const app = express();
const PORT = process.env.PORT || 5003;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB Error", error));

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/subscription", subscriptionRoutes);

async function startServer() {
  try {
    app.listen(PORT, () =>
      console.log(`SUBSCRIPTION Service running on port ${PORT}`)
    );
  } catch (error) {
    console.error("Failed to connected to server", error);
    process.exit(1);
  }
}

startServer();
