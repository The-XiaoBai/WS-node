# WS-node

## Introduction

WS-Node is a lightweight Web services registration and management system built using Node.js.

It provides simple HTTP server, client, and service registration capabilities, making service discovery and management in microservice architectures simple and efficient.

## Features

- **Service Registration & Discovery**: Support for service registration, query, and deregistration
- **HTTP Server**: Built-in simple HTTP server with RESTful API support
- **HTTP Client**: Convenient HTTP request utilities
- **Modular Design**: Components can be used independently or together

## Project Structure

```
WS-node/
├── src/                        # Source code directory
│   ├── http-client.js          # HTTP client implementation
│   ├── http-server.js          # HTTP server implementation
│   ├── service-registration.js # Core service registration logic
│   └── index.js                # Module entry point
├── tests/                      # Tests and examples directory
│   ├── example.js              # Usage examples
│   └── test.js                 # Test cases
├── .gitignore                  # Git ignore configuration
├── CHANGELOG                   # Version change history
├── LICENSE                     # MIT license
├── package.json                # Project configuration and dependencies
├── README.md                   # Project documentation
└── TODO                        # Planned features
```

## Testing

Run the test suite:

```bash
npm test
```

## Running Examples

The project includes complete example code that can be run with:

```bash
npm run example
```

## Creating a Service Registry

```javascript
import ServiceRegistry from 'ws-node';

// Create a service registry instance
const registry = new ServiceRegistry();

// Start the service on port 3000 (default: 3000)
registry.start(3000);

// Register services
const serviceName = 'service_name';
const serviceHost = 'localhost';
const servicePort = 4001;
registry.register(serviceName, serviceHost, servicePort);

// Query services
const foundService = registry.findByName('service_name');
console.log(foundService);

// Deregister a service
const serviceId = `${serviceName}-${serviceHost}-${servicePort}`;
registry.unregister(serviceId);
```

## License

This project is distributed under the [MIT license](LICENSE).