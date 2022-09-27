import { DateTime } from 'luxon'
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class Order extends BaseModel {
  public static table = 'orders'

  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: any

  @column()
  public store_id: any

  @column()
  public user_id: any

  @column()
  public initial_price: any

  @column()
  public delivery_fee: any

  @column()
  public total_price: any

  @column()
  public shipping_address: string

  @column()
  public billing_address: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
