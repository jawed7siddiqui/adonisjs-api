"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const ProductCategory_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/ProductCategory"));
const ProductCategoryAttribute_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/ProductCategoryAttribute"));
const Store_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Store"));
const APIAuthService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/APIAuthService"));
const GQLService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/GQLService"));
const PersistService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/PersistService"));
const validateProductCategoryAttributeData = async function (data, category_id, id) {
    let ignoreRules = id ? { whereNot: { id: id } } : {};
    try {
        await Validator_1.validator.validate({
            data: data,
            schema: Validator_1.schema.create({
                name: Validator_1.schema.string({}, [
                    Validator_1.rules.maxLength(255),
                    Validator_1.rules.unique({ table: 'product_category_attributes', column: 'name', ...{ where: { category_id: category_id } }, ...ignoreRules }),
                ]),
                status: Validator_1.schema.string({}, [
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
};
const resolvers = {
    Query: {
        async productCategoryFindAll(_, {}, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const productCategories = await ProductCategory_1.default.all();
            return productCategories.map((productCategory) => (new PersistService_1.default()).productCategory(productCategory));
        },
        async productCategoryFindAllByStore(_, { store_id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const productCategories = await ProductCategory_1.default.query().where('store_id', store_id);
            return productCategories.map((productCategory) => (new PersistService_1.default()).productCategory(productCategory));
        },
        async productCategoryFindOne(_, { id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const productCategory = await ProductCategory_1.default.find(id);
            if (!productCategory) {
                return (new GQLService_1.default()).error(404);
            }
            return (new PersistService_1.default()).productCategory(productCategory);
        },
    },
    Mutation: {
        async productCategoryCreate(_, { data }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let store = await Store_1.default.find(data.store_id);
            if (!store) {
                return (new GQLService_1.default()).error(404, 'Store not found.');
            }
            const productCategory = await ProductCategory_1.default.create(data);
            return (new PersistService_1.default()).productCategory(productCategory);
        },
        async productCategoryCreateMultiple(_, { data }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let store = await Store_1.default.find(data.store_id);
            if (!store) {
                return (new GQLService_1.default()).error(404, 'Store not found.');
            }
            let productCategoryCreate = async () => {
                return Promise.all(data.categories.map(async (category) => {
                    let productCategory = await ProductCategory_1.default.create({
                        store_id: data.store_id,
                        name: category,
                        slug: category
                            .toLowerCase()
                            .trim()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/[\s_-]+/g, '-')
                            .replace(/^-+|-+$/g, ''),
                        status: 'Active',
                    });
                    return (new PersistService_1.default()).productCategory(productCategory);
                }));
            };
            return await productCategoryCreate();
        },
        async productCategoryUpdate(_, { id, data }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let productCategory = await ProductCategory_1.default.find(id);
            if (!productCategory) {
                return (new GQLService_1.default()).error(404);
            }
            await productCategory.merge(data).save();
            productCategory = await ProductCategory_1.default.find(id);
            return (new PersistService_1.default()).productCategory(productCategory);
        },
        async productCategoryDelete(_, { id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let productCategory = await ProductCategory_1.default.find(id);
            if (!productCategory) {
                return (new GQLService_1.default()).error(404);
            }
            await productCategory.delete();
            return true;
        },
        async productCategoryAttributeCreate(_, { category_id, data }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let productCategory = await ProductCategory_1.default.find(category_id);
            if (!productCategory) {
                return (new GQLService_1.default()).error(404);
            }
            await validateProductCategoryAttributeData(data, category_id);
            const productCategoryAttribute = await ProductCategoryAttribute_1.default.create({ ...data, ...{ category_id: category_id } });
            return (new PersistService_1.default()).productCategoryAttribute(productCategoryAttribute);
        },
        async productCategoryAttributeUpdate(_, { id, data }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let productCategoryAttribute = await ProductCategoryAttribute_1.default.find(id);
            if (!productCategoryAttribute) {
                return (new GQLService_1.default()).error(404);
            }
            await validateProductCategoryAttributeData(data, productCategoryAttribute?.category_id, id);
            await productCategoryAttribute.merge(data).save();
            productCategoryAttribute = await ProductCategoryAttribute_1.default.find(id);
            return (new PersistService_1.default()).productCategoryAttribute(productCategoryAttribute);
        },
        async productCategoryAttributeDelete(_, { id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let productCategoryAttribute = await ProductCategoryAttribute_1.default.find(id);
            if (!productCategoryAttribute) {
                return (new GQLService_1.default()).error(404);
            }
            await productCategoryAttribute.delete();
            return true;
        },
    },
};
module.exports = resolvers;
//# sourceMappingURL=ProductCategoryResolver.js.map