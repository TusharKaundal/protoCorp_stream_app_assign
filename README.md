# HLS Stream Synchronization Dashboard

A real-time multi-stream video monitoring dashboard that synchronizes 5-6 HLS video streams for simultaneous playback. This application demonstrates RTSP to HLS conversion and advanced stream synchronization techniques using React and modern web technologies.

## 🎯 Features

- **Multi-Stream Playback**: Display and monitor 5-6 HLS video streams simultaneously
- **Stream Synchronization**: Sync all video streams to ensure frame-perfect alignment
- **Low-Latency HLS**: Optimized for minimal delay using HLS.js with low-latency mode
- **Responsive Design**: Modern, responsive UI built with React and Tailwind CSS

## 🔗 Live Workable Link

- **Live Application**: [https://proto-corp-stream-app-assign.vercel.app/](https://proto-corp-stream-app-assign.vercel.app/)

## 🏗️ Architecture Overview

### System Components

1. **Backend Server** (Node.js/Express)

   - API endpoint for stream metadata
   - Proxy/redirect service for HLS streams
   - Integration with MediaMTX streaming server

2. **MediaMTX Server**

   - RTSP to HLS conversion engine
   - Manages 6 distinct camera streams
   - Low-latency HLS configuration

3. **Frontend Dashboard** (React + Vite)
   - HLS video players using HLS.js
   - Custom synchronization hook
   - Real-time stream statistics

## 📚 Technical Documentation

### RTSP → HLS Conversion Process

The application uses **MediaMTX** (formerly rtsp-simple-server) to convert RTSP streams to HLS format. Here's how the conversion process works:

#### Tools Used

1. **MediaMTX** (`mediamtx.exe`)

   - Open-source streaming server
   - Handles RTSP input and HLS output
   - Supports low-latency streaming configurations
   - Automatically segments video into HLS format

2. **Configuration** (`mediamtx.yml`)
   ```yaml
   hls: yes
   hlsAddress: :8888
   hlsVariant: lowLatency
   hlsSegmentCount: 7
   hlsSegmentDuration: 1s
   hlsDirectory: ./hls
   ```

#### Conversion Workflow

1. **RTSP Input**: MediaMTX receives RTSP streams from external sources (configured in `mediamtx.yml`)

   - Each stream (cam1-cam6) is configured with an RTSP source URL
   - For our case 1 RTSP source is there to make 5-6 distinct we provide same source to different path

2. **HLS Segmentation**: MediaMTX automatically:

   - Receives the RTSP video stream
   - Segments the video into small chunks (1-second segments)
   - Generates HLS manifest files (`.m3u8`) for each stream
   - Creates video segments (`.mp4` or `.ts` files) in the `./hls` directory
   - Maintains a rolling window of segments (7 segments in this configuration)

3. **HLS Output**: The converted streams are available as:

   - Manifest files: `http://localhost:8888/cam1/index.m3u8`
   - Video segments: Automatically referenced in the manifest

4. **Low-Latency Optimization**:
   - `hlsVariant: lowLatency`: Enables low-latency HLS (LL-HLS) mode
   - `hlsSegmentDuration: 1s`: Short segment duration reduces latency
   - `hlsSegmentCount: 7`: Maintains a small buffer window

### Creating 5-6 Distinct HLS Streams

The application creates **6 distinct HLS streams** (cam1 through cam6) using the following approach:

#### Stream Configuration

In `backend/server.js`, 6 stream definitions are configured:

```javascript
const streams = [
  { name: "cam 1", path: "/cam1/index.m3u8" },
  { name: "cam 2", path: "/cam2/index.m3u8" },
  { name: "cam 3", path: "/cam3/index.m3u8" },
  { name: "cam 4", path: "/cam4/index.m3u8" },
  { name: "cam 5", path: "/cam5/index.m3u8" },
  { name: "cam 6", path: "/cam6/index.m3u8" },
];
```

#### MediaMTX Path Configuration

Each stream is configured as a separate path in `mediamtx.yml`:

```yaml
paths:
  cam1:
    source: rtsp://13.60.76.79:8554/live2
  cam2:
    source: rtsp://13.60.76.79:8554/live2
  # ... cam3 through cam6
```

#### How Distinct Streams Are Created

1. **Separate Paths**: Each camera (cam1-cam6) is configured as a unique path in MediaMTX
2. **Individual HLS Outputs**: MediaMTX generates separate HLS manifests and segments for each path
3. **Independent Streams**: Even if using the same RTSP source, each path creates its own HLS stream with:
   - Unique manifest file (`/cam1/index.m3u8`, `/cam2/index.m3u8`, etc.)
   - Separate segment files in the HLS directory
   - Independent buffering and playback state

### React Component Logic and Stream Synchronization

The application implements sophisticated stream synchronization using React hooks and the HTML5 Video API. Here's a detailed breakdown:

#### Component Architecture

```
App.jsx
  └── Dashboard.jsx
      ├── StreamStats.jsx (Statistics display)
      └── HlsVideoPlayer.jsx (Individual video player)
          └── useStreamSync.js (Synchronization logic)
```

#### 1. Dashboard Component (`src/components/Dashboard.jsx`)

**Responsibilities:**

- Fetches stream metadata from the backend API
- Manages the overall application state
- Renders the grid of video players

**Key Logic:**

```javascript
const [streams, setStreams] = useState([]);
const { loadPlayer, syncAll } = useStreamSync({
  totalStreams: streams.length,
  driftTolerance: 0.2,
});

// Fetch streams on mount
useEffect(() => {
  async function loadStreams() {
    const data = await getStreams();
    setStreams(data);
  }
  loadStreams();
}, []);
```

**Features:**

- Displays total streams, active streams
- Provides manual "Sync All" button for re-synchronization
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)

