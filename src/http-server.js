import { createServer } from 'http';
import { parse } from 'url';

/**
 * Simple HTTP server implementation
 * Supports routing for GET, POST, PUT, DELETE methods
 */
class HttpServer {
    constructor() {
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {}
        };
    }

    /**
     * Register GET route handler
     * @param {string} path - Route path
     * @param {Function} handler - Route handler function
     * @returns {HttpServer} - Returns this for method chaining
     */
    get(path, handler) {
        this.routes.GET[path] = handler;
        return this;
    }

    /**
     * Register POST route handler
     * @param {string} path - Route path
     * @param {Function} handler - Route handler function
     * @returns {HttpServer} - Returns this for method chaining
     */
    post(path, handler) {
        this.routes.POST[path] = handler;
        return this;
    }

    /**
     * Register PUT route handler
     * @param {string} path - Route path
     * @param {Function} handler - Route handler function
     * @returns {HttpServer} - Returns this for method chaining
     */
    put(path, handler) {
        this.routes.PUT[path] = handler;
        return this;
    }

    /**
     * Register DELETE route handler
     * @param {string} path - Route path
     * @param {Function} handler - Route handler function
     * @returns {HttpServer} - Returns this for method chaining
     */
    delete(path, handler) {
        this.routes.DELETE[path] = handler;
        return this;
    }

    /**
     * Parse HTTP request body
     * @param {http.IncomingMessage} req - HTTP request object
     * @returns {Promise<Object>} - Parsed request body as object
     */
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

    /**
     * Start HTTP server on specified port
     * @param {number} port - Port to listen on
     * @param {Function} callback - Callback function called when server starts
     * @returns {http.Server} - HTTP server instance
     */
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

export { HttpServer };
export default HttpServer;
