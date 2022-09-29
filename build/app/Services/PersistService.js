"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Env_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Env"));
const Media_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Media"));
const Order_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Order"));
const OrderItem_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/OrderItem"));
const ProductAttribute_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/ProductAttribute"));
const ProductCategoryAttribute_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/ProductCategoryAttribute"));
const ProductFAQ_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/ProductFAQ"));
const Setting_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Setting"));
const Store_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Store"));
class PersistService {
    role(role) {
        return {
            id: role?.id ?? null,
            name: role?.name ?? null,
            status: role?.status ?? null,
            created_at: role?.createdAt?.toString(),
            updated_at: role?.updatedAt?.toString(),
        };
    }
    async user(user) {
        let ordersMaped = [];
        if (user.role_id == 7) {
            let orders = await Order_1.default.query().where('user_id', user.id);
            ordersMaped = orders.map((order) => this.order(order));
        }
        return {
            id: user?.id ?? null,
            role_id: user?.role_id ?? null,
            store_id: user?.store_id ?? null,
            name: user?.name ?? null,
            phone: user?.phone ?? null,
            email: user?.email ?? null,
            username: user?.username ?? null,
            address: user?.address ?? null,
            orders: ordersMaped,
            status: user?.status ?? null,
            created_at: user?.createdAt?.toString(),
            updated_at: user?.updatedAt?.toString(),
        };
    }
    async productCategory(productCategory) {
        let productCategoryAttributes = await this.productCategoryAttributes(productCategory?.id ?? null);
        return {
            id: productCategory?.id ?? null,
            store_id: productCategory?.store_id ?? null,
            parent_id: productCategory?.parent_id ?? null,
            name: productCategory?.name ?? null,
            slug: productCategory?.slug ?? null,
            image: productCategory?.image ?? null,
            attributes: productCategoryAttributes,
            status: productCategory?.status ?? null,
            created_at: productCategory?.createdAt?.toString(),
            updated_at: productCategory?.updatedAt?.toString(),
        };
    }
    async productCategoryAttributes(product_category_id) {
        const productCategoryAttributes = await ProductCategoryAttribute_1.default.query().where('category_id', product_category_id);
        return productCategoryAttributes.map((productCategoryAttribute) => {
            return this.productCategoryAttribute(productCategoryAttribute);
        });
    }
    productCategoryAttribute(productCategoryAttribute) {
        return {
            id: productCategoryAttribute?.id ?? null,
            category_id: productCategoryAttribute?.category_id ?? null,
            name: productCategoryAttribute?.name ?? null,
            status: productCategoryAttribute?.status ?? null,
            created_at: productCategoryAttribute?.createdAt?.toString(),
            updated_at: productCategoryAttribute?.updatedAt?.toString(),
        };
    }
    media(media) {
        return {
            id: media?.id ?? null,
            type: media?.type ?? null,
            type_id: media?.type_id ?? null,
            src: `${Env_1.default.get('APP_URL')}/uploads/${media.src}`,
            status: media?.status ?? null,
        };
    }
    async product(product) {
        let mediaIds = product?.media_ids
            ? product.media_ids.split(',')
            : [];
        let medias = await Media_1.default.query()
            .whereIn('id', mediaIds)
            .where({ 'type': 'Product' })
            .then((medias) => {
            return medias.map((media) => {
                return `/uploads/${media.src}`;
            });
        });
        let productAttributes = await this.productAttribute(product?.id ?? null);
        let productFAQs = await this.productFAQs(product?.id ?? null);
        let productStore = await this.store(await Store_1.default.query().where('id', product?.store_id ?? null).first());
        return {
            id: product?.id ?? null,
            store_id: product?.store_id ?? null,
            store: productStore,
            category_id: product?.category_id ?? null,
            title: product?.title ?? null,
            short_description: product?.short_description ?? null,
            long_description: product?.long_description ?? null,
            html_content: product?.html_content ?? null,
            price: product?.price ?? 0,
            discount: product?.discount ?? 0,
            country_of_origin: product?.country_of_origin ?? null,
            image: medias,
            attributes: productAttributes,
            faqs: productFAQs,
            stock: product?.stock ?? 0,
            status: product?.status ?? null,
            created_at: product?.createdAt?.toString(),
            updated_at: product?.updatedAt?.toString(),
        };
    }
    async productAttribute(product_id) {
        const productAttributes = await ProductAttribute_1.default.query().preload('attribute').where('product_id', product_id);
        return productAttributes
            .filter((productAttribute) => productAttribute?.attribute)
            .map((productAttribute) => {
            return {
                id: productAttribute?.id ?? null,
                product_id: productAttribute?.product_id ?? null,
                attribute_id: productAttribute?.attribute_id ?? null,
                name: productAttribute?.name ?? null,
                value: productAttribute?.value ?? null,
                created_at: productAttribute?.createdAt?.toString(),
                updated_at: productAttribute?.updatedAt?.toString(),
            };
        });
    }
    async productFAQs(product_id) {
        const productFAQs = await ProductFAQ_1.default.query().where('product_id', product_id);
        return productFAQs.map((productFAQ) => {
            return this.productFAQ(productFAQ);
        });
    }
    async productFAQ(productFAQ) {
        return {
            id: productFAQ?.id ?? null,
            product_id: productFAQ?.product_id ?? null,
            question: productFAQ?.question ?? null,
            answer: productFAQ?.answer ?? null,
            created_at: productFAQ?.createdAt?.toString(),
            updated_at: productFAQ?.updatedAt?.toString(),
        };
    }
    async setting(setting) {
        if (!setting) {
            const settings = await Setting_1.default.all();
            let siteLogo = await Media_1.default.query().where({ 'type': 'Logo' }).first();
            let siteLogoSrc = siteLogo?.src
                ? `${Env_1.default.get('APP_URL')}/uploads/${siteLogo.src}`
                : null;
            let items = settings.map((setting) => {
                let key = setting.key;
                return { [key]: setting.value };
            });
            let settingItems = Object.assign({}, ...items);
            return { ...{ 'site_logo': siteLogoSrc }, ...settingItems };
        }
        return setting?.value ?? null;
    }
    async order(order) {
        let orderItems = await this.orderItems(order.id);
        return {
            id: order?.id ?? null,
            store_id: order?.store_id ?? null,
            user_id: order?.user_id ?? null,
            initial_price: order?.initial_price ?? 0,
            delivery_fee: order?.delivery_fee ?? 0,
            total_price: order?.total_price ?? 0,
            shipping_address: order?.shipping_address ?? null,
            billing_address: order?.billing_address ?? 0,
            items: orderItems,
            status: order?.status ?? null,
            created_at: order?.createdAt?.toString(),
            updated_at: order?.updatedAt?.toString(),
        };
    }
    async orderItems(order_id) {
        const orderItems = await OrderItem_1.default.query().where('order_id', order_id);
        return orderItems.map((orderItem) => {
            return this.orderItem(orderItem);
        });
    }
    async orderItem(orderItem) {
        return {
            id: orderItem?.id ?? null,
            order_id: orderItem?.order_id ?? null,
            product_id: orderItem?.product_id ?? null,
            quantity: orderItem?.quantity ?? 0,
            price: orderItem?.price ?? 0,
            total_price: orderItem?.total_price ?? 0,
            created_at: orderItem?.createdAt?.toString(),
            updated_at: orderItem?.updatedAt?.toString(),
        };
    }
    async store(store) {
        let mediaIds = store?.media_ids
            ? store.media_ids.split(',')
            : [];
        let medias = await Media_1.default.query()
            .whereIn('id', mediaIds)
            .where({ 'type': 'Store' })
            .then((medias) => {
            return medias.map((media) => {
                return `/uploads/${media.src}`;
            });
        });
        return {
            id: store?.id ?? null,
            user_id: store?.user_id ?? null,
            name: store?.name ?? null,
            site_name: store?.site_name ?? null,
            description: store?.description ?? null,
            type: store?.type ?? null,
            image: medias,
            status: store?.status ?? null,
            created_at: store?.createdAt?.toString(),
            updated_at: store?.updatedAt?.toString(),
        };
    }
}
exports.default = PersistService;
//# sourceMappingURL=PersistService.js.map