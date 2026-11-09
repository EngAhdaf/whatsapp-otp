
import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Diwaniya WhatsApp Service is Running");
});

app.get("/health", (req, res) => {
    res.json({
        status: "online",
        service: "Diwaniya WhatsApp"
    });
});

app.get("/redis-health", async (req, res) => {
    try {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;

        if (!url || !token) {
            return res.status(500).json({
                status: "error",
                message: "Redis settings are missing"
            });
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(["PING"])
        });

        const result = await response.json();

        if (!response.ok || result.result !== "PONG") {
            return res.status(502).json({
                status: "error",
                message: "Redis connection failed"
            });
        }

        res.json({
            status: "connected",
            redis: "PONG"
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Redis connection failed"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
