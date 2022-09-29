"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Seeder_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Seeder"));
const Role_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Role"));
class default_1 extends Seeder_1.default {
    async run() {
        await Role_1.default.updateOrCreateMany('name', [
            { name: 'Developer', status: 'Active' },
            { name: 'Super Admin', status: 'Active' },
            { name: 'Admin', status: 'Active' },
            { name: 'Manager', status: 'Active' },
            { name: 'General', status: 'Active' },
            { name: 'Vendor', status: 'Active' },
            { name: 'Customer', status: 'Active' },
        ]);
    }
}
exports.default = default_1;
//# sourceMappingURL=Role.js.map