import {schema, rules, validator} from "@ioc:Adonis/Core/Validator";
import ProductCategory from "App/Models/ProductCategory";
import ProductCategoryAttribute from "App/Models/ProductCategoryAttribute";
import Store from "App/Models/Store";
import APIAuthService from "App/Services/APIAuthService";
import GQLService from "App/Services/GQLService";
import PersistService from "App/Services/PersistService";

// const validateProductCategoryData = async function(data: any, id?: null) {
//     let ignoreRules = id
//         ? {where: {store_id: data.store_id}, whereNot: {id: id}}
//         : {where: {store_id: data.store_id}};

//     try {
//         await validator.validate({
//             data: data,
//             schema: schema.create({
//                 name: schema.string({}, [
//                     rules.maxLength(255),
//                     rules.unique({table: 'product_categories', column: 'name', ...ignoreRules}),
//                 ]),
//                 slug: schema.string({}, [
//                     rules.maxLength(255),
//                     rules.unique({table: 'product_categories', column: 'slug', ...ignoreRules}),
//                 ]),
//                 status: schema.string({}, [
//                     rules.maxLength(255),
//                 ]),
//             }),
//             reporter: validator.reporters.api,
//             messages: {
//                 required: 'The {{ field }} is required.',
//                 unique: 'The {{ field }} has already been taken.',
//             }
//         });
//     } catch (error) {
//         return (new GQLService()).validationError(error);
//     }
// };

const validateProductCategoryAttributeData = async function(data: any, category_id?: null, id?: null | undefined) {
    let ignoreRules = id ? {whereNot: {id: id}} : {};

    try {
        await validator.validate({
            data: data,
            schema: schema.create({
                name: schema.string({}, [
                    rules.maxLength(255),
                    rules.unique({table: 'product_category_attributes', column: 'name', ...{where: {category_id: category_id}}, ...ignoreRules}),
                ]),
                status: schema.string({}, [
                    rules.maxLength(255),
                ]),
            }),
            reporter: validator.reporters.api,
            messages: {
                required: 'The {{ field }} is required.',
                unique: 'The {{ field }} has already been taken.',
            }
        });
    } catch (error) {
        return (new GQLService()).validationError(error);
    }
};

const resolvers = {
    Query: {
        async productCategoryFindAll(_, {}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const productCategories = await ProductCategory.all();

            return productCategories.map((productCategory) => (new PersistService()).productCategory(productCategory));
        },

        async productCategoryFindAllByStore(_, {store_id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const productCategories = await ProductCategory.query().where('store_id', store_id);

            return productCategories.map((productCategory) => (new PersistService()).productCategory(productCategory));
        },

        async productCategoryFindOne(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const productCategory = await ProductCategory.find(id);

            if (! productCategory) {
                return (new GQLService()).error(404);
            }

            return (new PersistService()).productCategory(productCategory);
        },
    },

    Mutation: {
        async productCategoryCreate(_, {data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let store = await Store.find(data.store_id);

            if (! store) {
                return (new GQLService()).error(404, 'Store not found.');
            }

            // await validateProductCategoryData(data);

            const productCategory = await ProductCategory.create(data);

            return (new PersistService()).productCategory(productCategory);
        },

        async productCategoryCreateMultiple(_, {data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let store = await Store.find(data.store_id);

            if (! store) {
                return (new GQLService()).error(404, 'Store not found.');
            }

            let productCategoryCreate = async () => {
                return Promise.all(
                    data.categories.map(async (category: any) => {
                        let productCategory = await ProductCategory.create({
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

                        return (new PersistService()).productCategory(productCategory);
                    })
                );
            }

            return await productCategoryCreate();
        },

        async productCategoryUpdate(_, {id, data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let productCategory = await ProductCategory.find(id);

            if (! productCategory) {
                return (new GQLService()).error(404);
            }

            // await validateProductCategoryData(data, id);

            await productCategory.merge(data).save();

            productCategory = await ProductCategory.find(id);

            return (new PersistService()).productCategory(productCategory);
        },

        async productCategoryDelete(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let productCategory = await ProductCategory.find(id);

            if (! productCategory) {
                return (new GQLService()).error(404);
            }

            await productCategory.delete();

            return true;
        },

        async productCategoryAttributeCreate(_, {category_id, data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let productCategory = await ProductCategory.find(category_id);

            if (! productCategory) {
                return (new GQLService()).error(404);
            }

            await validateProductCategoryAttributeData(data, category_id);

            const productCategoryAttribute = await ProductCategoryAttribute.create({...data, ...{category_id: category_id}});

            return (new PersistService()).productCategoryAttribute(productCategoryAttribute);
        },

        async productCategoryAttributeUpdate(_, {id, data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let productCategoryAttribute = await ProductCategoryAttribute.find(id);

            if (! productCategoryAttribute) {
                return (new GQLService()).error(404);
            }

            await validateProductCategoryAttributeData(data, productCategoryAttribute?.category_id, id);

            await productCategoryAttribute.merge(data).save();

            productCategoryAttribute = await ProductCategoryAttribute.find(id);

            return (new PersistService()).productCategoryAttribute(productCategoryAttribute);
        },

        async productCategoryAttributeDelete(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let productCategoryAttribute = await ProductCategoryAttribute.find(id);

            if (! productCategoryAttribute) {
                return (new GQLService()).error(404);
            }

            await productCategoryAttribute.delete();

            return true;
        },
    },
}

module.exports = resolvers;
