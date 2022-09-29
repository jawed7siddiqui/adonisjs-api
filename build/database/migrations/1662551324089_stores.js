"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class default_1 extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'stores';
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.bigInteger('user_id').nullable();
            table.string('name', 255).nullable();
            table.string('site_name', 255).nullable();
            table.text('description', 'longtext').nullable();
            table.string('type', 255).nullable();
            table.string('media_ids', 255).nullable();
            table.enum('status', ['Active', 'Inactive']).nullable();
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
            table.timestamp('deleted_at', { useTz: true }).nullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = default_1;
//# sourceMappingURL=1662551324089_stores.js.map