"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Membre_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Membre"));
const Env_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Env"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Mail_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Addons/Mail"));
const Application_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Application"));
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
class MembresController {
    async addMember({ request, response }) {
        const body = request.body();
        const { nom, prenom, date_naissance, metier, phone, adresse, genre, email, password, qst, } = body;
        if (email) {
            const schemas = Validator_1.schema.create({
                email: Validator_1.schema.string([Validator_1.rules.email(), Validator_1.rules.unique({ table: "membres", column: "email" })]),
                password: Validator_1.schema.string([Validator_1.rules.minLength(8)])
            });
            try {
                await request.validate({
                    schema: schemas
                });
            }
            catch (error) {
                var messages = error.messages.errors.map((item) => item.message);
                response.abort({ message: messages.join(", ") }, 403);
            }
        }
        const user = await Membre_1.default.create({
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
            const token = await jsonwebtoken_1.default.sign({ email: user.email }, Env_1.default.get("API_KEY"), {
                expiresIn: 5 * 60,
            });
            const mailto = user.email;
            const url = `http://127.0.0.1:3333/verify/add/${token}`;
            Mail_1.default.send((message) => {
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
        }
        const message = "Ajout terminé";
        if (user.email) {
            const tokenUser = await jsonwebtoken_1.default.sign({ email: user.email }, Env_1.default.get("API_KEY"), { expiresIn: '30d' });
            response.status(200);
            response.send({ message, tokenUser });
            response.finish();
        }
        else {
            response.status(200);
            response.send({ message });
            response.finish();
        }
    }
    async login({ request, response, auth }) {
        const { email, password } = request.body();
        try {
            const user = await auth.attempt(email, password);
            response.send({ message: "success", user: user.user.$original, token: user.token });
        }
        catch (error) {
            if (error.responseText === "E_INVALID_AUTH_UID: User not found") {
                response.send({ message: "Email introuvable!" });
            }
            else {
                response.send({ message: "Mot de passe erroné!" });
            }
        }
    }
    async check({ response, auth }) {
        try {
            const tokenUser = await auth.use("api").authenticate();
            response.send({ user: tokenUser.$original });
        }
        catch (error) {
            response.abort({ message: "Error de connexion!" }, 401);
        }
        response.finish();
    }
    async logout({ response, auth }) {
        await auth.logout();
        response.finish();
    }
}
exports.default = MembresController;
//# sourceMappingURL=MembresController.js.map