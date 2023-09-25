import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Membre from "App/Models/Membre";
import Env from "@ioc:Adonis/Core/Env";
import jwt from "jsonwebtoken";
import Mail from "@ioc:Adonis/Addons/Mail";
import Application from "@ioc:Adonis/Core/Application";

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
      qst: number;
      reponse: string;
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
      qst, 
      reponse
    }: TUser = body;
    try {
      if (body.email) {
        const token = await jwt.sign(
          { email: body.email },
          Env.get("API_KEY"),
          {
            expiresIn: 5 * 60,
          }
        );
        const mailto: string = body.email;
        const url: string = `${Env.get("DOMAIN")}/verify/add/${token}`;
        try {
          await Mail.send((message) => {
            message
              .encoding("utf-8")
              .embed(
                Application.publicPath("/images/logo.png"),
                "image-id-logo"
              )
              .from("contact@teraka.org")
              .to(mailto)
              .subject("Validation email").html(`
                <div style="padding:20px;background: linear-gradient(to right, #3e5151, #decba4);">
                    <img src="cid:image-id-logo" alt="Logo TERAKA" style="display: block;width: 200px;margin-left: auto;margin-right:auto;">
                    <h1 style="text-align: center">
                        Vérification d'email:
                    </h1>
                    <p style="text-align: center">Pour profiter nos services, veuillez vérifier votre email</p>
                    <a style="display: block;width: 100px;text-align:center;text-decoration: none;background: #3e5151;border: none;font-size: 20px;padding: 10px;border-radius: 7px;color: #decba4;margin-left: auto;margin-right:auto;" href="${url}">Vérifier</a>
                </div>
            `);
          });
        } catch (error) {
          console.log(error);
          response.abort({ error: "Echec d'envoi de l'email" }, 503);
        }
      }
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
        questionnaire: qst,
        reponse
      });
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
  public async updateFormation({
    request,
    response,
    auth,
  }: HttpContextContract) {
    try {
      await auth.use("api").authenticate();
      await Membre.query()
        .where("id", request.body().id)
        .update("formation", `${JSON.stringify(request.body().formation)}`);
    } catch (error) {
      console.log(error);
      response.abort({ error: "Modification base de donnée échouée!" }, 503);
    }
    response.finish();
  }
  
  public async resetpassFindUser({ request, response }: HttpContextContract) {
    const { username }: any = request.qs();
    try {
      const user = await Membre.query().where("pseudo", username).orWhere("email", username);
      if(user.length > 0){
        response.send({
          user: { email: user[0].email, question: user[0].questionnaire, id: user[0].id },
        });
      }
      response.finish();
    } catch (error) {
      response.abort({ error: "Pas d'utilisateur valide!" }, 403);
    }
  }
  public async sendTokenmail({ request, response }: HttpContextContract) {
    const { email }: any = request.body();
    try {
      const curr = await Membre.findByOrFail("email", email);
      const token = await jwt.sign({ pseudo: curr.pseudo }, Env.get("API_KEY"), {
        expiresIn: 5 * 60,
      });
      const url: string = `${Env.get("FRONT_DOMAIN")}/renew/${token}`;
      try {
        const mail = await Mail.send((message) => {
          message
            .encoding("utf-8")
            .from("contact@teraka.org")
            .embed(
              Application.publicPath("/images/logo.png"),
              "image-id-logo"
            )
            .to(email)
            .subject("Validation email").html(`
            <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Document</title>
              </head>
                <body>
                  <img src="cid:image-id-logo" alt="Logo TERAKA" style="display: block;width: 200px;margin-left: auto;margin-right:auto;">
                  <h1 style="text-align: center">
                  Vérification d'email:
                  </h1>
                  <p style="text-align: center">Pour profiter nos services, veuillez vérifier votre email</p>
                  <a style="display: block;width: 100px;text-align:center;text-decoration: none;background: #3e5151;border: none;font-size: 20px;padding: 10px;border-radius: 7px;color: #decba4;margin-left: auto;margin-right:auto;" href="${url}">Vérifier</a>
                </body>
              </html>
            `);
        });
        console.log(mail);
        response.send({ message: "Lien envoyé, vérifier votre boîte email" });
        response.finish();
      } catch (error) {
        console.log(error);
        response.abort({ error: "Echec d'envoi de l'email" }, 503);
      }
    } catch (error) {
      response.abort({error: "Utilisateur invalide!"}, 403);
    }
  }
  public async checkqst({ request, response }: HttpContextContract) {
    const { id, reponse }: any = request.body();
    try {
      const curr: Membre = await Membre.findOrFail(id);
      if (!curr.reponse.includes(reponse)) throw new Error("Réponse incorrect");
      const token = await jwt.sign(
        { pseudo: curr.pseudo },
        Env.get("API_KEY"),
        {
          expiresIn: 5 * 60,
        }
      );
      const url: string = `/renew/${token}`;
      response.send({ message: "Réponse correct", url });
      response.finish();
    } catch (error) {
      console.log(error);
      response.abort({ error: "Réponse incorrect" }, 403);
    }
  }
  public async modifypassword({ request, response }: HttpContextContract) {
    const { pseudo, password }: any = request.body();
    try {
      const curr: Membre = await Membre.findByOrFail("pseudo", pseudo);
      curr.password = password;
      curr.save();
      response.send({ message: "Mot de passe changé" });
      response.finish();
    } catch (error) {
      console.log(error);
      response.abort({ error: "Changement échoué" }, 403);
    }
  }
}
