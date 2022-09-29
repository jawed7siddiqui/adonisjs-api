"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const Store_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Store"));
const APIAuthService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/APIAuthService"));
const GQLService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/GQLService"));
const PersistService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/PersistService"));
const validateStoreData = async function (data, id) {
    let ignoreRules = id
        ? { where: { user_id: data.user_id }, whereNot: { id: id } }
        : { where: { user_id: data.user_id } };
    try {
        await Validator_1.validator.validate({
            data: data,
            schema: Validator_1.schema.create({
                site_name: Validator_1.schema.string({}, [
                    Validator_1.rules.maxLength(255),
                    Validator_1.rules.unique({ table: 'stores', column: 'site_name', ...ignoreRules }),
                ]),
            }),
            reporter: Validator_1.validator.reporters.api,
            messages: {
                required: 'The {{ field }} is required.',
                unique: 'The {{ field }} has already been taken.',
            }
        });
    }
    catch (error) {
        return (new GQLService_1.default()).validationError(error);
    }
};
const resolvers = {
    Query: {
        async storeFindAll(_, {}, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const stores = await Store_1.default.all();
            return stores.map((store) => (new PersistService_1.default()).store(store));
        },
        async storeFindAllByUser(_, { user_id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const stores = await Store_1.default.query().where('user_id', user_id);
            return stores.map((store) => (new PersistService_1.default()).store(store));
        },
        async storeFindOne(_, { id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const store = await Store_1.default.find(id);
            if (!store) {
                return (new GQLService_1.default()).error(404);
            }
            return (new PersistService_1.default()).store(store);
        },
    },
    Mutation: {
        async storeCreate(_, { data }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const userStore = await Store_1.default.query().where('user_id', data.user_id).first();
            if (userStore) {
                return (new GQLService_1.default()).error(404, 'User already has a store.');
            }
            await validateStoreData(data);
            const store = await Store_1.default.create(data);
            return (new PersistService_1.default()).store(store);
        },
        async storeUpdate(_, { id, data }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            await validateStoreData(data, id);
            let store = await Store_1.default.find(id);
            if (!store) {
                return (new GQLService_1.default()).error(404);
            }
            await store.merge(data).save();
            store = await Store_1.default.find(id);
            return (new PersistService_1.default()).store(store);
        },
        async storeDelete(_, { id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let store = await Store_1.default.find(id);
            if (!store) {
                return (new GQLService_1.default()).error(404);
            }
            await store.delete();
            return true;
        },
    },
};
module.exports = resolvers;
//# sourceMappingURL=StoreResolver.js.map