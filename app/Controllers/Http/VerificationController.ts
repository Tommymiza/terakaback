import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import jwt from "jsonwebtoken";
import Env from "@ioc:Adonis/Core/Env";
import Membre from "App/Models/Membre";
import Application from "@ioc:Adonis/Core/Application";
import Mail from "@ioc:Adonis/Addons/Mail";

export default class VerficationController {
  public async ajoutMembre({ request, view }: HttpContextContract) {
    const token = request.param("token");
    try {
      const payload = jwt.verify(token, Env.get("API_KEY"));
      const user = await Membre.findBy("email", payload.email);
      if (user) {
        user.is_verified = true;
        await user.save();
        return view.render("token", { message: "Vérification Terminé!" });
      } else {
        return view.render("token", { error: "Token invalid!" });
      }
    } catch (error) {
      console.log("Error");

      if (error) {
        return view.render("token", { error: "Token expiré!" });
      }
    }
  }
  public async sendToken({ request, response }: HttpContextContract) {
    const { email } = request.body();
    const token = await jwt.sign({ email }, Env.get("API_KEY"), {
      expiresIn: 5 * 60,
    });
    const mailto: string = email;
    const url: string = `http://13.112.105.248/verify/add/${token}`;
    try {
      await Mail.send((message) => {
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
      response.send({ message: "Lien envoyé avec succès!" });
    } catch (error) {
      response.send({ error: "Veuillez réessayer" });
    }
    response.finish();
  }
}
