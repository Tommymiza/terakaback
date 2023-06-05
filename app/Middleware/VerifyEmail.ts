import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import axios from "axios";

export default class VerifyMail {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    if (request.body().email) {
      const promise: any = await new Promise((resolve, reject) => {
        const apiKey = "458c485f90e740e5b62f298506505e9e";
        const apiUrl = `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${request.body().email}`;

        axios
          .get(apiUrl)
          .then((response) => {
            const data = response.data;
            resolve(data)
          })
          .catch((error) => {
            console.error(
              "Une erreur est survenue lors de la vérification de l'email.",
              error
            );
            reject(error)
          });
      });
      console.log(promise);
      if (promise.status !== "valid") {
        response.abort({ error: "Email n'existe pas!" }, 403);
      }
    }
    await next();
  }
}
