const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=utf-8"
};

function sendResponse(res, statusCode, contentType, data) {
    res.writeHead(statusCode, { "Content-Type": contentType });
    res.end(data);
}

function isPathInsideRoot(filePath) {
    const relative = path.relative(ROOT_DIR, filePath);
    return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function resolveRequestPath(urlPathname) {
    const decodedPath = decodeURIComponent(urlPathname);
    const cleanPath = decodedPath === "/" ? "/index.html" : decodedPath;
    const safePath = path.normalize(cleanPath).replace(/^([.][.][/\\])+/, "");
    return path.join(ROOT_DIR, safePath);
}

const server = http.createServer((req, res) => {
    if (!req.url) {
        sendResponse(res, 400, "text/plain; charset=utf-8", "Bad Request");
        return;
    }

    const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);
    const filePath = resolveRequestPath(requestUrl.pathname);

    if (!isPathInsideRoot(filePath) && filePath !== path.join(ROOT_DIR, "index.html")) {
        sendResponse(res, 403, "text/plain; charset=utf-8", "Forbidden");
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError || !stats.isFile()) {
            sendResponse(res, 404, "text/plain; charset=utf-8", "Not Found");
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[extension] || "application/octet-stream";

        fs.readFile(filePath, (readError, fileData) => {
            if (readError) {
                sendResponse(res, 500, "text/plain; charset=utf-8", "Internal Server Error");
                return;
            }

            sendResponse(res, 200, contentType, fileData);
        });
    });
});

server.listen(PORT, HOST, () => {
    console.log(`ProjectSTACK server running at http://${HOST}:${PORT}`);
});
