import {schema, rules, validator} from "@ioc:Adonis/Core/Validator";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";
import GQLService from "App/Services/GQLService";
import PersistService from "App/Services/PersistService";

let loginAction = async function(email: any, password: any, ctx: any) {
    try {
        await validator.validate({
            data: {
                email: email,
                password: password,
            },
            schema: schema.create({
                email: schema.string({}, [
                    rules.email(),
                    rules.maxLength(255),
                ]),
                password: schema.string({}, [
                    rules.maxLength(255),
                ]),
            }),
            reporter: validator.reporters.api,
            messages: {
                required: 'The {{ field }} is required.',
            },
        });
    } catch (error) {
        return (new GQLService()).validationError(error);
    }

    const user = await User
        .query()
        .where('email', email)
        .first();

    if (! user) {
        return (new GQLService()).error(404);
    }

    if (user) {
        await Database
            .query()
            .from('api_tokens')
            .where('user_id', user.id)
            .delete();
    }

    const {token} = await ctx.auth.use('api').attempt(email, password);

    return {
        token: token,
        user: (new PersistService()).user(ctx.auth.use('api').user),
    };
};

const resolvers = {
    Mutation: {
        async login(_, {email, password}, {ctx}) {
            return loginAction(email, password, ctx);
        },

        async register(_, {data}, {ctx}) {
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

            await User.create({...data, ...{role_id: 6, status: 'Active'}});

            return loginAction(data.email, data.password, ctx);
        },
    },
}

module.exports = resolvers;
