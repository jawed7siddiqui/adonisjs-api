import { DateTime } from 'luxon'
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class Store extends BaseModel {
  public static table = 'stores'

  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: any

  @column()
  public name: string

  @column()
  public site_name: string

  @column()
  public description: string

  @column()
  public type: string

  @column()
  public media_ids: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
