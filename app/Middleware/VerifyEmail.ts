var emailVerify = require("kickbox").client("live_d2f1e696c72fc53afb00d7f848fde71552032e84613a95908bd17f76a048018f").kickbox();
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Env from "@ioc:Adonis/Core/Env"

export default class VerifyMail {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    if (request.body().email) {
      const verify: any =  await new Promise((resolve, reject) => {
        emailVerify.verify(request.body().email, (err: object, result: object) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
      if(verify.body.result !== "deliverable"){
        response.abort({error: "Cet email n'existe pas"}, 403)
        return;
      }
    }
    await next();
  }
}
