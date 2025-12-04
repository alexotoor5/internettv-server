const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// -------------------------------
// لیست کامل کانال‌ها
// -------------------------------
const channels = {
    // داخلی (psrv)
    "varzesh": "https://edge1.psrv.tv/live/varzesh/playlist.m3u8",
    "nasim": "https://edge1.psrv.tv/live/nasim/playlist.m3u8",
    "mostanad": "https://edge1.psrv.tv/live/mostanad/playlist.m3u8",
    "amozesh": "https://edge1.psrv.tv/live/amozesh/playlist.m3u8",
    "ofogh": "https://edge1.psrv.tv/live/ofogh/playlist.m3u8",
    "tehran": "https://edge1.psrv.tv/live/tehran/playlist.m3u8",
    "ifilm": "https://edge1.psrv.tv/live/ifilm/playlist.m3u8",
    "tamasha": "https://edge1.psrv.tv/live/tamasha/playlist.m3u8",

    // خارجی قدیمی
    "dw": "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
    "redbull": "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    "euronews": "https://euronews-euronews-world-1-nl.samsung.wurl.tv/playlist.m3u8",

    // کانال‌های جدید (درخواستی)
    "123tv": "https://123tv-mx1.flex-cdn.net/index.m3u8",
    "nlpo": "https://d3472rjicrodic.cloudfront.net/nlpo/clr-nlpo/709d5260/index.m3u8"
};

// -------------------------------
// دریافت لیست کانال‌ها
// -------------------------------
app.get("/api/channels", (req, res) => {
    res.json({
        status: "ok",
        list: Object.keys(channels)
    });
});

// -------------------------------
// پخش HLS با Rewrite لینک‌ها (نسخه حرفه‌ای)
// -------------------------------
app.get("/api/watch/:id", async (req, res) => {
    const id = req.params.id;

    if (!channels[id]) {
        return res.status(404).json({ error: "Channel not found" });
    }

    const mainUrl = channels[id];
    const baseUrl = mainUrl.substring(0, mainUrl.lastIndexOf("/") + 1);

    try {
        const { data } = await axios.get(mainUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "*/*"
            }
        });

        let text = data.toString();

        // اصلاح لینک‌های نسبی در M3U8
        text = text.replace(/URI="([^"]+)"/g, (match, url) => {
            if (url.startsWith("http")) return match;
            return `URI="${baseUrl}${url}"`;
        });

        text = text.replace(/^(?!#)(.*\.m3u8.*)$/gm, (line) => {
            if (line.startsWith("http")) return line;
            return baseUrl + line;
        });

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(text);

    } catch (err) {
        res.status(500).json({ error: "Rewrite failed", detail: err.message });
    }
});

// -------------------------------
app.get("/", (req, res) => {
    res.send("InternetTV Proxy Server is running OK ✔");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server running on port " + port);
});
