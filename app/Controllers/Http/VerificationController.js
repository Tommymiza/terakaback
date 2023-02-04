"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Env_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Env"));
const Membre_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Membre"));
const Application_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Application"));
const Mail_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Addons/Mail"));
class VerficationController {
    async ajoutMembre({ request, view }) {
        const token = request.param("token");
        try {
            const payload = jsonwebtoken_1.default.verify(token, Env_1.default.get("API_KEY"));
            const user = await Membre_1.default.findBy("email", payload.email);
            if (user) {
                user.is_verified = true;
                await user.save();
                return view.render("token", { message: "Vérification Terminé!" });
            }
            else {
                return view.render("token", { error: "Token invalid!" });
            }
        }
        catch (error) {
            console.log("Error");
            if (error) {
                return view.render("token", { error: "Token expiré!" });
            }
        }
    }
    async sendToken({ request, response }) {
        const { email } = request.body();
        const token = await jsonwebtoken_1.default.sign({ email }, Env_1.default.get("API_KEY"), {
            expiresIn: 5 * 60,
        });
        const mailto = email;
        const url = `http://127.0.0.1:3333/verify/add/${token}`;
        try {
            await Mail_1.default.send((message) => {
                message
                    .encoding("utf-8")
                    .embed(Application_1.default.publicPath("/images/logo.png"), "image-id-logo")
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
        }
        catch (error) {
            response.send({ error: "Veuillez réessayer" });
        }
        response.finish();
    }
}
exports.default = VerficationController;
//# sourceMappingURL=VerificationController.js.map