import HttpServer from './http-server.js';

/**
 * Service Registry for microservices registration and discovery
 * Provides HTTP API for service management
 */
class ServiceRegistry {
    constructor() {
        this.services = {};
        this.server = new HttpServer();
    }

    /**
     * Register a service in the registry
     * @param {string} name - Service name
     * @param {string} host - Service host
     * @param {number} port - Service port
     * @returns {Object} - Registered service object
     */
    register(name, host, port) {
        const id = `${name}-${host}-${port}`;
        this.services[id] = {
            id,
            name,
            host,
            port,
            url: `http://${host}:${port}`,
            timestamp: Date.now()
        };
        return this.services[id];
    }

    /**
     * Unregister a service from the registry
     * @param {string} id - Service ID to unregister
     * @returns {boolean} - True if service was unregistered, false otherwise
     */
    unregister(id) {
        if (this.services[id]) {
            delete this.services[id];
            return true;
        }
        return false;
    }

    /**
     * Get all registered services
     * @returns {Object} - Object containing all registered services
     */
    getAll() {
        return this.services;
    }

    /**
     * Find services by name
     * @param {string} name - Service name to search for
     * @returns {Array} - Array of services matching the name
     */
    findByName(name) {
        return Object.values(this.services)
            .filter(service => service.name === name);
    }

    /**
     * Start HTTP server for service registry API
     * @param {number} port - Port to listen on (default: 3000)
     * @returns {http.Server} - HTTP server instance
     */
    start(port = 3000) {
        return this.server.listen(port, () => {
            console.log(`☁ Service registry started, listening on port ${port}`);
        });
    }
}

export { ServiceRegistry };
export default ServiceRegistry;