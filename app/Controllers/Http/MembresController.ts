import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Membre from "App/Models/Membre";
import Env from "@ioc:Adonis/Core/Env";
import jwt from "jsonwebtoken";
import Mail from "@ioc:Adonis/Addons/Mail";
import Application from "@ioc:Adonis/Core/Application";
import { schema, rules } from "@ioc:Adonis/Core/Validator"

export default class MembresController {
  public async addMember({ request, response }: HttpContextContract) {
    interface TUser {
      nom: string;
      prenom: string;
      date_naissance: Date;
      metier: string;
      phone: string;
      adresse: JSON;
      genre: string;
      email: string | null;
      password: string | null;
      qst: JSON;
    }
    const body: any = request.body();
    const {
      nom,
      prenom,
      date_naissance,
      metier,
      phone,
      adresse,
      genre,
      email,
      password,
      qst,
    }: TUser = body;
    if(email){
      const schemas = schema.create({
        email: schema.string([rules.email(), rules.unique({table: "membres", column: "email"})]),
        password: schema.string([rules.minLength(8)])
      })
      try {
        await request.validate({
          schema: schemas
        })
      } catch (error) {
        var messages: Array<string> = error.messages.errors.map((item: {message: string})=> item.message)
        response.abort({message: messages.join(", ")}, 403)
      }
    }
    const user = await Membre.create({
      nom,
      prenom,
      date_naissance,
      metier,
      phone,
      adresse,
      genre,
      email,
      password,
      qst,
    });
    if (user.email) {
      const token = await jwt.sign({ email: user.email }, Env.get("API_KEY"), {
        expiresIn: 5 * 60,
      });
      const mailto: string = user.email;
      const url: string = `http://13.112.105.248/verify/add/${token}`;
      Mail.send((message) => {
        message
          .encoding("utf-8")
          .embed(Application.publicPath("/images/logo.png"), "image-id-logo")
          .from("noreply@teraka.com")
          .to(mailto)
          .subject("Vérification d'email").html(`
          <div style="padding:20px;background: linear-gradient(to right, #3e5151, #decba4);">
                <img src="cid:image-id-logo" alt="Logo teraka" style="display: block;width: 400px;margin-left: auto;margin-right:auto;">
                <h1 style="text-align: center">
                    Vérification d'Email:
                </h1>
                <p style="text-align: center">En acceptant les conditions d'utilisation de notre site, vous devriez vérifier votre email en cliquant sur le lien ci-dessous</p>
                <a style="display: block;width: 100px;text-align:center;text-decoration: none;background: #3e5151;border: none;font-size: 20px;padding: 10px;border-radius: 7px;color: #decba4;margin-left: auto;margin-right:auto;" href="${url}">Vérifier</a>
            </div>
        `);
      });
    }
    const message: string = "Ajout terminé";
    if (user.email) {
      const tokenUser = await jwt.sign(
        { email: user.email },
        Env.get("API_KEY"),
        { expiresIn: '30d' }
      );
      response.status(200)
      response.send({message, tokenUser})
      response.finish()
    }else{
      response.status(200)
      response.send({message})
      response.finish()
    }
  }
  public async login({request, response, auth}: HttpContextContract){
    const {email, password} = request.body()
    try {
      const user = await auth.attempt(email, password)
      response.send({message: "success", user: user.user.$original, token: user.token})
    } catch (error) {
      if(error.responseText === "E_INVALID_AUTH_UID: User not found"){
        response.send({message: "Email introuvable!"})
      }else{
        response.send({message: "Mot de passe erroné!"})
      }
    }
  }
  public async check({ response,  auth}: HttpContextContract){
    try {
      const tokenUser = await auth.use("api").authenticate()
      response.send({user: tokenUser.$original})
    } catch (error) {
      response.abort({message: "Error de connexion!"}, 401)
    }
    response.finish()
  }
  public async logout({response, auth}: HttpContextContract){
    await auth.logout()
    response.finish()
  }
}
