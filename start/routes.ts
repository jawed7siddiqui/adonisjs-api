/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import ApolloServer from '@ioc:Zakodium/Apollo/Server';
import Route from '@ioc:Adonis/Core/Route';
import './api';

ApolloServer.applyMiddleware();

Route.get('/', async ({ view }) => {
    return view.render('auth.login');
}).as('home');

Route.get('dashboard', async ({ view }) => {
    return view.render('pages.dashboard');
}).as('dashboard').middleware('auth');

Route.get('login', async ({ view }) => {
    return view.render('auth.login');
}).as('login');

Route.get('logout', async ({ auth, response }) => {
    await auth.use('web').logout();

    response.redirect('login');
}).as('logout');

Route.get('auth/facebook/redirect', async ({ ally }) => {
    return ally.use('facebook').redirect();
}).as('login.facebook');

Route.get('auth/facebook/callback', 'Auth/SocialAuthController.facebook');

Route.get('auth/google/redirect', async ({ ally }) => {
    return ally.use('google').redirect();
}).as('login.google');

Route.get('auth/google/callback', 'Auth/SocialAuthController.google');
