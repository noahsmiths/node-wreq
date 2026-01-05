"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const promises_1 = require("node:timers/promises");
const node_wreq_1 = require("../node-wreq");
(0, node_test_1.describe)('WebSocket', () => {
    (0, node_test_1.before)(() => {
        console.log('🔌 WebSocket Test Suite\n');
    });
    (0, node_test_1.test)('should connect to WebSocket and send/receive messages', async () => {
        const messages = [];
        let isClosed = false;
        const ws = await (0, node_wreq_1.websocket)({
            url: 'wss://echo.websocket.org',
            browser: 'chrome_137',
            onMessage: (data) => {
                messages.push(data);
            },
            onClose: () => {
                isClosed = true;
            },
            onError: (error) => {
                console.error('WebSocket error:', error);
            },
        });
        console.log('WebSocket connected');
        await ws.send('Hello!');
        // Wait for echo response
        await (0, promises_1.setTimeout)(1000);
        node_assert_1.default.ok(messages.length > 0, 'Should receive at least one message');
        // Wait a bit for close callback
        await ws.close();
        await (0, promises_1.setTimeout)(500);
        node_assert_1.default.ok(isClosed, 'Should receive close event');
        // Rate limit protection: wait before next test
        await (0, promises_1.setTimeout)(2000);
    });
    (0, node_test_1.test)('should handle parallel sends on same WebSocket', async () => {
        const messages = [];
        const expectedMessages = ['Message 1', 'Message 2', 'Message 3', 'Message 4', 'Message 5'];
        const ws = await (0, node_wreq_1.websocket)({
            url: 'wss://echo.websocket.org',
            browser: 'chrome_137',
            onMessage: (data) => {
                messages.push(data);
            },
            onClose: () => { },
            onError: (error) => {
                console.error('WebSocket error:', error);
            },
        });
        console.log('Testing parallel sends...');
        // Send multiple messages in parallel
        await Promise.all([
            ws.send('Message 1'),
            ws.send('Message 2'),
            ws.send('Message 3'),
            ws.send('Message 4'),
            ws.send('Message 5'),
        ]);
        console.log('All messages sent in parallel');
        // Wait for echo responses
        await (0, promises_1.setTimeout)(2000);
        node_assert_1.default.ok(messages.length >= 5, 'Should receive at least 5 messages');
        // Verify that all expected messages were received (order may vary)
        const receivedStrings = messages.map((m) => (Buffer.isBuffer(m) ? m.toString() : m));
        for (const expected of expectedMessages) {
            node_assert_1.default.ok(receivedStrings.includes(expected), `Should receive message: "${expected}". Got: ${receivedStrings.join(', ')}`);
        }
        console.log('All messages received correctly:', receivedStrings.join(', '));
        await ws.close();
        // Rate limit protection: wait before next test
        await (0, promises_1.setTimeout)(2000);
    });
    (0, node_test_1.test)('should handle multiple WebSocket connections simultaneously', async () => {
        const ws1Messages = [];
        const ws2Messages = [];
        // Create two WebSocket connections in parallel
        const [ws1, ws2] = await Promise.all([
            (0, node_wreq_1.websocket)({
                url: 'wss://echo.websocket.org',
                browser: 'chrome_137',
                onMessage: (data) => ws1Messages.push(data),
                onClose: () => { },
                onError: () => { },
            }),
            (0, node_wreq_1.websocket)({
                url: 'wss://echo.websocket.org',
                browser: 'firefox_139',
                onMessage: (data) => ws2Messages.push(data),
                onClose: () => { },
                onError: () => { },
            }),
        ]);
        console.log('WebSocket connections created');
        // Send unique messages on both connections in parallel
        await Promise.all([ws1.send('From WS1'), ws2.send('From WS2')]);
        // Wait for responses
        await (0, promises_1.setTimeout)(1500);
        node_assert_1.default.ok(ws1Messages.length > 0, 'WS1 should receive messages');
        node_assert_1.default.ok(ws2Messages.length > 0, 'WS2 should receive messages');
        // Verify that each connection received the correct message (not mixed up)
        // Note: echo.websocket.org sends a "Request served by..." message first, then echoes
        const ws1Strings = ws1Messages.map((m) => (Buffer.isBuffer(m) ? m.toString() : m));
        const ws2Strings = ws2Messages.map((m) => (Buffer.isBuffer(m) ? m.toString() : m));
        node_assert_1.default.ok(ws1Strings.includes('From WS1'), 'WS1 should receive its own message');
        node_assert_1.default.ok(ws2Strings.includes('From WS2'), 'WS2 should receive its own message');
        // Verify messages are not mixed up between connections
        node_assert_1.default.ok(!ws1Strings.includes('From WS2'), 'WS1 should NOT receive WS2 message');
        node_assert_1.default.ok(!ws2Strings.includes('From WS1'), 'WS2 should NOT receive WS1 message');
        console.log('Messages correctly isolated between connections:');
        console.log('  WS1:', ws1Strings);
        console.log('  WS2:', ws2Strings);
        // Close both connections
        await Promise.all([ws1.close(), ws2.close()]);
    });
});
//# sourceMappingURL=websocket.spec.js.map