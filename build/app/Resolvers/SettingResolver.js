"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const Env_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Env"));
const Media_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Media"));
const Setting_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Setting"));
const APIAuthService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/APIAuthService"));
const GQLService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/GQLService"));
const PersistService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/PersistService"));
const resolvers = {
    Query: {
        async settingFindAll(_, {}, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            return (new PersistService_1.default()).setting();
        },
        async settingFindOne(_, { key }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            if (key == 'site_logo') {
                let siteLogo = await Media_1.default.query().where({ 'type': 'Logo' }).first();
                return siteLogo?.src
                    ? `${Env_1.default.get('APP_URL')}/uploads/${siteLogo.src}`
                    : null;
            }
            const setting = await Setting_1.default.query().where('key', key).first();
            if (!setting) {
                return (new GQLService_1.default()).error(404);
            }
            return (new PersistService_1.default()).setting(setting);
        },
    },
    Mutation: {
        async settingUpdateOrCreate(_, { data }, { ctx }) {
            try {
                await ctx.request.validate({
                    data: data,
                    schema: Validator_1.schema.create({
                        site_name: Validator_1.schema.string.optional({}, [
                            Validator_1.rules.maxLength(255),
                        ]),
                        site_category: Validator_1.schema.string.optional({}, [
                            Validator_1.rules.maxLength(255),
                        ]),
                        site_type: Validator_1.schema.string.optional({}, [
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
            if (data.site_name) {
                await Setting_1.default.updateOrCreate({ key: 'site_name' }, { value: data.site_name });
            }
            if (data.site_category) {
                await Setting_1.default.updateOrCreate({ key: 'site_category' }, { value: data.site_category });
            }
            if (data.site_type) {
                await Setting_1.default.updateOrCreate({ key: 'site_type' }, { value: data.site_type });
            }
            return await (new PersistService_1.default()).setting();
        },
    },
};
module.exports = resolvers;
//# sourceMappingURL=SettingResolver.js.map