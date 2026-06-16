const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;
const SAVES_DIR = path.join(ROOT_DIR, "saves");

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

function sendJson(res, statusCode, payload) {
    sendResponse(res, statusCode, "application/json; charset=utf-8", JSON.stringify(payload));
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

function sanitizeSaveName(rawName) {
    const trimmed = String(rawName || "").trim();

    if (!trimmed) {
        return "";
    }

    return trimmed
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .replace(/\s+/g, " ")
        .slice(0, 120)
        .trim();
}

function getSaveFilePath(rawName) {
    const safeName = sanitizeSaveName(rawName);

    if (!safeName) {
        return null;
    }

    return {
        safeName,
        fileName: `${safeName}.json`,
        filePath: path.join(SAVES_DIR, `${safeName}.json`)
    };
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;

            if (body.length > 5 * 1024 * 1024) {
                reject(new Error("Request body too large."));
                req.destroy();
            }
        });

        req.on("end", () => {
            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error("Invalid JSON payload."));
            }
        });

        req.on("error", error => {
            reject(error);
        });
    });
}

function handleSaveApi(req, res, requestUrl) {
    const saveName = decodeURIComponent(requestUrl.pathname.slice("/api/saves/".length));
    const resolvedSave = getSaveFilePath(saveName);

    if (!resolvedSave) {
        sendJson(res, 400, { error: "A valid game name is required." });
        return true;
    }

    if (req.method === "GET") {
        fs.readFile(resolvedSave.filePath, "utf8", (readError, fileData) => {
            if (readError) {
                if (readError.code === "ENOENT") {
                    sendJson(res, 404, { error: `No save file found for ${resolvedSave.safeName}.` });
                    return;
                }

                sendJson(res, 500, { error: "Failed to read save file." });
                return;
            }

            try {
                const parsed = JSON.parse(fileData);
                sendJson(res, 200, {
                    fileName: resolvedSave.fileName,
                    snapshot: parsed
                });
            } catch (error) {
                sendJson(res, 500, { error: "Save file is not valid JSON." });
            }
        });

        return true;
    }

    if (req.method === "POST") {
        readJsonBody(req)
            .then(payload => {
                const snapshot = payload && typeof payload.snapshot === "object" && payload.snapshot
                    ? payload.snapshot
                    : null;

                if (!snapshot) {
                    sendJson(res, 400, { error: "Save payload must include a snapshot object." });
                    return;
                }

                fs.mkdir(SAVES_DIR, { recursive: true }, mkdirError => {
                    if (mkdirError) {
                        sendJson(res, 500, { error: "Failed to prepare save directory." });
                        return;
                    }

                    const serialized = JSON.stringify(snapshot, null, 2);

                    fs.writeFile(resolvedSave.filePath, serialized, "utf8", writeError => {
                        if (writeError) {
                            sendJson(res, 500, { error: "Failed to write save file." });
                            return;
                        }

                        sendJson(res, 200, {
                            fileName: resolvedSave.fileName,
                            saved: true
                        });
                    });
                });
            })
            .catch(error => {
                sendJson(res, 400, { error: error.message || "Invalid save request." });
            });

        return true;
    }

    sendJson(res, 405, { error: "Method Not Allowed" });
    return true;
}

const server = http.createServer((req, res) => {
    if (!req.url) {
        sendResponse(res, 400, "text/plain; charset=utf-8", "Bad Request");
        return;
    }

    const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);

    if (requestUrl.pathname.startsWith("/api/saves/")) {
        if (handleSaveApi(req, res, requestUrl)) {
            return;
        }
    }

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
