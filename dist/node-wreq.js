"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocket = void 0;
exports.request = request;
exports.getProfiles = getProfiles;
exports.get = get;
exports.post = post;
exports.websocket = websocket;
const types_1 = require("./types");
let nativeBinding;
function loadNativeBinding() {
    const platform = process.platform;
    const arch = process.arch;
    // Map Node.js platform/arch to Rust target triple suffixes
    // napi-rs creates files like: node-wreq.linux-x64-gnu.node
    const platformArchMap = {
        darwin: {
            x64: 'darwin-x64',
            arm64: 'darwin-arm64',
        },
        linux: {
            x64: 'linux-x64-gnu',
        },
        win32: {
            x64: 'win32-x64-msvc',
        },
    };
    const platformArch = platformArchMap[platform]?.[arch];
    if (!platformArch) {
        throw new Error(`Unsupported platform: ${platform}-${arch}. ` +
            `Supported platforms: darwin-x64, darwin-arm64, linux-x64, win32-x64`);
    }
    // Try to load platform-specific binary
    const binaryName = `node-wreq.${platformArch}.node`;
    try {
        return require(`../rust/${binaryName}`);
    }
    catch (e1) {
        // Fallback to node-wreq.node (for local development)
        try {
            return require('../rust/node-wreq.node');
        }
        catch (e2) {
            throw new Error(`Failed to load native module for ${platform}-${arch}. ` +
                `Tried: ../rust/${binaryName} and ../rust/node-wreq.node. ` +
                `Make sure the package is installed correctly and the native module is built for your platform.`);
        }
    }
}
try {
    nativeBinding = loadNativeBinding();
}
catch (error) {
    throw error;
}
/**
 * Make an HTTP request with browser impersonation
 *
 * @param options - Request options
 * @returns Promise that resolves to the response
 *
 * @example
 * ```typescript
 * import { request } from 'node-wreq';
 *
 * const response = await request({
 *   url: 'https://example.com/api',
 *   browser: 'chrome_137',
 *   headers: {
 *     'Custom-Header': 'value'
 *   }
 * });
 *
 * console.log(response.status); // 200
 * console.log(response.body);   // Response body
 * ```
 */
async function request(options) {
    if (!options.url) {
        throw new types_1.RequestError('URL is required');
    }
    if (options.browser) {
        const profiles = getProfiles();
        if (!profiles.includes(options.browser)) {
            throw new types_1.RequestError(`Invalid browser profile: ${options.browser}. Available profiles: ${profiles.join(', ')}`);
        }
    }
    try {
        return await nativeBinding.request(options);
    }
    catch (error) {
        throw new types_1.RequestError(String(error));
    }
}
/**
 * Get list of available browser profiles
 *
 * @returns Array of browser profile names
 *
 * @example
 * ```typescript
 * import { getProfiles } from 'node-wreq';
 *
 * const profiles = getProfiles();
 * console.log(profiles); // ['chrome_120', 'chrome_131', 'firefox', ...]
 * ```
 */
function getProfiles() {
    return nativeBinding.getProfiles();
}
/**
 * Convenience function for GET requests
 *
 * @param url - URL to request
 * @param options - Additional request options
 * @returns Promise that resolves to the response
 *
 * @example
 * ```typescript
 * import { get } from 'node-wreq';
 *
 * const response = await get('https://example.com/api');
 * ```
 */
async function get(url, options) {
    return request({ ...options, url, method: 'GET' });
}
/**
 * Convenience function for POST requests
 *
 * @param url - URL to request
 * @param body - Request body
 * @param options - Additional request options
 * @returns Promise that resolves to the response
 *
 * @example
 * ```typescript
 * import { post } from 'node-wreq';
 *
 * const response = await post(
 *   'https://example.com/api',
 *   JSON.stringify({ foo: 'bar' }),
 *   { headers: { 'Content-Type': 'application/json' } }
 * );
 * ```
 */
async function post(url, body, options) {
    return request({ ...options, url, method: 'POST', body });
}
/**
 * WebSocket connection class
 *
 * @example
 * ```typescript
 * import { websocket } from 'node-wreq';
 *
 * const ws = await websocket({
 *   url: 'wss://echo.websocket.org',
 *   browser: 'chrome_137',
 *   onMessage: (data) => {
 *     console.log('Received:', data);
 *   },
 *   onClose: () => {
 *     console.log('Connection closed');
 *   },
 *   onError: (error) => {
 *     console.error('Error:', error);
 *   }
 * });
 *
 * // Send text message
 * await ws.send('Hello World');
 *
 * // Send binary message
 * await ws.send(Buffer.from([1, 2, 3]));
 *
 * // Close connection
 * await ws.close();
 * ```
 */
class WebSocket {
    constructor(connection) {
        this._connection = connection;
    }
    /**
     * Send a message (text or binary)
     */
    async send(data) {
        try {
            await nativeBinding.websocketSend(this._connection, data);
        }
        catch (error) {
            throw new types_1.RequestError(String(error));
        }
    }
    /**
     * Close the WebSocket connection
     */
    async close() {
        try {
            await nativeBinding.websocketClose(this._connection);
        }
        catch (error) {
            throw new types_1.RequestError(String(error));
        }
    }
}
exports.WebSocket = WebSocket;
/**
 * Create a WebSocket connection with browser impersonation
 *
 * @param options - WebSocket options
 * @returns Promise that resolves to the WebSocket instance
 */
async function websocket(options) {
    if (!options.url) {
        throw new types_1.RequestError('URL is required');
    }
    if (!options.onMessage) {
        throw new types_1.RequestError('onMessage callback is required');
    }
    if (options.browser) {
        const profiles = getProfiles();
        if (!profiles.includes(options.browser)) {
            throw new types_1.RequestError(`Invalid browser profile: ${options.browser}. Available profiles: ${profiles.join(', ')}`);
        }
    }
    try {
        const connection = await nativeBinding.websocketConnect({
            url: options.url,
            browser: options.browser || 'chrome_137',
            headers: options.headers || {},
            proxy: options.proxy,
            onMessage: options.onMessage,
            onClose: options.onClose,
            onError: options.onError,
        });
        return new WebSocket(connection);
    }
    catch (error) {
        throw new types_1.RequestError(String(error));
    }
}
exports.default = {
    request,
    get,
    post,
    getProfiles,
    websocket,
    WebSocket,
};
//# sourceMappingURL=node-wreq.js.map