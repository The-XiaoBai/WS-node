import { ServiceRegistry, HttpClient } from '../src/index.js';

/**
 * Simple assertion function for testing
 * @param {boolean} condition - The condition to test
 * @param {string} message - Test description
 */
function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`✅ PASSED: ${message}`);
    return true;
}

/**
 * Test suite for ServiceRegistry
 */
class ServiceRegistryTests {
    constructor() {
        this.registry = null;
        this.testServices = {
            service1: { name: 'testService1', host: 'localhost', port: 5001 },
            service2: { name: 'testService2', host: 'localhost', port: 5002 },
            service3: { name: 'testService1', host: '127.0.0.1', port: 5003 }
        };
    }

    /**
     * Set up test environment before each test
     */
    setup() {
        console.log('\n📋 Setting up test environment...');
        this.registry = new ServiceRegistry();
        this.httpClient = new HttpClient();
        
        // Configure HTTP server routes
        this.registry.server.get('/services', (req, res) => {
            res.statusCode = 200;
            res.json(this.registry.getAll());
        });
        
        this.registry.server.post('/services', (req, res) => {
            const { name, host, port } = req.body;
            const service = this.registry.register(name, host, port);
            res.statusCode = 201;
            res.json(service);
        });
        
        this.registry.server.delete('/services', (req, res) => {
            const id = req.query.id;
            if (id && this.registry.unregister(id)) {
                res.statusCode = 204;
                res.end();
            } else {
                res.statusCode = 404;
                res.json({ error: 'Service not found' });
            }
        });

        this.registry.start();
    }

    /**
     * Clean up after tests
     */
    teardown() {
        console.log('🧹 Cleaning up test environment...');
        this.registry = null;
        this.httpClient = null;
    }

    /**
     * Test service registry creation
     */
    testCreateRegistry() {
        console.log('\n🔍 TEST 1: Create service registry');
        assert(this.registry instanceof ServiceRegistry, 'Registry should be an instance of ServiceRegistry');
        assert(Object.keys(this.registry.getAll()).length === 0, 'New registry should have 0 services');
    }

    /**
     * Test service registration functionality
     */
    testRegisterServices() {
        console.log('\n🔍 TEST 2: Register services');
        
        // Register services
        const { service1, service2, service3 } = this.testServices;
        const registeredService1 = this.registry.register(service1.name, service1.host, service1.port);
        const registeredService2 = this.registry.register(service2.name, service2.host, service2.port);
        const registeredService3 = this.registry.register(service3.name, service3.host, service3.port);
        
        // Verify registrations
        assert(registeredService1 && registeredService1.id, 'Service 1 should be registered with an ID');
        assert(registeredService2 && registeredService2.id, 'Service 2 should be registered with an ID');
        assert(registeredService3 && registeredService3.id, 'Service 3 should be registered with an ID');
        assert(Object.keys(this.registry.getAll()).length === 3, 'Registry should have 3 services');
    }

    /**
     * Test finding services by name
     */
    testFindServicesByName() {
        console.log('\n🔍 TEST 3: Find services by name');
        
        // Register test services if not already registered
        if (Object.keys(this.registry.getAll()).length === 0) {
            const { service1, service2, service3 } = this.testServices;
            this.registry.register(service1.name, service1.host, service1.port);
            this.registry.register(service2.name, service2.host, service2.port);
            this.registry.register(service3.name, service3.host, service3.port);
        }
        
        // Find services by name
        const foundServices = this.registry.findByName('testService1');
        
        // Verify search results
        assert(Array.isArray(foundServices), 'Found services should be an array');
        assert(foundServices.length === 2, 'Should find 2 services named testService1');
        assert(foundServices.every(s => s.name === 'testService1'), 'All found services should be named testService1');
    }

