"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/User"));
class SocialAuthController {
    async facebook({ ally, auth, response }) {
        const facebook = ally.use('facebook');
        if (facebook.accessDenied()) {
            return 'Access was denied';
        }
        if (facebook.stateMisMatch()) {
            return 'Request expired. Retry again';
        }
        if (facebook.hasError()) {
            return facebook.getError();
        }
        const facebookUser = await facebook.user();
        let user = await User_1.default.query().where('email', facebookUser.original.email).first();
        if (!user) {
            user = await User_1.default.create({
                role_id: 7,
                facebook_id: facebookUser.original.id,
                name: facebookUser.original.name,
                email: facebookUser.original.email,
                status: 'Active',
            });
        }
        if (!user?.facebook_id) {
            await User_1.default.query().where('id', user.id).update({ facebook_id: facebookUser.original.id });
        }
        await auth.use('web').login(user);
        return response.redirect().toRoute('dashboard');
    }
    async google({ ally, auth, response }) {
        const google = ally.use('google');
        if (google.accessDenied()) {
            return 'Access was denied';
        }
        if (google.stateMisMatch()) {
            return 'Request expired. Retry again';
        }
        if (google.hasError()) {
            return google.getError();
        }
        const googleUser = await google.user();
        let user = await User_1.default.query().where('email', googleUser.original.email).first();
        if (!user) {
            user = await User_1.default.create({
                role_id: 7,
                google_id: googleUser.original.sub,
                name: googleUser.original.name,
                email: googleUser.original.email,
                status: 'Active',
            });
        }
        if (!user?.google_id) {
            await User_1.default.query().where('id', user.id).update({ google_id: googleUser.original.sub });
        }
        await auth.use('web').login(user);
        return response.redirect().toRoute('dashboard');
    }
}
exports.default = SocialAuthController;
//# sourceMappingURL=SocialAuthController.js.map