#### 2. HlsVideoPlayer Component (`src/components/HlsVideoPlayer.jsx`)

**Responsibilities:**

- Initializes HLS.js player for each stream
- Loads HLS manifest and manages playback
- Notifies parent
- Handles play/pause based on sync state

**Key Implementation:**

```javascript
// HLS.js initialization
if (Hls.isSupported()) {
  const hls = new Hls({
    lowLatencyMode: true,
    maxBufferLength: 1,
    liveSyncDuration: 1,
  });
  hls.loadSource(stream.url);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    registerVideo && registerVideo(video);
  });

  return () => {
    hls.destroy();
  };
}
```

#### 3. useStreamSync Hook (`src/hooks/useStreamSync.js`)

This is the core synchronization engine. It implements a sophisticated algorithm to ensure all streams play in perfect sync.

**Synchronization Algorithm:**

**Phase 1: Video Registration**

```javascript
const loadPlayer = (video) => {
  if (!video) return;

  // push player
  playersRef.current.push(video);
  if (playersRef.current.length === totalStreams) {
    syncAll();
  }
};
```

**Phase 2: Readiness Detection**
checks if all videos are ready for synchronization:

```javascript
if (playersRef.current.length === totalStreams) {
  syncAll();
}
```

**Phase 3: Master Selection and Synchronization**

```javascript
const syncAll = async () => {
  const players = playersRef.current;
  if (!players.length) return;

  // choose master
  const master = getMaster();
  const targetTime = master.currentTime || 0;

  // pause all to avoid playing while seeking
  players.forEach((video) => {
    video.pause();
  });

  // set currentTime for each
  players.forEach((video) => {
    const dt = Math.abs((video.currentTime || 0) - targetTime);
    if (dt > 0.6) {
      video.currentTime = targetTime;
    }
  });

  // slight delay to ensure seeks applied
  await new Promise((r) => setTimeout(r, 200));

  // start playing all together
  players.map((video) => {
    video.play();
  });
};

const getMaster = () => {
  if (playersRef.current.length === 0) return null;

  let candidate = null;
  let bestLiveEdgeDistance = Infinity;

  playersRef.current.forEach((video) => {
    if (!video || video.readyState < 2) return;

    // get buffered end (live edge for LL-HLS)
    const bufferedEnd =
      video.buffered.length > 0
        ? video.buffered.end(video.buffered.length - 1)
        : 0;

    const currentTime = video.currentTime;
    const distanceFromEdge = Math.abs(bufferedEnd - currentTime);

    if (distanceFromEdge <= driftTolerance) {
      if (distanceFromEdge < bestLiveEdgeDistance) {
        bestLiveEdgeDistance = distanceFromEdge;
        candidate = video;
      }
    }
  });

  return candidate || playersRef.current[0]; // fallback
};
```

**Synchronization Strategy:**

1. **Master Selection**: Chooses the video within the `tolerance` here => `0.2s`
2. **Time Alignment**: Sets all other videos' `currentTime` to match the master
3. **State Preservation**: Maintains play/pause state during sync

## 🚀 Setup and Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MediaMTX** (dowload and unzip on your base and kept it inside backend folder mediamtx.yml)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:

   ```env
   PORT=3000
   MEDIA_SERVER=http://localhost:8888
   ```

4. Start MediaMTX server:

   ```bash
   # Windows
   ./mediamtx.exe

   # Linux/Mac
   ./mediamtx
   ```

   MediaMTX will start on port 8888 and begin converting RTSP streams to HLS.

5. Start the backend server (in a separate terminal):
   ```bash
   npm start
   ```
   The backend API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   Or alternatively:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (or the port shown in terminal)

### Production Build

To create a production build:

```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 📁 Project Structure

```
protoCorp_stream_app_assign/
├── backend/
│   ├── hls/                    # HLS output directory (generated by MediaMTX)
│   │   └── cam1/               # Individual camera HLS files
│   ├── mediamtx.exe           # MediaMTX streaming server
│   ├── mediamtx.yml           # MediaMTX configuration
│   ├── server.js              # Express backend server
│   └── package.json           # Backend dependencies
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── streams.js     # API client for fetching streams
    │   ├── components/
    │   │   ├── Dashboard.jsx  # Main dashboard component
    │   │   ├── HlsVideoPlayer.jsx  # HLS video player component
    │   │   ├── StreamStats.jsx     # Statistics display
    │   │   └── ui/            # Shadcdn UI component library
    │   ├── hooks/
    │   │   └── useStreamSync.js    # Stream synchronization hook
    │   ├── lib/
    │   │   └── utils.js       # Utility functions
    │   ├── App.jsx            # Root component
    │   ├── main.jsx           # Application entry point
    │   └── index.css          # main stylesheet
    ├── package.json           # Frontend dependencies
    └── vite.config.js         # Vite configuration
```

## 🛠️ Technologies Used

### Frontend

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **HLS.js**: HLS video playback library
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### Backend

- **Node.js**: Runtime environment
- **Express**: Web framework
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management
