import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import bcrypt from "bcrypt"

export default class Staff extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email_staff: string

  @column()
  public password_staff: string

  @column()
  public is_staff_verified: boolean | false

  @column()
  public photo_cin_staff: string | null

  @column()
  public photo_staff: string | null

  @column()
  public num_cin_staff: bigint

  @column()
  public fonction: string | "staff"

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: Staff) {
    if (user.password_staff) {
      user.password_staff = await bcrypt.hash(user.password_staff, 10)
    }
  }
}
