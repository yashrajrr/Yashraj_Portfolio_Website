"use strict";

var fs = require("node:fs");
var http = require("node:http");
var path = require("node:path");
var root = __dirname;
var output = path.join(root, "dist");
var port = Number(process.env.PORT || 3001);
var mimeTypes = {
    ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".ico": "image/x-icon",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
    ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".pdf": "application/pdf", ".woff2": "font/woff2"
};
var apiHandlers = {
    "/api/auth/login": require("./api/auth/login"),
    "/api/auth/logout": require("./api/auth/logout"),
    "/api/auth/session": require("./api/auth/session"),
    "/api/content": require("./api/content")
};

function loadLocalEnvironment() {
    var file = path.join(root, ".env.local");
    if (!fs.existsSync(file)) return;
    fs.readFileSync(file, "utf8").split(/\r?\n/).forEach(function (line) {
        var entry = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!entry || Object.prototype.hasOwnProperty.call(process.env, entry[1])) return;
        var value = entry[2];
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
        process.env[entry[1]] = value;
    });
}

function serveFile(request, response, pathname) {
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, { Allow: "GET, HEAD" });
        response.end("Method not allowed");
        return;
    }
    var relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    if (relative === "admin") relative = "admin/index.html";
    else if (/\.html$/i.test(relative) && relative !== "admin.html" && relative !== "index.html") relative = relative.slice(0, -5) + "/index.html";
    var file = path.resolve(output, relative);
    if (file !== output && !file.startsWith(output + path.sep)) {
        response.writeHead(403); response.end("Forbidden"); return;
    }
    fs.stat(file, function (error, stat) {
        if (error || !stat.isFile()) { response.writeHead(404); response.end("Not found"); return; }
        response.writeHead(200, { "Content-Type": mimeTypes[path.extname(file).toLowerCase()] || "application/octet-stream", "Content-Length": stat.size });
        if (request.method === "HEAD") response.end(); else fs.createReadStream(file).pipe(response);
    });
}

loadLocalEnvironment();
http.createServer(function (request, response) {
    var pathname;
    try { pathname = new URL(request.url, "http://localhost").pathname; }
    catch (error) { response.writeHead(400); response.end("Invalid URL"); return; }
    var handler = apiHandlers[pathname];
    if (!handler) { serveFile(request, response, pathname); return; }
    response.status = function (statusCode) { response.statusCode = statusCode; return response; };
    response.json = function (value) {
        if (response.writableEnded) return response;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(value));
        return response;
    };
    Promise.resolve(handler(request, response)).catch(function (error) {
        if (response.writableEnded) return;
        response.statusCode = 500;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify({ error: "Local API error." }));
        process.stderr.write("Local API error at " + pathname + ": " + (error && error.message || "unknown error") + "\n");
    });
}).listen(port, "127.0.0.1", function () {
    process.stdout.write("Portfolio running at http://127.0.0.1:" + port + "\n");
});
