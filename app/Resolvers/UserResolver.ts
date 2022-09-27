import {schema, rules, validator} from "@ioc:Adonis/Core/Validator";
import Product from "App/Models/Product";
import ProductCategory from "App/Models/ProductCategory";
import Store from "App/Models/Store";
import User from "App/Models/User";
import APIAuthService from "App/Services/APIAuthService";
import GQLService from "App/Services/GQLService";
import PersistService from "App/Services/PersistService";

const resolvers = {
    Query: {
        async userFindAll(_, {}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const users = await User.all();

            return users.map((user) => (new PersistService()).user(user));
        },

        async userFindAllByRole(_, {role_id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const users = await User.query().where('role_id', role_id).orderBy('id', 'desc');

            return users.map((user) => (new PersistService()).user(user));
        },

        async userFindOne(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const user = await User.find(id);

            if (! user) {
                return (new GQLService()).error(404);
            }

            return (new PersistService()).user(user);
        },

        async userFindOneByEmail(_, {email}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const user = await User.query().where('email', email).first();

            if (! user) {
                return (new GQLService()).error(404);
            }

            return (new PersistService()).user(user);
        },

        async userInfoFindAll(_, {}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const users = await User.all();

            let userInfo = async () => {
                return Promise.all(
                    users.map(async (user: any) => {
                        let userData = await (new PersistService()).user(user);

                        let store = await Store.find(user.store_id);

                        let productCategory = await ProductCategory.query()
                            .where('store_id', user.store_id)
                            .orderBy('id', 'desc')
                            .first();

                        let product = await Product.query()
                            .where('store_id', user.store_id)
                            .orderBy('id', 'desc')
                            .first();

                        return {
                            user: userData,
                            store: await (new PersistService()).store(store),
                            category: await (new PersistService()).productCategory(productCategory),
                            product: await (new PersistService()).product(product),
                            isSetupDone: store && productCategory && product ? 'Y' : 'N',
                        };
                    })
                );
            }

            return await userInfo();
        },
    },

    Mutation: {
        async userCreate(_, {data}, {ctx}) {
            if (data?.role_id == 7) {
                let store = await Store.find(data.store_id);

                if (! store) {
                    return (new GQLService()).error(404, 'Store not found.');
                }
            }

            try {
                await ctx.request.validate({
                    data: data,
                    schema: schema.create({
                        name: schema.string.optional({}, [
                            rules.maxLength(255),
                        ]),
                        phone: schema.string.optional({}, [
                            rules.maxLength(255),
                        ]),
                        email: schema.string({}, [
                            rules.email(),
                            rules.maxLength(255),
                            rules.unique({table: 'users', column: 'email'}),
                        ]),
                        username: schema.string.optional({}, [
                            rules.maxLength(255),
                        ]),
                        password: schema.string({}, [
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

            const user = await User.create({...data, ...{role_id: data.role_id ?? 6, status: 'Active'}});

            return (new PersistService()).user(user);
        },
    },
}

module.exports = resolvers;
