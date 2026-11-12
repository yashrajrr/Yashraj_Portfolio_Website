"use strict";
var blob = require("@vercel/blob");
var auth = require("../lib/auth");
var CONTENT_PATH = "portfolio/content.json";

module.exports = async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    if (request.method === "GET") {
        try {
            var listed = await blob.list({ prefix: CONTENT_PATH, limit: 1 });
            if (!listed.blobs.length) return response.status(200).json({ content: null });
            var result = await fetch(listed.blobs[0].url, { cache: "no-store" });
            if (!result.ok) throw new Error("Published content could not be read.");
            return response.status(200).json(await result.json());
        } catch (error) { return response.status(503).json({ error: error.message || "Vercel Blob is unavailable. Connect a Blob store to this project." }); }
    }
    if (request.method !== "PUT") { response.setHeader("Allow", "GET, PUT"); return response.status(405).json({ error: "Method not allowed." }); }
    if (!auth.sameOrigin(request)) return response.status(403).json({ error: "Request origin is not allowed." });
    if (!auth.getSession(request)) return auth.unauthorized(response);
    try {
        var body = await auth.readBody(request);
        if (!body.content || typeof body.content !== "object" || !Number.isInteger(body.schemaVersion)) return response.status(400).json({ error: "A valid content object and schema version are required." });
        await blob.put(CONTENT_PATH, JSON.stringify({ content: body.content, schemaVersion: body.schemaVersion, updatedAt: new Date().toISOString() }), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json; charset=utf-8", cacheControlMaxAge: 0 });
        return response.status(200).json({ success: true });
    } catch (error) { return response.status(503).json({ error: error.message || "Vercel Blob could not save the portfolio." }); }
};
