"use strict";

function isServerSecret(key) {
    if (/^sb_secret_|service[\s_-]*role/i.test(key)) return true;
    var parts = key.split(".");
    if (parts.length !== 3 || typeof Buffer === "undefined") return false;
    try {
        var encoded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        while (encoded.length % 4) encoded += "=";
        var payload = Buffer.from(encoded, "base64").toString("utf8");
        return /"role"\s*:\s*"service_role"/i.test(payload);
    } catch (error) { return false; }
}

// This endpoint intentionally returns only the browser-safe Supabase values.
// Never add a service-role key or another server-side environment variable here.
module.exports = function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    if (request.method && request.method !== "GET") {
        response.setHeader("Allow", "GET");
        response.status(405).json({ error: "Method not allowed" });
        return;
    }

    var url = (process.env.SUPABASE_URL || "").trim();
    var key = (process.env.SUPABASE_ANON_KEY || "").trim();
    if (isServerSecret(key)) {
        response.status(503).json({ error: "The configured Supabase key is not safe for browser use." });
        return;
    }
    response.status(200).json({
        SUPABASE_URL: url,
        SUPABASE_ANON_KEY: key
    });
};
