import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Membre from "App/Models/Membre";
import Env from "@ioc:Adonis/Core/Env";
import jwt from "jsonwebtoken";
import Mail from "@ioc:Adonis/Addons/Mail";
import Application from "@ioc:Adonis/Core/Application";
import Database from "@ioc:Adonis/Lucid/Database";

export default class MembresController {
  public async addMember({ request, response, auth }: HttpContextContract) {
    interface TUser {
      nom: string;
      prenom: string;
      pseudo: string;
      password: string;
      email: string | null;
      ln: string;
      adresse: JSON;
      phone: string | null;
      role: string;
      is_pg: string;
      id_pg: string | null;
      pg_number: string | null;
    }
    const body: any = request.body();
    const {
      nom,
      prenom,
      pseudo,
      password,
      email,
      ln,
      adresse,
      phone,
      role,
      is_pg,
      id_pg,
    }: TUser = body;
    try {
      const user = await Membre.create({
        nom,
        prenom,
        pseudo,
        password,
        email,
        ln,
        adresse,
        phone,
        role,
        is_pg,
        id_pg,
      });
      if (user.email) {
        const token = await jwt.sign(
          { email: user.email },
          Env.get("API_KEY"),
          {
            expiresIn: 5 * 60,
          }
        );
        const mailto: string = user.email;
        const url: string = `https://api.teraka.org/verify/add/${token}`;
        try {
          const mail = await Mail.send((message) => {
            message
              .encoding("utf-8")
              .embed(
                Application.publicPath("/images/logo.png"),
                "image-id-logo"
              )
              .from("noreply@teraka.org")
              .to(mailto)
              .subject("Validation email").html(`
                <div style="padding:20px;background: linear-gradient(to right, #3e5151, #decba4);">
                    <img src="cid:image-id-logo" alt="Logo TERAKA" style="display: block;width: 400px;margin-left: auto;margin-right:auto;">
                    <h1 style="text-align: center">
                        Vérification d'email:
                    </h1>
                    <p style="text-align: center">Pour profiter nos services, veuillez vérifier votre email</p>
                    <a style="display: block;width: 100px;text-align:center;text-decoration: none;background: #3e5151;border: none;font-size: 20px;padding: 10px;border-radius: 7px;color: #decba4;margin-left: auto;margin-right:auto;" href="${url}">Vérifier</a>
                </div>
            `);
          });
          console.log(mail);
        } catch (error) {
          console.log(error);
          response.abort({ error: "Echec d'envoi de l'email" }, 503);
        }
      }
      const user_connected = await auth.attempt(pseudo, password);
      const message = "L'ajout est effectuée!";
      response.status(200);
      response.send({
        message,
        token: user_connected.token,
        user,
        // tokenHash: user_connected.tokenHash,
      });
      response.finish();
    } catch (error) {
      console.log(error);
      if (error.sqlMessage) {
        if (error.sqlMessage.includes("email_unique")) {
          response.abort({ error: "Cet email est déjà utilisé" }, 503);
        } else if (error.sqlMessage.includes("pseudo_unique")) {
          response.abort({ error: "Le pseudo est déjà utilisé" }, 503);
        } else {
          response.abort({ error: error.sqlMessage }, 503);
        }
      }
      response.abort({ error: "Erreur d'ajout" }, 503);
    }
  }
  public async login({ request, response, auth }: HttpContextContract) {
    const { pseudo, password } = request.body();
    try {
      const user = await auth.attempt(pseudo, password);
      response.send({
        message: "Bienvenue à bord!",
        user: user.user.$original,
        token: user.token,
        // tokenHash: user.tokenHash,
      });
    } catch (error) {
      if (error.responseText === "E_INVALID_AUTH_UID: User not found") {
        response.abort({ error: "L'utilisateur n'existe pas" }, 403);
      } else {
        response.abort({ error: "Le mot de passe est incorrect" }, 403);
      }
    }
  }
  public async check({ response, auth }: HttpContextContract) {
    try {
      const user = await auth.use("api").authenticate();
      response.send({ user: user.$original });
    } catch (error) {
      response.abort({ error: "Session expirée!" }, 401);
    }
    response.finish();
  }
  public async logout({ response, auth }: HttpContextContract) {
    try {
      await auth.use("api").revoke();
      response.status(200);
      response.finish();
    } catch (error) {
      console.log(error);
      response.abort({ error: "Veuillez réesayer!" }, 500);
    }
  }
  public async all({ request, response }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = 10;
    const users = await Database.from("membres").paginate(page, limit);
    users.forEach((item) => {
      const datenais = new Date(item.date_naissance);
      const day =
        datenais.getDate() < 10
          ? "0" + datenais.getDate().toString()
          : datenais.getDate().toString();
      const month =
        datenais.getMonth() + 1 < 10
          ? "0" + (datenais.getMonth() + 1)
          : datenais.getMonth() + 1;
      item.date_naissance = day + "-" + month + "-" + datenais.getFullYear();
    });
    response.status(200);
    response.send({ items: users });
    response.finish();
  }
}
