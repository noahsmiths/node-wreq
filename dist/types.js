"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestError = void 0;
class RequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RequestError';
    }
}
exports.RequestError = RequestError;
//# sourceMappingURL=types.js.map