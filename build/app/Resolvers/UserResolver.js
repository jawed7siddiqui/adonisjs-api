"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const Product_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Product"));
const ProductCategory_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/ProductCategory"));
const Store_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Store"));
const User_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/User"));
const APIAuthService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/APIAuthService"));
const GQLService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/GQLService"));
const PersistService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/PersistService"));
const resolvers = {
    Query: {
        async userFindAll(_, {}, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const users = await User_1.default.all();
            return users.map((user) => (new PersistService_1.default()).user(user));
        },
        async userFindAllByRole(_, { role_id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const users = await User_1.default.query().where('role_id', role_id).orderBy('id', 'desc');
            return users.map((user) => (new PersistService_1.default()).user(user));
        },
        async userFindOne(_, { id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const user = await User_1.default.find(id);
            if (!user) {
                return (new GQLService_1.default()).error(404);
            }
            return (new PersistService_1.default()).user(user);
        },
        async userFindOneByEmail(_, { email }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const user = await User_1.default.query().where('email', email).first();
            if (!user) {
                return (new GQLService_1.default()).error(404);
            }
            return (new PersistService_1.default()).user(user);
        },
        async userInfoFindAll(_, {}, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const users = await User_1.default.all();
            let userInfo = async () => {
                return Promise.all(users.map(async (user) => {
                    let userData = await (new PersistService_1.default()).user(user);
                    let store = await Store_1.default.find(user.store_id);
                    let productCategory = await ProductCategory_1.default.query()
                        .where('store_id', user.store_id)
                        .orderBy('id', 'desc')
                        .first();
                    let product = await Product_1.default.query()
                        .where('store_id', user.store_id)
                        .orderBy('id', 'desc')
                        .first();
                    return {
                        user: userData,
                        store: await (new PersistService_1.default()).store(store),
                        category: await (new PersistService_1.default()).productCategory(productCategory),
                        product: await (new PersistService_1.default()).product(product),
                        isSetupDone: store && productCategory && product ? 'Y' : 'N',
                    };
                }));
            };
            return await userInfo();
        },
    },
    Mutation: {
        async userCreate(_, { data }, { ctx }) {
            if (data?.role_id == 7) {
                let store = await Store_1.default.find(data.store_id);
                if (!store) {
                    return (new GQLService_1.default()).error(404, 'Store not found.');
                }
            }
            try {
                await ctx.request.validate({
                    data: data,
                    schema: Validator_1.schema.create({
                        name: Validator_1.schema.string.optional({}, [
                            Validator_1.rules.maxLength(255),
                        ]),
                        phone: Validator_1.schema.string.optional({}, [
                            Validator_1.rules.maxLength(255),
                        ]),
                        email: Validator_1.schema.string({}, [
                            Validator_1.rules.email(),
                            Validator_1.rules.maxLength(255),
                            Validator_1.rules.unique({ table: 'users', column: 'email' }),
                        ]),
                        username: Validator_1.schema.string.optional({}, [
                            Validator_1.rules.maxLength(255),
                        ]),
                        password: Validator_1.schema.string({}, [
                            Validator_1.rules.maxLength(255),
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
            const user = await User_1.default.create({ ...data, ...{ role_id: data.role_id ?? 6, status: 'Active' } });
            return (new PersistService_1.default()).user(user);
        },
    },
};
module.exports = resolvers;
//# sourceMappingURL=UserResolver.js.map