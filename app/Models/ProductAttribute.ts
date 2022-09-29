import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
//import ProductCategoryAttribute from './ProductCategoryAttribute'
import Product from './Product'

export default class ProductAttribute extends BaseModel {
  public static table = 'product_attributes'

  @column({ isPrimary: true })
  public id: number

  @column()
  public product_id: any

  @column()
  public attribute_id: any

  @column()
  public name: any

  @column()
  public value: any

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Product, {localKey: 'id', foreignKey: 'product_id'})
  public attribute: BelongsTo<typeof Product>
}
