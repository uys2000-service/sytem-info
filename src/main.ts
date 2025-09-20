import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { Server } from "socket.io";
import {
  getCpuInfo,
  getDiskInfo,
  getDockerUsage,
  getOSInfo,
  getRamInfo,
  getUpTimeInfo,
} from "./services/resources";
import "dotenv/config";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get("/os", async (req, res) => {
  const data = await getOSInfo();
  res.json(data);
});

app.get("/uptime", async (req, res) => {
  const data = await getUpTimeInfo();
  res.json(data);
});

app.get("/ram", async (req, res) => {
  const data = await getRamInfo();
  res.json(data);
});

app.get("/cpu", async (req, res) => {
  const data = await getCpuInfo();
  res.json(data);
});

app.post("/disk", async (req, res) => {
  if (!Array.isArray(req.body?.paths)) return res.json([]);
  const paths = req.body.paths as Array<string>;
  const data = paths.map((path) => getDiskInfo(path));
  res.json(await Promise.all(data));
});

app.get("/docker", async (req, res) => {
  const data = await getDockerUsage();
  res.json(data);
});

server.listen(process.env.PORT, () => {
  console.log("http://localhost:" + process.env.PORT);
});
