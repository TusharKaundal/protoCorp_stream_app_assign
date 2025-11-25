import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());

const MEDIA_SERVER = process.env.MEDIA_SERVER;
const PORT = process.env.PORT || 3000;

// List of camera streams
const streams = [
  { name: "cam1", path: "/cam1/index.m3u8" },
  { name: "cam2", path: "/cam2/index.m3u8" },
  { name: "cam3", path: "/cam3/index.m3u8" },
  { name: "cam4", path: "/cam4/index.m3u8" },
  { name: "cam5", path: "/cam5/index.m3u8" },
  { name: "cam6", path: "/cam6/index.m3u8" },
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

// Proxy route for individual HLS streams
app.get("/stream/:cam/:file", async (req, res) => {
  const cam = req.params.cam;
  const file = req.params.file;
  const streamExists = streams.find((s) => s.path.includes(cam));

  if (!streamExists) return res.status(404).send("Camera not found");

  try {
    const response = await axios.get(`${MEDIA_SERVER}/${cam}/${file}`, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    response.data.pipe(res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch stream");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
