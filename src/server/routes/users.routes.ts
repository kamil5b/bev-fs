import { Elysia } from "elysia";
import { usersController } from "../controller/users.controller";

export default new Elysia({ prefix: "/users" })
  .get("/", ctx => usersController.list(ctx))
  .get("/:id", ctx => usersController.get(ctx))
  .post("/", ctx => usersController.create(ctx));
