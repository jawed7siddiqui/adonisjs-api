"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class default_1 extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'orders';
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('uid', 255).nullable();
            table.bigInteger('store_id').nullable();
            table.bigInteger('user_id').nullable();
            table.float('initial_price').defaultTo(0);
            table.float('delivery_fee').defaultTo(0);
            table.float('total_price').defaultTo(0);
            table.text('shipping_address', 'longtext').nullable();
            table.text('billing_address', 'longtext').nullable();
            table.enum('status', ['Pending', 'Processing', 'Shipped', 'Completed', 'Returned', 'Cancelled']).nullable();
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
//# sourceMappingURL=1662221458390_orders.js.map