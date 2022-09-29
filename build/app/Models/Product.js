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
const luxon_1 = require("luxon");
const Orm_1 = global[Symbol.for('ioc.use')]("Adonis/Lucid/Orm");
class Product extends Orm_1.BaseModel {
}
Product.table = 'products';
__decorate([
    (0, Orm_1.column)({ isPrimary: true }),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], Product.prototype, "store_id", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], Product.prototype, "category_id", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Product.prototype, "media_ids", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Product.prototype, "title", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Product.prototype, "short_description", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Product.prototype, "long_description", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Product.prototype, "html_content", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], Product.prototype, "price", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], Product.prototype, "discount", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Product.prototype, "discount_type", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", luxon_1.DateTime)
], Product.prototype, "discount_expires_at", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Product.prototype, "country_of_origin", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], Product.prototype, "stock", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true }),
    __metadata("design:type", luxon_1.DateTime)
], Product.prototype, "createdAt", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", luxon_1.DateTime)
], Product.prototype, "updatedAt", void 0);
exports.default = Product;
//# sourceMappingURL=Product.js.map