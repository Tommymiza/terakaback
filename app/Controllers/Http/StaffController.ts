import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Staff from "App/Models/Staff";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Env from "@ioc:Adonis/Core/Env";
import Database from "@ioc:Adonis/Lucid/Database";

export default class StaffController {
  public async add({ request, response }: HttpContextContract) {
    interface TStaff {
      email_staff: string;
      password_staff: string;
      fonction: string;
      num_cin_staff: bigint;
      photo_cin_staff: string | null;
      photo_staff: string | null;
    }
    const req: any = request.body();
    const {
      email_staff,
      password_staff,
      fonction,
      num_cin_staff,
      photo_cin_staff,
      photo_staff,
    }: TStaff = req;
    try {
      await Staff.create({
        email_staff,
        password_staff,
        fonction,
        num_cin_staff,
        photo_cin_staff,
        photo_staff,
      });
      response.status(200);
      response.send({ message: "Staff en attente de vérification" });
      response.finish();
    } catch (error) {
      response.abort({ error }, 500);
    }
  }
  public async login({ request, response }: HttpContextContract) {
    const { username, password } = request.body();
    const staff = await Staff.findBy("email_staff", username);
    response.status(200);
    if (staff) {
      const authenticated: boolean = await bcrypt.compare(
        password,
        staff.password_staff
      );
      if (authenticated) {
        const token = await jwt.sign(
          { email: staff.email_staff },
          Env.get("API_KEY"),
          { expiresIn: "30d" }
        );
        response.send({ message: "Bienvenue à bord!", user: staff, token });
      } else {
        response.send({ error: "Mot de passe incorrect!" });
      }
    } else {
      response.send({ error: "L'utilisateur n'existe pas!" });
    }
    response.finish();
  }
  public async getinfo({ request, response }: HttpContextContract) {
    const token: string | undefined = request
      .header("Authorization")
      ?.split(" ")[1];
    if (!token) {
      response.abort({ error: "Pas d'utilisateur valide" }, 403);
    } else {
      try {
        const tokenUser = jwt.verify(token, Env.get("API_KEY"));
        const staff = await Staff.findBy("email_staff", tokenUser.email);
        if (staff) {
          response.status(200);
          response.send({ user: staff });
          response.finish();
        } else {
          response.abort({ error: "L'utilisateur n'existe plus" }, 403);
        }
      } catch (error) {
        console.log(error);
        response.abort({ error: "Pas d'utilisateur valide" }, 403);
      }
    }
  }
  public async all({ response }: HttpContextContract) {
    const staff = await Database.from("staff").select([
      "id",
      "email_staff",
      "fonction",
      "photo_cin_staff",
      "photo_staff",
    ]);
    response.status(200);
    response.send({ items: staff });
    response.finish();
  }
}
