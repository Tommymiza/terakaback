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
  public pseudo: string
  
  @column()
  public password: string
  
  @column()
  public email: string | null

  @column()
  public ln: string

  @column()
  public time: string | null

  @column()
  public adresse: JSON

  @column()
  public role: string

  @column()
  public is_pg: string

  @column()
  public pg_number: string | null
  
  @column()
  public is_verified: boolean | false

  @column()
  public photo_cin: string | null

  @column()
  public photo: string | null

  @column()
  public num_cin: bigint | null


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
