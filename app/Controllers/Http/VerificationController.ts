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
      return view.render("token", { error: "Token expiré!" });
    }
  }
  public async sendToken({ request, response }: HttpContextContract) {
    const { email } = request.body();
    const token = await jwt.sign({ email }, Env.get("API_KEY"), {
      expiresIn: 5 * 60,
    });
    const mailto: string = email;
    const url: string = `https://api.teraka.org/verify/add/${token}`;
    try {
      await Mail.send((message) => {
        message
          .encoding("utf-8")
          .embed(Application.publicPath("/images/logo.png"), "image-id-logo")
          .from("noreply@teraka.com")
          .to(mailto)
          .subject("Validation email").html(`
          <div style="padding:20px;background: linear-gradient(to right, #3e5151, #decba4);">
                <img src="cid:image-id-logo" alt="Logo teraka" style="display: block;width: 400px;margin-left: auto;margin-right:auto;">
                <h1 style="text-align: center">
                  Vérification d'email:
                </h1>
                <p style="text-align: center">Pour profiter nos services, veuillez vérifier votre email</p>
                <a style="display: block;width: 100px;text-align:center;text-decoration: none;background: #3e5151;border: none;font-size: 20px;padding: 10px;border-radius: 7px;color: #decba4;margin-left: auto;margin-right:auto;" href="${url}">Vérifier</a>
            </div>
        `);
      });
      response.status(200);
      response.send({ message: "Visitez votre email!" });
      response.finish();
    } catch (error) {
      console.log(error);
      response.abort({ error: "Réessayer plus tard..." }, 503);
    }
  }
  public async resetPassword({ request, view }: HttpContextContract) {
    const token = request.param("token");
    try {
      const payload = jwt.verify(token, Env.get("API_KEY"));
      const user = await Membre.findBy("email", payload.email);
      if (user) {
        user.is_verified = true;
        await user.save();
        return view.render("reset", { token: token });
      } else {
        return view.render("token", { error: "Token invalid!" });
      }
    } catch (error) {
      console.log("Error");
      return view.render("token", { error: "Token expiré!" });
    }
  }
}
