import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/task";
import cookieParser from "cookie-parser";
import cors from "cors"; // <-- import cors

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: "*", // frontend URL
    credentials: true,               // if using cookies
  })
);

// health
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// global error handler (simple)
app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
