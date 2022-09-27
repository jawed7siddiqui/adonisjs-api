import { DateTime } from 'luxon'
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class OrderItem extends BaseModel {
  public static table = 'order_items'

  @column({ isPrimary: true })
  public id: number

  @column()
  public order_id: any

  @column()
  public product_id: any

  @column()
  public quantity: any

  @column()
  public price: any

  @column()
  public total_price: any

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
