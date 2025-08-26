import http from 'http';
import https from 'https';

class HttpClient {
    constructor() {}

    // Parse URL and determine protocol
    parseUrl(url) {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        return { parsedUrl, protocol };
    }

    // Build request options
    buildRequestOptions(parsedUrl, method = 'GET', headers = {}) {
        return {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
    }

    // Handle response data
    handleResponse(res) {
        return new Promise((resolve) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                let parsedData;
                try {
                    parsedData = JSON.parse(responseData);
                } catch (e) {
                    parsedData = responseData;
                }
                
                resolve({
                    data: parsedData,
                    status: res.statusCode,
                    headers: res.headers
                });
            });
        });
    }

    // Main request method
    request(options, data = null) {
        return new Promise((resolve, reject) => {
            const { parsedUrl, protocol } = this.parseUrl(options.url);
            const requestOptions = this.buildRequestOptions(
                parsedUrl, 
                options.method, 
                options.headers
            );
            
            const req = protocol.request(requestOptions, async (res) => {
                try {
                    const response = await this.handleResponse(res);
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data))
            
            req.end();
        });
    }

    // GET
    get(url, options = {}) {
        return this.request({
            url,
            method: 'GET',
            ...options
        });
    }

    // POST
    post(url, data = {}, options = {}) {
        return this.request({
            url,
            method: 'POST',
            ...options
        }, data);
    }

    // PUT
    put(url, data = {}, options = {}) {
        return this.request({
            url,
            method: 'PUT',
            ...options
        }, data);
    }

    // DELETE
    delete(url, options = {}) {
        return this.request({
            url,
            method: 'DELETE',
            ...options
        });
    }
}

// Create an instance of HttpClient
const HttpClient = new HttpClient();

// Export instance and methods
export default HttpClient;
export const { get, post, put, delete: del } = HttpClient;
export { HttpClient };
