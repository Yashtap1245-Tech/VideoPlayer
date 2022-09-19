const ffmpeg = require("ffmpeg");
const express = require("express");
const fs = require("fs");
const path = require("path");
const thumbsupply = require("thumbsupply");
// add after require() statements
const videos = [
  {
    id: 0,
    poster: "/video/0/poster",
    duration: "3 mins",
    name: "Sample 1",
  },
  {
    id: 1,
    poster: "/video/1/poster",
    duration: "4 mins",
    name: "Sample 2",
  },
  {
    id: 2,
    poster: "/video/2/poster",
    duration: "2 mins",
    name: "Sample 3",
  },
  {
    id: 3,
    poster: "/video/3/poster",
    duration: "200 mins",
    name: "Sample 4",
  },
];
const cors = require("cors");

const app = express();
app.get("/video", (req, res) => {
  res.sendFile("assets/0.mp4", { root: __dirname });
});
// add after existing app.get('/video', ...) route

app.use(cors());
app.get("/videos", (req, res) => res.json(videos));
// add after app.get('/videos', ...) route

app.get("/video/:id/data", (req, res) => {
  const id = parseInt(req.params.id, 10);
  res.json(videos[id]);
});
// add after app.get('/video/:id/data', ...) route

app.get("/video/:id", (req, res) => {
  const path = `./assets/${req.params.id}.mp4`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});
// add after app.get('/video/:id', ...) route

app.get("/video/:id/poster", (req, res) => {
  thumbsupply
    .generateThumbnail(`assets/${req.params.id}.mp4`)
    .then((thumb) => res.sendFile(thumb));
});
app.listen(4000, () => {
  console.log("Listening on port 4000!");
});

// try {
//   var process = new ffmpeg("sample.mp4");
//   process.then(
//     function (video) {
//       console.log("The video is ready to be processed");
//       var watermarkPath = "f.png",
//         newFilepath = "./new.mp4",
//         settings = {
//           position: "C", // Position: NE NC NW SE SC SW C CE CW
//           margin_nord: 5, // Margin nord
//           margin_sud: 5, // Margin sud
//           margin_east: 5, // Margin east
//           margin_west: 5, // Margin west
//         };
//       var callback = function (error, files) {
//         if (error) {
//           console.log("ERROR: ", error);
//         } else {
//           console.log("TERMINOU", files);
//         }
//       };
//       //add watermark
//       video.fnAddWatermark(watermarkPath, newFilepath, settings, callback);
//    },
//     function (err) {
//       console.log("Error: " + err);
//     }
//   );
// } catch (e) {
//   console.log(e.code);
//   console.log(e.msg);
// }
