import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import jwt from "jsonwebtoken";
import Env from "@ioc:Adonis/Core/Env";
import Staff from "App/Models/Staff";

export default class AuthClass {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    const token: string | undefined = request.header("Authorization")?.split(' ')[1]
    if (!token) {
      response.abort({ error: "Pas d'utilisateur valide" }, 403);
    } else {
      try {
        const tokenUser = jwt.verify(token, Env.get("API_KEY"));
        const staff = await Staff.findBy("email_staff", tokenUser.email)
        if(staff){
            await next()
        }else{
            response.abort({error: "L'utilisateur n'existe plus"}, 403);
        }
      } catch (error) {
        console.log(error)
        response.abort({ error: "Pas d'utilisateur valide" }, 403);
      }
    }
  }
}
