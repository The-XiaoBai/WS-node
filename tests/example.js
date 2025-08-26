/**
 * Example usage of the Service Registry
 * Demonstrates how to set up a service registry with HTTP API
 */
import ServiceRegistry from '../src/index.js';

/**
 * Create service registry instance
 */
const registry = new ServiceRegistry();
const server = registry.server;

/**
 * API endpoint to get all registered services
 * GET /services
 */
server.get('/services', (req, res) => {
    res.json(registry.getAll());
});

/**
 * API endpoint to find services by name
 * GET /services/find?name=serviceName
 */
server.get('/services/find', (req, res) => {
    const name = req.query.name;
    if (!name) {
        res.statusCode = 400;
        return res.json({ error: 'Missing name parameter' });
    }
    res.json(registry.findByName(name));
});

/**
 * API endpoint to register a new service
 * POST /services
 * Body: { name, host, port }
 */
server.post('/services', async (req, res) => {
    const { name, host, port } = req.body;
    
    if (!name || !host || !port) {
        res.statusCode = 400;
        return res.json({ error: 'Missing required parameters' });
    }
    
    const service = registry.register(name, host, port);
    res.statusCode = 201;
    res.json(service);
});

/**
 * API endpoint to unregister a service
 * DELETE /services?id=serviceId
 */
server.delete('/services', (req, res) => {
    const { id } = req.query;
    
    if (!id) {
        res.statusCode = 400;
        return res.json({ error: 'Missing id parameter' });
    }
    
    const success = registry.unregister(id);
    if (success) {
        res.statusCode = 204;
        res.end();
    } else {
        res.statusCode = 404;
        res.json({ error: 'Service not found' });
    }
});

/**
 * Register example services for demonstration
 */
registry.register('demoService1', 'localhost', 4001);
registry.register('demoService2', 'localhost', 4002);

/**
 * Start the service registry server
 */
const port = 3000;
registry.start(port);

console.log('');
console.log('⭐ Get all services:');
console.log('GET http://localhost:3000/services');

console.log('');
console.log('⭐ Find services by name:');
console.log('GET http://localhost:3000/services/find?name=demoService1');

console.log('');
console.log('⭐ Register new service:');
console.log('POST http://localhost:3000/services');
console.log('Request body: { "name": "demoService3", "host": "localhost", "port": 4003 }');

console.log('');
console.log('⭐ Unregister service:');
console.log('DELETE http://localhost:3000/services?id=demoService1-localhost-4001');

console.log('');
