import {schema, rules, validator} from "@ioc:Adonis/Core/Validator";
import Store from "App/Models/Store";
import APIAuthService from "App/Services/APIAuthService";
import GQLService from "App/Services/GQLService";
import PersistService from "App/Services/PersistService";

const validateStoreData = async function(data: any, id?: null) {
    let ignoreRules = id
        ? {where: {user_id: data.user_id}, whereNot: {id: id}}
        : {where: {user_id: data.user_id}};

    try {
        await validator.validate({
            data: data,
            schema: schema.create({
                site_name: schema.string({}, [
                    rules.maxLength(255),
                    rules.unique({table: 'stores', column: 'site_name', ...ignoreRules}),
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
        async storeFindAll(_, {}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const stores = await Store.all();

            return stores.map((store) => (new PersistService()).store(store));
        },

        async storeFindAllByUser(_, {user_id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const stores = await Store.query().where('user_id', user_id);

            return stores.map((store) => (new PersistService()).store(store));
        },

        async storeFindOne(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const store = await Store.find(id);

            if (! store) {
                return (new GQLService()).error(404);
            }

            return (new PersistService()).store(store);
        },
    },

    Mutation: {
        async storeCreate(_, {data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const userStore = await Store.query().where('user_id', data.user_id).first();

            if (userStore) {
                return (new GQLService()).error(404, 'User already has a store.');
            }

            await validateStoreData(data);

            const store = await Store.create(data);

            return (new PersistService()).store(store);
        },

        async storeUpdate(_, {id, data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            await validateStoreData(data, id);

            let store = await Store.find(id);

            if (! store) {
                return (new GQLService()).error(404);
            }

            await store.merge(data).save();

            store = await Store.find(id);

            return (new PersistService()).store(store);
        },

        async storeDelete(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let store = await Store.find(id);

            if (! store) {
                return (new GQLService()).error(404);
            }

            await store.delete();

            return true;
        },
    },
}

module.exports = resolvers;
