/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})
Route.post('/ajoutmembre', "MembresController.addMember").middleware('verifyEmail')
Route.post("/login", "MembresController.login").as("login")
Route.post("/updateformation", "MembresController.updateFormation")
Route.get("/getuser", "MembresController.check")
Route.post("/logout", "MembresController.logout").as("logout")
Route.get("/verify/add/:token", "VerificationController.ajoutMembre")
Route.post("/generate", "VerificationController.sendToken")
Route.get("/getstaff", "StaffController.getinfo")
Route.post("/loginstaff", "StaffController.login")
Route.post("/ajoutstaff", "StaffController.add")
Route.group(()=>{
  Route.get("/membre/all", "MembresController.all")
  Route.get("/staff/all", "StaffController.all")
}).middleware("authStaff")
