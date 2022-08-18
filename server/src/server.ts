import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import dotenv from 'dotenv';
import cors from "cors";
// routes
import authRoutes from "./routes/auth";
import loginRoutes from './routes/login';

const app = express();
const origin = "http://localhost:3000";

app.use(
  cors({
    origin,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

dotenv.config();

app.get("/", (_, res) => res.send("running"));
app.use("/api/auth", authRoutes);
app.use("/api/auth", loginRoutes);

let port = 4000;

app.listen(port, async () => {
  console.log(`Server Running at http://localhost:${port}`);

  AppDataSource.initialize()
    .then(async () => {
      console.log("database inititalized...");
    })
    .catch((error) => console.log(error));
});
