import { createServer } from 'http';
import { parse } from 'url';

class HttpServer {
    constructor() {
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {}
        };
    }

    // GET
    get(path, handler) {
        this.routes.GET[path] = handler;
        return this;
    }

    // POST
    post(path, handler) {
        this.routes.POST[path] = handler;
        return this;
    }

    // PUT
    put(path, handler) {
        this.routes.PUT[path] = handler;
        return this;
    }

    // DELETE
    delete(path, handler) {
        this.routes.DELETE[path] = handler;
        return this;
    }

    // Parse request body
    async parseBody(req) {
        return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (e) {
                    resolve({});
                }
            });
        });
    }

    // Start server
    listen(port, callback) {
        const server = createServer(async (req, res) => {
            const parsedUrl = parse(req.url, true);
            const path = parsedUrl.pathname;
            const method = req.method;

            // Add JSON response helper
            res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
            };

            // Add query parameters
            req.query = parsedUrl.query;

            // Parse request body
            if (method === 'POST' || method === 'PUT') {
                req.body = await this.parseBody(req);
            }

            // Find route
            if (this.routes[method] && this.routes[method][path]) {
                this.routes[method][path](req, res);
            } else {
                // 404 Not Found
                res.statusCode = 404;
                res.end('Not Found');
            }
        });

        server.listen(port, callback);
        return server;
    }
}

export default HttpServer;
