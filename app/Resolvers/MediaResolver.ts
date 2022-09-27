import Media from "App/Models/Media";
import APIAuthService from "App/Services/APIAuthService";
import GQLService from "App/Services/GQLService";
import PersistService from "App/Services/PersistService";

const resolvers = {
    Mutation: {
        async mediaUpdateOrCreate(_, {data}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            if (! data.medias) {
                return (new GQLService()).error(404, 'No media found.');
            }

            // if (data.type == 'Logo') {
            //     let oldMedias = await Media.query().where({'type': data.type});

            //     let oldMediaDelete = async () => {
            //         return Promise.all(
            //             oldMedias.map(async (media) => {
            //                 await (new GQLService()).fileDelete(media.src);

            //                 await media.delete();
            //             })
            //         );
            //     }

            //     await oldMediaDelete();
            // }

            let mediaUpload = async () => {
                return Promise.all(
                    data.medias.map(async (file: any) => {
                        let fileName = await (new GQLService()).upload(file);

                        let media = await Media.create({
                            type: data.type,
                            src: fileName,
                            status: 'Active',
                        });

                        return (new PersistService()).media(media);
                    })
                );
            }

            return await mediaUpload();
        },
    },
}

module.exports = resolvers;
