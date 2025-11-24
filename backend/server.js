import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const MEDIA_SERVER = process.env.MEDIA_SERVER;
const PORT = process.env.PORT || 3000;

const streams = [
  { name: "cam 1", path: "/cam1/index.m3u8" },
  { name: "cam 2", path: "/cam2/index.m3u8" },
  { name: "cam 3", path: "/cam3/index.m3u8" },
  { name: "cam 4", path: "/cam4/index.m3u8" },
  { name: "cam 5", path: "/cam5/index.m3u8" },
  { name: "cam 6", path: "/cam6/index.m3u8" },
];

// Endpoint to get all stream URLs
app.get("/api/streams", (req, res) => {
  const data = streams.map((s) => ({
    name: s.name,
    url: `${req.protocol}://${req.get("host")}/stream${s.path}`,
    status: "live",
  }));
  res.json(data);
});

// redirect route for individual HLS streams
app.get("/stream/:cam/index.m3u8", (req, res) => {
  const cam = req.params.cam;
  const targetUrl = `${MEDIA_SERVER}/${cam}/index.m3u8`;
  res.redirect(targetUrl);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
