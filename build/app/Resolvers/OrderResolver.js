"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Order"));
const OrderItem_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/OrderItem"));
const Product_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Product"));
const Store_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Store"));
const User_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/User"));
const APIAuthService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/APIAuthService"));
const GQLService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/GQLService"));
const PersistService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/PersistService"));
const orderItemUpdateOrCreateHandler = async function (order_id, data) {
    let order = await Order_1.default.find(order_id);
    if (!order) {
        return (new GQLService_1.default()).error(404);
    }
    let product = await Product_1.default.find(data.product_id);
    if (!product) {
        return (new GQLService_1.default()).error(404);
    }
    await OrderItem_1.default.updateOrCreate({
        order_id: order_id,
        product_id: data.product_id,
    }, {
        quantity: data.quantity,
        price: product.price,
        total_price: data.quantity * product.price,
    });
    const orderItem = await OrderItem_1.default.query().where({
        order_id: order_id,
        product_id: data.product_id,
    }).first();
    const totalPriceQuery = await OrderItem_1.default.query()
        .where('order_id', order_id)
        .sum('total_price')
        .first();
    const totalPrice = totalPriceQuery?.$extras['sum(`total_price`)'] ?? 0;
    await order.merge({
        initial_price: totalPrice,
        total_price: totalPrice - order.delivery_fee
    }).save();
    return (new PersistService_1.default()).orderItem(orderItem);
};
const resolvers = {
    Query: {
        async orderFindAll(_, {}, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const orders = await Order_1.default.all();
            return orders.map((order) => (new PersistService_1.default()).order(order));
        },
        async orderFindAllByStore(_, { store_id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const orders = await Order_1.default.query().where('store_id', store_id);
            const counters = {
                total_order: orders.length,
                total_pending_order: orders.filter((order) => order.status == 'Pending').length,
                total_processing_order: orders.filter((order) => order.status == 'Processing').length,
                total_shipped_order: orders.filter((order) => order.status == 'Shipped').length,
                total_completed_order: orders.filter((order) => order.status == 'Completed').length,
            };
            return orders.map(async (order) => {
                let orderData = await (new PersistService_1.default()).order(order);
                const user = await User_1.default.find(orderData.user_id);
                const userData = {
                    customer_name: user?.name,
                    email: user?.email,
                };
                return { ...orderData, ...counters, ...userData };
            });
        },
        async orderFindAllByUser(_, { user_id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const orders = await Order_1.default.query().where('user_id', user_id);
            return orders.map((order) => (new PersistService_1.default()).order(order));
        },
        async orderFilter(_, { from_date, to_date }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const orders = await Order_1.default.query()
                .whereBetween('created_at', [
                new Date(from_date),
                new Date(to_date)
            ]);
            return orders.map((order) => (new PersistService_1.default()).order(order));
        },
        async orderFindOne(_, { id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            const order = await Order_1.default.find(id);
            if (!order) {
                return (new GQLService_1.default()).error(404);
            }
            return (new PersistService_1.default()).order(order);
        },
    },
    Mutation: {
        async orderCreate(_, { data }, {}) {
            let store = await Store_1.default.find(data.store_id);
            if (!store) {
                return (new GQLService_1.default()).error(404, 'Store not found.');
            }
            let cartItems = data?.products ?? [];
            delete data.products;
            let order = await Order_1.default.create({ ...data, ...{ uid: Date.now(), status: 'Pending' } });
            let cartStore = async () => {
                return Promise.all(cartItems.map(async (cartItem) => {
                    return await orderItemUpdateOrCreateHandler(order.id, cartItem);
                }));
            };
            return cartStore().then(async () => {
                let orderModel = await Order_1.default.find(order.id);
                return await (new PersistService_1.default()).order(orderModel);
            });
        },
        async createOrderAsGuest(_, { data }, {}) {
            let store = await Store_1.default.find(data.store_id);
            if (!store) {
                return (new GQLService_1.default()).error(404, 'Store not found.');
            }
            let user = await User_1.default.query().where('email', data.email).first();
            if (!user) {
                user = await User_1.default.create({
                    role_id: 7,
                    store_id: data.store_id,
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    username: data.username,
                    password: data.password,
                    address: data.address,
                    status: 'Active',
                });
            }
            let order = await Order_1.default.create({
                uid: Date.now(),
                store_id: data.store_id,
                user_id: user.id,
                delivery_fee: data.delivery_fee,
                shipping_address: data.shipping_address,
                billing_address: data.billing_address,
                status: 'Pending',
            });
            let cartItems = data?.products ?? [];
            let cartStore = async () => {
                return Promise.all(cartItems.map(async (cartItem) => {
                    return await orderItemUpdateOrCreateHandler(order.id, cartItem);
                }));
            };
            return cartStore().then(async () => {
                let orderModel = await Order_1.default.find(order.id);
                return await (new PersistService_1.default()).order(orderModel);
            });
        },
        async orderUpdate(_, { id, data }, {}) {
            let order = await Order_1.default.find(id);
            if (!order) {
                return (new GQLService_1.default()).error(404);
            }
            let store = await Store_1.default.find(data.store_id);
            if (!store) {
                return (new GQLService_1.default()).error(404, 'Store not found.');
            }
            let cartItems = data?.products ?? [];
            delete data.products;
            await order.merge({ ...data, ...{ total_price: order.initial_price - order.delivery_fee } }).save();
            order = await Order_1.default.find(id);
            let cartStore = async () => {
                return Promise.all(cartItems.map(async (cartItem) => {
                    return await orderItemUpdateOrCreateHandler(id, cartItem);
                }));
            };
            return cartStore().then(async () => {
                let orderModel = await Order_1.default.find(id);
                return await (new PersistService_1.default()).order(orderModel);
            });
        },
        async orderStatusUpdate(_, { id, status }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let order = await Order_1.default.find(id);
            if (!order) {
                return (new GQLService_1.default()).error(404);
            }
            await order.merge({ status: status }).save();
            order = await Order_1.default.find(id);
            return (new PersistService_1.default()).order(order);
        },
        async orderDelete(_, { id }, { ctx }) {
            await (new APIAuthService_1.default()).authenticate(ctx);
            let order = await Order_1.default.find(id);
            if (!order) {
                return (new GQLService_1.default()).error(404);
            }
            await order.delete();
            await OrderItem_1.default.query().where('order_id', id).delete();
            return true;
        },
    },
};
module.exports = resolvers;
//# sourceMappingURL=OrderResolver.js.map