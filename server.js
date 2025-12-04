const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// ------------------------------------------------
// لیست کانال‌ها (قابل افزایش)
// ------------------------------------------------
const channels = {
    "varzesh": "https://edge1.psrv.tv/live/varzesh/playlist.m3u8",
    "nasim": "https://edge1.psrv.tv/live/nasim/playlist.m3u8",
    "mostanad": "https://edge1.psrv.tv/live/mostanad/playlist.m3u8",
    "amozesh": "https://edge1.psrv.tv/live/amozesh/playlist.m3u8",
    "ofogh": "https://edge1.psrv.tv/live/ofogh/playlist.m3u8",
    "tehran": "https://edge1.psrv.tv/live/tehran/playlist.m3u8",
    "ifilm": "https://edge1.psrv.tv/live/ifilm/playlist.m3u8",
    "tamasha": "https://edge1.psrv.tv/live/tamasha/playlist.m3u8",

    // ParsianHD sample:
    "khabar": "https://live2.parsianhd.ir/hls/khabar.m3u8",

    // خارجی
    "nlpo": "https://d3472rjicrodic.cloudfront.net/nlpo/clr-nlpo/709d5260/index.m3u8",
    "123tv": "https://123tv-mx1.flex-cdn.net/index.m3u8",
    "dw": "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8"
};

// ------------------------------------------------
// Headerهای مخصوص psrv / parsianhd (شبیه tv.garden)
// ------------------------------------------------
const proxyHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "*/*",
    "Origin": "https://tv.garden",
    "Referer": "https://tv.garden/",
    "Connection": "keep-alive"
};

// ------------------------------------------------
// پخش HLS با فیلتر کیفیت + بازنویسی لینک‌ها + Header مخصوص
// ------------------------------------------------
app.get("/api/watch/:id", async (req, res) => {
    const id = req.params.id;

    if (!channels[id]) {
        return res.status(404).json({ error: "Channel not found" });
    }

    const mainUrl = channels[id];
    const baseUrl = mainUrl.substring(0, mainUrl.lastIndexOf("/") + 1);

    try {
        // دریافت Playlist اصلی
        const { data } = await axios.get(mainUrl, {
            headers: proxyHeaders
        });

        let text = data.toString();

        // --------------------------------------------
        // حذف کیفیت‌های ناسازگار اندروید 7
        // --------------------------------------------
        text = text
            .split("\n")
            .filter(line => {
                const badCodec = /(avc1\.64001f|avc1\.4d401f|hev1|hvc1)/i;
                const highRes = /(720|1080|1440|2160)/;

                if (badCodec.test(line)) return false;
                if (highRes.test(line)) return false;

                return true;
            })
            .join("\n");

        // --------------------------------------------
        // بازنویسی لینک‌های نسبی → absolute URL
        // --------------------------------------------
        text = text.replace(/URI="([^"]+)"/g, (m, p) => {
            if (p.startsWith("http")) return m;
            return `URI="${baseUrl}${p}"`;
        });

        text = text.replace(/^(?!#)(.*\.m3u8.*)$/gm, line => {
            if (line.startsWith("http")) return line;
            return baseUrl + line;
        });

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(text);

    } catch (err) {
        res.status(500).json({
            error: "Rewrite/Proxy error",
            detail: err.message
        });
    }
});

// ------------------------------------------------
app.get("/", (req, res) => {
    res.send("InternetTV Premium Proxy Server ✔ Running");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Premium Proxy Server running on port " + port);
});
