import Env from '@ioc:Adonis/Core/Env';
import Media from 'App/Models/Media';
import Order from 'App/Models/Order';
import OrderItem from 'App/Models/OrderItem';
import ProductAttribute from 'App/Models/ProductAttribute';
import ProductCategoryAttribute from 'App/Models/ProductCategoryAttribute';
import ProductFAQ from 'App/Models/ProductFAQ';
import Setting from "App/Models/Setting";
import Store from 'App/Models/Store';

export default class PersistService {
    public role(role: any) {
        return {
            id: role?.id ?? null,
            name: role?.name ?? null,
            status: role?.status ?? null,
            created_at: role?.createdAt?.toString(),
            updated_at: role?.updatedAt?.toString(),
        };
    }

    public async user(user: any) {
        let ordersMaped:any = [];

        if (user.role_id == 7) {
            let orders = await Order.query().where('user_id', user.id);

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

    public async productCategory(productCategory: any) {
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

    public async productCategoryAttributes(product_category_id: any) {
        const productCategoryAttributes = await ProductCategoryAttribute.query().where('category_id', product_category_id);

        return productCategoryAttributes.map((productCategoryAttribute) => {
            return this.productCategoryAttribute(productCategoryAttribute);
        });
    }

    public productCategoryAttribute(productCategoryAttribute: any) {
        return {
            id: productCategoryAttribute?.id ?? null,
            category_id: productCategoryAttribute?.category_id ?? null,
            name: productCategoryAttribute?.name ?? null,
            status: productCategoryAttribute?.status ?? null,
            created_at: productCategoryAttribute?.createdAt?.toString(),
            updated_at: productCategoryAttribute?.updatedAt?.toString(),
        };
    }

    public media(media: any) {
        return {
            id: media?.id ?? null,
            type: media?.type ?? null,
            type_id: media?.type_id ?? null,
            src: `${Env.get('APP_URL')}/uploads/${media.src}`,
            status: media?.status ?? null,
        };
    }

    public async product(product: any) {
        let mediaIds = product?.media_ids
            ? product.media_ids.split(',')
            : [];

        let medias = await Media.query()
            .whereIn('id', mediaIds)
            .where({'type': 'Product'})
            .then((medias) => {
                return medias.map((media) => {
                    // return `${Env.get('APP_URL')}/uploads/${media.src}`;
                    return `/uploads/${media.src}`;
                });
            });

        let productAttributes = await this.productAttribute(product?.id ?? null);

        let productFAQs = await this.productFAQs(product?.id ?? null);

        let productStore = await this.store(
            await Store.query().where('id', product?.store_id ?? null).first()
        );

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

    public async productAttribute(product_id: any) {
        const productAttributes = await ProductAttribute.query().preload('attribute').where('product_id', product_id);

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

    public async productFAQs(product_id: any) {
        const productFAQs = await ProductFAQ.query().where('product_id', product_id);

        return productFAQs.map((productFAQ) => {
            return this.productFAQ(productFAQ);
        });
    }

    public async productFAQ(productFAQ: any) {
        return {
            id: productFAQ?.id ?? null,
            product_id: productFAQ?.product_id ?? null,
            question: productFAQ?.question ?? null,
            answer: productFAQ?.answer ?? null,
            created_at: productFAQ?.createdAt?.toString(),
            updated_at: productFAQ?.updatedAt?.toString(),
        };
    }

    public async setting(setting?: any | null) {
        if (! setting) {
            const settings = await Setting.all();

            let siteLogo = await Media.query().where({'type': 'Logo'}).first();

            let siteLogoSrc = siteLogo?.src
                ? `${Env.get('APP_URL')}/uploads/${siteLogo.src}`
                : null;

            let items = settings.map((setting) => {
                let key = setting.key;

                return {[key]: setting.value};
            });

            let settingItems = Object.assign({}, ...items);

            return {...{'site_logo': siteLogoSrc}, ...settingItems};
        }

        return setting?.value ?? null;
    }

    public async order(order: any) {
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

    public async orderItems(order_id: any) {
        const orderItems = await OrderItem.query().where('order_id', order_id);

        return orderItems.map((orderItem) => {
            return this.orderItem(orderItem);
        });
    }

    public async orderItem(orderItem: any) {
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

    public async store(store: any) {
        let mediaIds = store?.media_ids
            ? store.media_ids.split(',')
            : [];

        let medias = await Media.query()
            .whereIn('id', mediaIds)
            .where({'type': 'Store'})
            .then((medias) => {
                return medias.map((media) => {
                    // return `${Env.get('APP_URL')}/uploads/${media.src}`;
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
