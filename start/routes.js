"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Route_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Route"));
Route_1.default.get('/', async () => {
    return { hello: 'world' };
});
Route_1.default.post('/ajoutmembre', "MembresController.addMember").middleware('verifyEmail');
Route_1.default.post("/login", "MembresController.login").as("login");
Route_1.default.get("/getuser", "MembresController.check");
Route_1.default.post("/logout", "MembresController.logout").as("logout");
Route_1.default.get("/verify/add/:token", "VerificationController.ajoutMembre");
Route_1.default.post("/generate", "VerificationController.sendToken");
//# sourceMappingURL=routes.js.map