/**
 * Main entry point for the service registry module
 * @module service-registry
 */
import HttpClient from './http-client.js';
import HttpServer from './http-server.js';
import ServiceRegistry from './service-registration.js';

export { HttpClient, HttpServer, ServiceRegistry };
export default ServiceRegistry;
