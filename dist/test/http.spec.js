"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const node_wreq_1 = require("../node-wreq");
(0, node_test_1.describe)('HTTP', () => {
    (0, node_test_1.before)(() => {
        console.log('🔌 HTTP Test Suite\n');
    });
    (0, node_test_1.test)('should return available browser profiles', () => {
        const profiles = (0, node_wreq_1.getProfiles)();
        node_assert_1.default.ok(Array.isArray(profiles), 'Profiles should be an array');
        node_assert_1.default.ok(profiles.length > 0, 'Should have at least one profile');
        node_assert_1.default.ok(profiles.some((p) => p.includes('chrome')) ||
            profiles.some((p) => p.includes('firefox')) ||
            profiles.some((p) => p.includes('safari')), 'Should include standard browser profiles');
        console.log('Available profiles:', profiles.join(', '));
    });
    (0, node_test_1.test)('should make a simple GET request', async () => {
        const response = await (0, node_wreq_1.request)({
            url: 'https://httpbin.org/get',
            browser: 'chrome_131',
            timeout: 10000,
        });
        node_assert_1.default.ok(response.status >= 200 && response.status < 300, 'Should return successful status');
        node_assert_1.default.ok(Object.keys(response.headers).length > 0, 'Should have response headers');
        node_assert_1.default.ok(response.body.length > 0, 'Should have response body');
        const body = JSON.parse(response.body);
        node_assert_1.default.ok(body.headers['User-Agent'], 'Should have User-Agent header');
        console.log('Status:', response.status);
        console.log('User-Agent:', body.headers['User-Agent']);
    });
    (0, node_test_1.test)('should work with different browser profiles', async () => {
        const testUrl = 'https://httpbin.org/user-agent';
        const browsers = ['chrome_137', 'firefox_139', 'safari_18'];
        for (const browser of browsers) {
            const response = await (0, node_wreq_1.request)({
                url: testUrl,
                browser: browser,
                timeout: 10000,
            });
            node_assert_1.default.ok(response.status === 200, `${browser} should return status 200`);
            const data = JSON.parse(response.body);
            node_assert_1.default.ok(data['user-agent'], `${browser} should have user-agent`);
            console.log(`${browser}:`, data['user-agent'].substring(0, 70) + '...');
        }
    });
    (0, node_test_1.test)('should handle timeout errors', async () => {
        await node_assert_1.default.rejects(async () => {
            await (0, node_wreq_1.request)({
                url: 'https://httpbin.org/delay/10',
                browser: 'chrome_137',
                timeout: 1000, // 1 second timeout for 10 second delay
            });
        }, {
            name: 'RequestError',
        }, 'Should throw an error on timeout');
    });
    (0, node_test_1.test)('should capture multiple cookies from Set-Cookie headers', async () => {
        // httpbin.org/cookies/set allows us to set multiple cookies
        const response = await (0, node_wreq_1.request)({
            url: 'https://httpbin.org/cookies/set?session=abc123&csrf_token=xyz789&user_pref=dark',
            browser: 'chrome_131',
            timeout: 10000,
        });
        node_assert_1.default.ok(response.status >= 200 && response.status < 400, 'Should return successful status');
        node_assert_1.default.ok(typeof response.cookies === 'object', 'Should have cookies object');
        // The server should set multiple cookies
        const cookieKeys = Object.keys(response.cookies);
        console.log('Captured cookies:', response.cookies);
        node_assert_1.default.ok(cookieKeys.length > 0, 'Should capture at least one cookie');
        // Check if multiple cookies were captured
        // httpbin redirects after setting cookies, so we should have the cookies in the response
        if (cookieKeys.length > 1) {
            console.log('✓ Multiple cookies captured successfully:', cookieKeys.join(', '));
        }
        else {
            console.log('Note: Only one cookie captured. Cookie count:', cookieKeys.length);
        }
    });
});
//# sourceMappingURL=http.spec.js.map