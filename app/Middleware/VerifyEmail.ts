var kickbox = require("kickbox")
  .client(
    "live_fc67d0a50e5b238848197284678c1ea05d0992bc061dd8a8450bab0e3074acd7"
  )
  .kickbox();
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class VerifyMail {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    if (request.body().email) {
      const verify: any = await new Promise((resolve, reject) => {
        kickbox.verify(request.body().email, (err: object, result: object) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
      if (verify.body?.result !== "deliverable") {
        const message: string = `L'email ${request.body().email} n'existe pas!`;
        response.abort({ message }, 403);
        return;
      }
    }
    await next();
  }
}
