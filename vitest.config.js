"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.ts'],
        exclude: ['node_modules/**', 'node_modules.bak/**', '.direnv/**', 'src/gemini-cli/**'],
    },
});
//# sourceMappingURL=vitest.config.js.map