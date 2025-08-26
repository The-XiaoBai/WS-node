import http from 'http';
import https from 'https';

/**
 * HTTP Client for making HTTP/HTTPS requests
 * Supports GET, POST, PUT, DELETE methods
 */
class HttpClient {
    constructor() {}

    /**
     * Parse URL and determine protocol
     * @param {string} url - URL to parse
     * @returns {Object} - Parsed URL and protocol
     */
    parseUrl(url) {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        return { parsedUrl, protocol };
    }

    /**
     * Build request options for HTTP request
     * @param {URL} parsedUrl - Parsed URL object
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {Object} headers - HTTP headers
     * @returns {Object} - Request options
     */
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

    /**
     * Handle HTTP response data
     * @param {http.IncomingMessage} res - HTTP response object
     * @returns {Promise<Object>} - Promise resolving to response data
     */
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

    /**
     * Main request method for making HTTP requests
     * @param {Object} options - Request options
     * @param {string} options.url - Request URL
     * @param {string} options.method - HTTP method
     * @param {Object} options.headers - HTTP headers
     * @param {*} data - Request body data
     * @returns {Promise<Object>} - Promise resolving to response
     */
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

    /**
     * Make HTTP GET request
     * @param {string} url - Request URL
     * @param {Object} options - Additional request options
     * @returns {Promise<Object>} - Promise resolving to response
     */
    get(url, options = {}) {
        return this.request({
            url,
            method: 'GET',
            ...options
        });
    }

    /**
     * Make HTTP POST request
     * @param {string} url - Request URL
     * @param {Object} data - Request body data
     * @param {Object} options - Additional request options
     * @returns {Promise<Object>} - Promise resolving to response
     */
    post(url, data = {}, options = {}) {
        return this.request({
            url,
            method: 'POST',
            ...options
        }, data);
    }

    /**
     * Make HTTP PUT request
     * @param {string} url - Request URL
     * @param {Object} data - Request body data
     * @param {Object} options - Additional request options
     * @returns {Promise<Object>} - Promise resolving to response
     */
    put(url, data = {}, options = {}) {
        return this.request({
            url,
            method: 'PUT',
            ...options
        }, data);
    }

    /**
     * Make HTTP DELETE request
     * @param {string} url - Request URL
     * @param {Object} options - Additional request options
     * @returns {Promise<Object>} - Promise resolving to response
     */
    delete(url, options = {}) {
        return this.request({
            url,
            method: 'DELETE',
            ...options
        });
    }
}

export { HttpClient };
export default HttpClient;
