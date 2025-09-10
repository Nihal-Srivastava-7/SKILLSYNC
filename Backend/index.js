const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./routes/userRoute");
const resumeRouter = require("./routes/resumeRoutes");
const aiRouter = require("./routes/aiRoutes");
const jobRouter = require("./routes/jobRoutes");

const app = express();

app.use(
  cors({
    origin: [
    "http://localhost:5173",
    "https://skillsync-job.netlify.app"
  ], 
    credentials: true,
  })
);

// Allow preflight across all routes
app.options("*", cors());



app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/", router);
app.use("/resume", resumeRouter);
app.use("/ai", aiRouter);
app.use("/jobs", jobRouter);

mongoose
  .connect(process.env.MONGO_URI)

  .then(async () => {
    console.log("MongoDB Connected");

   app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    console.error("Ensure MongoDB is running and the MONGO_URI is correct.");
    process.exit(1); // Exit the process if MongoDB connection fails
  });