    /**
     * Test service unregistration
     */
    testUnregisterService() {
        console.log('\n🔍 TEST 4: Unregister service');
        
        // Register test services if not already registered
        if (Object.keys(this.registry.getAll()).length === 0) {
            const { service1, service2, service3 } = this.testServices;
            this.registry.register(service1.name, service1.host, service1.port);
            this.registry.register(service2.name, service2.host, service2.port);
            this.registry.register(service3.name, service3.host, service3.port);
        }
        
        // Count services before unregistration
        const countBefore = Object.keys(this.registry.getAll()).length;
        
        // Unregister a service
        const serviceId = `testService2-localhost-5002`;
        const unregistered = this.registry.unregister(serviceId);
        
        // Verify unregistration
        assert(unregistered === true, 'Unregister should return true for existing service');
        assert(Object.keys(this.registry.getAll()).length === countBefore - 1, 'Registry should have one less service');
    }

    /**
     * Test unregistering a non-existent service
     */
    testUnregisterNonExistentService() {
        console.log('\n🔍 TEST 5: Try to unregister non-existent service');
        
        // Attempt to unregister a non-existent service
        const nonExistentId = 'nonexistent-service-id';
        const unregistered = this.registry.unregister(nonExistentId);
        
        // Verify result
        assert(unregistered === false, 'Unregister should return false for non-existent service');
    }

    /**
     * Test HTTP client GET request
     */
    async testHttpClientGet() {
        console.log('\n🔍 TEST 6: HTTP Client GET request');
        
        const serverUrl = `http://localhost:3000/services`;
        
        try {
            // Make GET request
            const response = await this.httpClient.get(serverUrl);
            
            // Verify response
            assert(response.status === 200, 'GET request should return status 200');
            assert(typeof response.data === 'object', 'Response data should be an object');
            console.log('GET response:', response.data);
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }
    
    /**
     * Test HTTP client POST request
     */
    async testHttpClientPost() {
        console.log('\n🔍 TEST 7: HTTP Client POST request');
        
        const serverUrl = `http://localhost:3000/services`;
        const testService = { name: 'httpTestService', host: 'localhost', port: 6000 };
        
        try {
            // Make POST request
            const response = await this.httpClient.post(serverUrl, testService);
            
            // Verify response
            assert(response.status === 201, 'POST request should return status 201');
            assert(response.data.id === `${testService.name}-${testService.host}-${testService.port}`, 'Service should be registered with correct ID');
            console.log('POST response:', response.data);
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }
    
    /**
     * Test HTTP client DELETE request
     */
    async testHttpClientDelete() {
        console.log('\n🔍 TEST 8: HTTP Client DELETE request');
        
        // Register a service to delete
        const testService = { name: 'deleteTestService', host: 'localhost', port: 7000 };
        this.registry.register(testService.name, testService.host, testService.port);
        
        const serviceId = `${testService.name}-${testService.host}-${testService.port}`;
        const serverUrl = `http://localhost:3000/services?id=${serviceId}`;
        
        try {
            // Make DELETE request
            const response = await this.httpClient.delete(serverUrl);
            
            // Verify response
            assert(response.status === 204, 'DELETE request should return status 204');
            assert(this.registry.findByName(testService.name).length === 0, 'Service should be deleted from registry');
            console.log('DELETE successful, service removed');
        } catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🚀 Starting ServiceRegistry tests...');
        
        try {
            this.setup();

            // Service Registry tests
            console.log('\n🔧 Starting Service Registry tests...');
            this.testCreateRegistry();
            this.testRegisterServices();
            this.testFindServicesByName();
            this.testUnregisterService();
            this.testUnregisterNonExistentService();
            
            // HTTP Client tests
            console.log('\n🌐 Starting HTTP Client tests...');
            await this.testHttpClientGet();
            await this.testHttpClientPost();
            await this.testHttpClientDelete();
            
            console.log('\n✨ All tests completed successfully! ✨');
        } catch (error) {
            console.error('\n❌ Tests failed:', error.message);
        } finally {
            this.teardown();
        }
    }
}

// Create and run tests
const tests = new ServiceRegistryTests();
(async () => {
    await tests.runAllTests();
})();