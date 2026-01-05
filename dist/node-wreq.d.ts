import type { RequestOptions, Response, BrowserProfile, WebSocketOptions, NativeWebSocketConnection } from './types';
import { RequestError } from './types';
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
export declare function request(options: RequestOptions): Promise<Response>;
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
export declare function getProfiles(): BrowserProfile[];
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
export declare function get(url: string, options?: Omit<RequestOptions, 'url' | 'method'>): Promise<Response>;
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
export declare function post(url: string, body?: string, options?: Omit<RequestOptions, 'url' | 'method' | 'body'>): Promise<Response>;
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
export declare class WebSocket {
    private _connection;
    constructor(connection: NativeWebSocketConnection);
    /**
     * Send a message (text or binary)
     */
    send(data: string | Buffer): Promise<void>;
    /**
     * Close the WebSocket connection
     */
    close(): Promise<void>;
}
/**
 * Create a WebSocket connection with browser impersonation
 *
 * @param options - WebSocket options
 * @returns Promise that resolves to the WebSocket instance
 */
export declare function websocket(options: WebSocketOptions): Promise<WebSocket>;
export type { RequestOptions, Response, BrowserProfile, HttpMethod, WebSocketOptions, } from './types';
export type { RequestError };
declare const _default: {
    request: typeof request;
    get: typeof get;
    post: typeof post;
    getProfiles: typeof getProfiles;
    websocket: typeof websocket;
    WebSocket: typeof WebSocket;
};
export default _default;
//# sourceMappingURL=node-wreq.d.ts.map