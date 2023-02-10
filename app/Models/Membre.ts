import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import Hash from "@ioc:Adonis/Core/Hash"

export default class Membre extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nom: string

  @column()
  public prenom: string

  @column()
  public date_naissance: Date | string

  @column()
  public metier: string

  @column()
  public phone: string

  @column()
  public adresse: JSON

  @column()
  public genre: string

  @column()
  public email: string | null

  @column({serializeAs: null})
  public password: string | null

  @column()
  public qst: JSON

  @column()
  public is_verified: boolean | false

  @column()
  public photo_cin: string | null

  @column()
  public photo: string | null

  @column()
  public num_cin: bigint | null

  @column()
  public id_pg: number | null

  @column()
  public staff: JSON | null


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: Membre) {
    if (user.$dirty.password && user.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
