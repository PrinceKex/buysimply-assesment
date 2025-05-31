"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserDto {
    static toDto(user) {
        var _a;
        const dto = new UserDto();
        dto.id = user.id;
        dto.email = user.email;
        dto.first_name = user.first_name;
        dto.last_name = user.last_name;
        dto.role_code = ((_a = user.role) === null || _a === void 0 ? void 0 : _a.code) || null;
        dto.is_active = user.is_active;
        dto.created_at = user.created_at;
        dto.updated_at = user.updated_at;
        dto.deleted_at = user.deleted_at;
        return dto;
    }
}
exports.UserDto = UserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the user' }),
    __metadata("design:type", String)
], UserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User email' }),
    __metadata("design:type", String)
], UserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User first name' }),
    __metadata("design:type", String)
], UserDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User last name' }),
    __metadata("design:type", String)
], UserDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User role ID' }),
    __metadata("design:type", String)
], UserDto.prototype, "role_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User role code' }),
    __metadata("design:type", String)
], UserDto.prototype, "role_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the user is active or not' }),
    __metadata("design:type", Boolean)
], UserDto.prototype, "is_active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time when the user was created' }),
    __metadata("design:type", Date)
], UserDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Timestamp when the user was last updated" }),
    __metadata("design:type", Date)
], UserDto.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Timestamp when the user was deleted (soft delete)", required: false }),
    __metadata("design:type", Date)
], UserDto.prototype, "deleted_at", void 0);
//# sourceMappingURL=user.type.js.map