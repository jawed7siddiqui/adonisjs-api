"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Media_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Media"));
const APIAuthService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/APIAuthService"));
const GQLService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/GQLService"));
const PersistService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/PersistService"));
const resolvers = {
    Mutation: {
        async mediaUpdateOrCreate(_, { data }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            if (!data.medias) {
                return (new GQLService_1.default()).error(404, 'No media found.');
            }
            let mediaUpload = async () => {
                return Promise.all(data.medias.map(async (file) => {
                    let fileName = await (new GQLService_1.default()).upload(file);
                    let media = await Media_1.default.create({
                        type: data.type,
                        src: fileName,
                        status: 'Active',
                    });
                    return (new PersistService_1.default()).media(media);
                }));
            };
            return await mediaUpload();
        },
    },
};
module.exports = resolvers;
//# sourceMappingURL=MediaResolver.js.map