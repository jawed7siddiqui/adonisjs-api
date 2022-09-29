"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = __importDefault(global[Symbol.for('ioc.use')]("Zakodium/Apollo/Server"));
const Route_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Route"));
require("./api");
Server_1.default.applyMiddleware();
Route_1.default.get('/', async ({ view }) => {
    return view.render('auth.login');
}).as('home');
Route_1.default.get('dashboard', async ({ view }) => {
    return view.render('pages.dashboard');
}).as('dashboard').middleware('auth');
Route_1.default.get('login', async ({ view }) => {
    return view.render('auth.login');
}).as('login');
Route_1.default.get('logout', async ({ auth, response }) => {
    await auth.use('web').logout();
    response.redirect('login');
}).as('logout');
Route_1.default.get('auth/facebook/redirect', async ({ ally }) => {
    return ally.use('facebook').redirect();
}).as('login.facebook');
Route_1.default.get('auth/facebook/callback', 'Auth/SocialAuthController.facebook');
Route_1.default.get('auth/google/redirect', async ({ ally }) => {
    return ally.use('google').redirect();
}).as('login.google');
Route_1.default.get('auth/google/callback', 'Auth/SocialAuthController.google');
//# sourceMappingURL=routes.js.map