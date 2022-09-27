import { DateTime } from 'luxon'
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class Media extends BaseModel {
  public static table = 'medias'

  @column({ isPrimary: true })
  public id: number

  @column()
  public type: string

  @column()
  public type_id: any

  @column()
  public src: any

  @column()
  public description: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
