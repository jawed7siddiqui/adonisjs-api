import Order from "App/Models/Order";
import OrderItem from "App/Models/OrderItem";
import Product from "App/Models/Product";
import Store from "App/Models/Store";
import User from "App/Models/User";
import APIAuthService from "App/Services/APIAuthService";
import GQLService from "App/Services/GQLService";
import PersistService from "App/Services/PersistService";

const orderItemUpdateOrCreateHandler = async function (order_id: any, data: any) {
    let order = await Order.find(order_id);

    if (! order) {
        return (new GQLService()).error(404);
    }

    let product = await Product.find(data.product_id);

    if (! product) {
        return (new GQLService()).error(404);
    }

    await OrderItem.updateOrCreate(
        {
            order_id: order_id,
            product_id: data.product_id,
        },
        {
            quantity: data.quantity,
            price: product.price,
            total_price: data.quantity * product.price,
        }
    );

    const orderItem = await OrderItem.query().where({
        order_id: order_id,
        product_id: data.product_id,
    }).first();

    const totalPriceQuery = await OrderItem.query()
        .where('order_id', order_id)
        .sum('total_price')
        .first();

    const totalPrice = totalPriceQuery?.$extras['sum(`total_price`)'] ?? 0;

    await order.merge({
        initial_price: totalPrice,
        total_price: totalPrice - order.delivery_fee
    }).save();

    return (new PersistService()).orderItem(orderItem);
}

const resolvers = {
    Query: {
        async orderFindAll(_, {}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const orders = await Order.all();

            return orders.map((order) => (new PersistService()).order(order));
        },

        async orderFindAllByStore(_, {store_id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const orders = await Order.query().where('store_id', store_id);

            const counters = {
                total_order: orders.length,
                total_pending_order: orders.filter((order) => order.status == 'Pending').length,
                total_processing_order: orders.filter((order) => order.status == 'Processing').length,
                total_shipped_order: orders.filter((order) => order.status == 'Shipped').length,
                total_completed_order: orders.filter((order) => order.status == 'Completed').length,
            };

            return orders.map(async (order) => {
                let orderData = await (new PersistService()).order(order);

                return {...orderData, ...counters}
            });
        },

        async orderFilter(_, {from_date, to_date}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const orders = await Order.query()
                .whereBetween('created_at', [
                    new Date(from_date),
                    new Date(to_date)
                ]);

            return orders.map((order) => (new PersistService()).order(order));
        },

        async orderFindOne(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            const order = await Order.find(id);

            if (! order) {
                return (new GQLService()).error(404);
            }

            return (new PersistService()).order(order);
        },
    },

    Mutation: {
        async orderCreate(_, {data}, {}) {
            let store = await Store.find(data.store_id);

            if (! store) {
                return (new GQLService()).error(404, 'Store not found.');
            }

            let orderItemData = {product_id: data.product_id, quantity: data.quantity};

            delete data.product_id;
            delete data.quantity;

            let order = await Order.create({...data, ...{uid: Date.now(), status: 'Pending'}});

            await orderItemUpdateOrCreateHandler(order.id, orderItemData);

            let orderModel = await Order.find(order.id);

            return await (new PersistService()).order(orderModel);
        },

        async createOrderAsGuest(_, {data}, {}) {
            let store = await Store.find(data.store_id);

            if (! store) {
                return (new GQLService()).error(404, 'Store not found.');
            }

            let user = await User.query().where('email', data.email).first();

            if (! user) {
                user = await User.create({
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

            let order = await Order.create({
                uid: Date.now(),
                store_id: data.store_id,
                user_id: user.id,
                delivery_fee: data.delivery_fee,
                shipping_address: data.shipping_address,
                billing_address: data.billing_address,
                status: 'Pending',
            });

            await orderItemUpdateOrCreateHandler(order.id, {product_id: data.product_id, quantity: data.quantity});

            let orderModel = await Order.find(order.id);

            return await (new PersistService()).order(orderModel);
        },

        async orderUpdate(_, {id, data}, {}) {
            let order = await Order.find(id);

            if (! order) {
                return (new GQLService()).error(404);
            }

            let store = await Store.find(data.store_id);

            if (! store) {
                return (new GQLService()).error(404, 'Store not found.');
            }

            let orderItemData = {product_id: data.product_id, quantity: data.quantity};

            delete data.product_id;
            delete data.quantity;

            await order.merge({...data, ...{total_price: order.initial_price - order.delivery_fee}}).save();

            order = await Order.find(id);

            await orderItemUpdateOrCreateHandler(id, orderItemData);

            let orderModel = await Order.find(id);

            return await (new PersistService()).order(orderModel);
        },

        async orderStatusUpdate(_, {id, status}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let order = await Order.find(id);

            if (! order) {
                return (new GQLService()).error(404);
            }

            await order.merge({status: status}).save();

            order = await Order.find(id);

            return (new PersistService()).order(order);
        },

        async orderDelete(_, {id}, {ctx}) {
            await (new APIAuthService()).authenticate(ctx);

            let order = await Order.find(id);

            if (! order) {
                return (new GQLService()).error(404);
            }

            await order.delete();

            await OrderItem.query().where('order_id', id).delete();

            return true;
        },

        // async orderItemUpdateOrCreate(_, {order_id, data}, {}) {
        //     return await orderItemUpdateOrCreateHandler(order_id, data);
        // },

        // async orderItemDelete(_, {id}, {}) {
        //     let orderItem = await OrderItem.find(id);

        //     if (! orderItem) {
        //         return (new GQLService()).error(404);
        //     }

        //     let order = await Order.find(orderItem.order_id);

        //     await orderItem.delete();

        //     if (! order) {
        //         return true;
        //     }

        //     const totalPriceQuery = await OrderItem.query()
        //         .where('order_id', order.id)
        //         .sum('total_price')
        //         .first();

        //     const totalPrice = totalPriceQuery?.$extras['sum(`total_price`)'] ?? 0;

        //     await order.merge({
        //         initial_price: totalPrice,
        //         total_price: totalPrice - order.delivery_fee
        //     }).save();

        //     return true;
        // },
    },
}

module.exports = resolvers;
