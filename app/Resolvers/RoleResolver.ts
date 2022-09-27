import Role from "App/Models/Role";
import APIAuthService from "App/Services/APIAuthService";
import PersistService from "App/Services/PersistService";

const resolvers = {
    Query: {
        async roleFindAll(_, {}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const roles = await Role.query().orderBy('id');

            return roles.map((role) => (new PersistService()).role(role));
        },
    },
}

module.exports = resolvers;
