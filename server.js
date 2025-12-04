const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// -------------------------------
// لینک‌های سالم و تست‌شده
// -------------------------------
const channels = {
    "varzesh": "https://edge1.psrv.tv/live/varzesh/playlist.m3u8",
    "nasim": "https://edge1.psrv.tv/live/nasim/playlist.m3u8",
    "mostanad": "https://edge1.psrv.tv/live/mostanad/playlist.m3u8",
    "amozesh": "https://edge1.psrv.tv/live/amozesh/playlist.m3u8",
    "ofogh": "https://edge1.psrv.tv/live/ofogh/playlist.m3u8",
    "tehran": "https://edge1.psrv.tv/live/tehran/playlist.m3u8",
    "ifilm": "https://edge1.psrv.tv/live/ifilm/playlist.m3u8",
    "tamasha": "https://edge1.psrv.tv/live/tamasha/playlist.m3u8",

    // خارجی
    "dw": "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
    "redbull": "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    "euronews": "https://euronews-euronews-world-1-nl.samsung.wurl.tv/playlist.m3u8"
};


// -------------------------------
// لیست کانال‌ها
// -------------------------------
app.get("/api/channels", (req, res) => {
    res.json({
        status: "ok",
        list: Object.keys(channels)
    });
});


// -------------------------------
// پروکسی پخش HLS — نسخه سالم
// -------------------------------
app.get("/api/watch/:id", async (req, res) => {
    const id = req.params.id;

    if (!channels[id]) {
        return res.status(404).json({ error: "Channel not found" });
    }

    try {
        const url = channels[id];

        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "*/*",
                "Connection": "keep-alive"
            }
        });

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        response.data.pipe(res);

    } catch (err) {
        res.status(500).json({ error: "Stream error", detail: err.message });
    }
});


app.get("/", (req, res) => {
    res.send("InternetTV Proxy Server is running OK ✔");
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server running on port " + port);
});
