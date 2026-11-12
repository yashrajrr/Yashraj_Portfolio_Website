"use strict";

var crypto = require("node:crypto");
var COOKIE = "portfolio_admin_session";
var SESSION_SECONDS = 60 * 60 * 12;

function unauthorized(response) { response.status(401).json({ error: "Administrator sign-in is required." }); }
function secureCookie(request) { return process.env.VERCEL === "1" || !!(request.headers && request.headers["x-forwarded-proto"] === "https"); }
function cookieValue(request) {
    var header = request.headers && request.headers.cookie || "";
    var entry = header.split(";").map(function (part) { return part.trim(); }).find(function (part) { return part.indexOf(COOKIE + "=") === 0; });
    return entry ? decodeURIComponent(entry.slice(COOKIE.length + 1)) : "";
}
function sign(value) { return crypto.createHmac("sha256", process.env.SESSION_SECRET).update(value).digest("base64url"); }
function createSession(email) {
    var payload = Buffer.from(JSON.stringify({ email: email, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString("base64url");
    return payload + "." + sign(payload);
}
function getSession(request) {
    var secret = (process.env.SESSION_SECRET || "").trim();
    if (secret.length < 32) return null;
    var value = cookieValue(request).split(".");
    if (value.length !== 2) return null;
    var expected = Buffer.from(sign(value[0]));
    var actual = Buffer.from(value[1]);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    try {
        var session = JSON.parse(Buffer.from(value[0], "base64url").toString("utf8"));
        if (!session.email || session.email !== (process.env.ADMIN_EMAIL || "").trim().toLowerCase() || session.exp < Math.floor(Date.now() / 1000)) return null;
        return session;
    } catch (error) { return null; }
}
function setSessionCookie(request, response, value, maxAge) {
    var flags = [COOKIE + "=" + encodeURIComponent(value), "Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=" + maxAge];
    if (secureCookie(request)) flags.push("Secure");
    response.setHeader("Set-Cookie", flags.join("; "));
}
function sameOrigin(request) {
    var origin = request.headers && request.headers.origin;
    if (!origin) return false;
    try {
        var url = new URL(origin);
        var host = request.headers.host;
        return url.host === host && (url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1");
    } catch (error) { return false; }
}
function readBody(request) {
    if (request.body && typeof request.body === "object") return Promise.resolve(request.body);
    return new Promise(function (resolve, reject) {
        var raw = "";
        request.on("data", function (chunk) { raw += chunk; if (raw.length > 5 * 1024 * 1024) reject(new Error("Request body is too large.")); });
        request.on("end", function () { try { resolve(JSON.parse(raw || "{}")); } catch (error) { reject(new Error("Request body must be valid JSON.")); } });
        request.on("error", reject);
    });
}
module.exports = { SESSION_SECONDS: SESSION_SECONDS, createSession: createSession, getSession: getSession, setSessionCookie: setSessionCookie, sameOrigin: sameOrigin, readBody: readBody, unauthorized: unauthorized };
