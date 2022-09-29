"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Product"));
const GQLService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/GQLService"));
const PersistService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/PersistService"));
const resolvers = {
    Query: {
        async productDetails(_, { id }, {}) {
            const product = await Product_1.default.find(id);
            if (!product) {
                return (new GQLService_1.default()).error(404);
            }
            let productData = await (new PersistService_1.default()).product(product);
            return {
                "id": productData.id,
                "sku": "asdf125",
                "name": productData.title,
                "price": productData.price,
                "discount": productData.discount,
                "offerEnd": "October 2, 2020 12:11:00",
                "new": true,
                "rating": 5,
                "saleCount": 36,
                "category": [
                    "fashion",
                    "men"
                ],
                "tag": [
                    "fashion",
                    "men",
                    "jacket",
                    "full sleeve"
                ],
                "variation": [
                    {
                        "color": "white",
                        "image": "/assets/img/product/fashion/1.jpg",
                        "size": [
                            {
                                "name": "x",
                                "stock": 3
                            },
                            {
                                "name": "m",
                                "stock": 2
                            },
                            {
                                "name": "xl",
                                "stock": 5
                            }
                        ]
                    },
                    {
                        "color": "black",
                        "image": "/assets/img/product/fashion/8.jpg",
                        "size": [
                            {
                                "name": "x",
                                "stock": 4
                            },
                            {
                                "name": "m",
                                "stock": 7
                            },
                            {
                                "name": "xl",
                                "stock": 9
                            },
                            {
                                "name": "xxl",
                                "stock": 1
                            }
                        ]
                    },
                    {
                        "color": "brown",
                        "image": "/assets/img/product/fashion/3.jpg",
                        "size": [
                            {
                                "name": "x",
                                "stock": 1
                            },
                            {
                                "name": "m",
                                "stock": 2
                            },
                            {
                                "name": "xl",
                                "stock": 4
                            },
                            {
                                "name": "xxl",
                                "stock": 0
                            }
                        ]
                    }
                ],
                "image": productData.image,
                "shortDescription": productData.short_description,
                "fullDescription": productData.long_description,
            };
        },
    },
};
module.exports = resolvers;
//# sourceMappingURL=ProductDetailsResolver.js.map