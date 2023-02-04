"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var kickbox = require("kickbox")
    .client("live_fc67d0a50e5b238848197284678c1ea05d0992bc061dd8a8450bab0e3074acd7")
    .kickbox();
class VerifyMail {
    async handle({ request, response }, next) {
        if (request.body().email) {
            const verify = await new Promise((resolve, reject) => {
                kickbox.verify(request.body().email, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                });
            });
            if (verify.body?.result !== "deliverable") {
                const message = `L'email ${request.body().email} n'existe pas!`;
                response.abort({ message }, 403);
                return;
            }
        }
        await next();
    }
}
exports.default = VerifyMail;
//# sourceMappingURL=VerifyEmail.js.map