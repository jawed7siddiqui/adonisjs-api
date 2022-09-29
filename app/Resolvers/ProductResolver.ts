import {schema, rules, validator} from "@ioc:Adonis/Core/Validator";
import Product from "App/Models/Product";
import ProductAttribute from "App/Models/ProductAttribute";
import ProductCategory from "App/Models/ProductCategory";
import ProductCategoryAttribute from "App/Models/ProductCategoryAttribute";
import ProductFAQ from "App/Models/ProductFAQ";
import Store from "App/Models/Store";
import APIAuthService from "App/Services/APIAuthService";
import GQLService from "App/Services/GQLService";
import PersistService from "App/Services/PersistService";

const validateProductData = async function(data: any, id?: null) {
    let ignoreRules = id ? {whereNot: {id: id}} : {};

    console.log(ignoreRules);

    try {
        await validator.validate({
            data: data,
            schema: schema.create({
                title: schema.string({}, [
                    rules.maxLength(255),
                    // rules.unique({table: 'products', column: 'title', ...ignoreRules}),
                ]),
                category_id: schema.number(),
                price: schema.number(),
                discount: schema.number.optional(),
                country_of_origin: schema.string.optional({}, [
                    rules.maxLength(255),
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
        async productFindAll(_, {}, {}) {
            const products = await Product.all();

            return products.map((product) => (new PersistService()).product(product));
        },

        async productFindAllByStore(_, {store_id}, {}) {
            const products = await Product.query().where('store_id', store_id);

            return products.map((product) => (new PersistService()).product(product));
        },

        async productFindAllBySiteName(_, {site_name}, {}) {
            let store = await Store.query().where('site_name', site_name).first();

            if (! store) {
                return (new GQLService()).error(404, 'Site name not found.');
            }

            const products = await Product.query().where('store_id', store.id);

            return products.map((product) => (new PersistService()).product(product));
        },

        async productFindOne(_, {id}, {}) {
            const product = await Product.find(id);

            if (! product) {
                return (new GQLService()).error(404);
            }

            return (new PersistService()).product(product);
        },
    },

    Mutation: {
        async productCreate(_, {data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let store = await Store.find(data.store_id);

            if (! store) {
                return (new GQLService()).error(404, 'Store not found.');
            }

            let productCategory = await ProductCategory.find(data.category_id);

            if (! productCategory) {
                return (new GQLService()).error(404, 'Category not found.');
            }

            await validateProductData(data);

            const product = await Product.create({...data, ...{discount_type: 'Percentage'}});

            return (new PersistService()).product(product);
        },

        async productUpdate(_, {id, data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let product = await Product.find(id);

            if (! product) {
                return (new GQLService()).error(404);
            }

            let store = await Store.find(data.store_id);

            if (! store) {
                return (new GQLService()).error(404, 'Store not found.');
            }

            await validateProductData(data, id);

            await product.merge(data).save();

            product = await Product.find(id);

            return (new PersistService()).product(product);
        },

        async productDelete(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let product = await Product.find(id);

            if (! product) {
                return (new GQLService()).error(404);
            }

            await product.delete();

            return true;
        },

        // async productMediaDelete(_, {id}, {ctx}) {
        //     await (new APIAuthService()).authenticate(ctx);

        //     let productMedia = await ProductMedia.find(id);

        //     if (! productMedia) {
        //         return (new GQLService()).error(404);
        //     }

        //     await productMedia.delete();

        //     return true;
        // },

        async productAttributeUpdateOrCreate(_, {product_id, data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let product = await Product.find(product_id);

            if (! product) {
                return (new GQLService()).error(404);
            }

            // let attribute = await ProductCategoryAttribute.query()
            //     .where({'category_id': product.category_id, 'name': data.name})
            //     .first();

            // if (! attribute) {
            //     return (new GQLService()).error(404, `The ${data.name} attribute not available.`);
            // }

            await ProductAttribute.updateOrCreate({
                product_id: product.id,
                name: data.name,
                value: data.value,
            },{});

            return (new PersistService()).productAttribute(product_id);
        },

        async productAttributeDelete(_, {product_id, name}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let product = await Product.find(product_id);

            if (! product) {
                return (new GQLService()).error(404);
            }

            let attribute = await ProductCategoryAttribute.query()
                .where({'category_id': product.category_id, 'name': name})
                .first();

            if (! attribute) {
                return (new GQLService()).error(404, `The ${name} attribute not available.`);
            }

            let productAttribute = await ProductAttribute.query()
                .where({'product_id': product.id, 'attribute_id': attribute.id})
                .first();

            if (! productAttribute) {
                return (new GQLService()).error(404, `The ${name} attribute not found.`);
            }

            await productAttribute.delete();

            return true;
        },

        async productFAQCreate(_, {product_id, data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let product = await Product.find(product_id);

            if (! product) {
                return (new GQLService()).error(404);
            }

            const productFAQ = await ProductFAQ.create({...data, ...{product_id: product.id, status: 'Active'}});

            return (new PersistService()).productFAQ(productFAQ);
        },

        async productFAQUpdate(_, {id, data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let productFAQ = await ProductFAQ.find(id);

            if (! productFAQ) {
                return (new GQLService()).error(404);
            }

            await productFAQ.merge(data).save();

            productFAQ = await ProductFAQ.find(id);

            return (new PersistService()).productFAQ(productFAQ);
        },

        async productFAQDelete(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let productFAQ = await ProductFAQ.find(id);

            if (! productFAQ) {
                return (new GQLService()).error(404);
            }

            await productFAQ.delete();

            return true;
        },
    },
}

module.exports = resolvers;
