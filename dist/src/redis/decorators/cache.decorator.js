"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = Cache;
const common_1 = require("@nestjs/common");
const cache_interceptor_1 = require("../cache.interceptor");
function Cache(options) {
    return (0, common_1.applyDecorators)((0, common_1.UseInterceptors)(cache_interceptor_1.CacheInterceptor));
}
//# sourceMappingURL=cache.decorator.js.map