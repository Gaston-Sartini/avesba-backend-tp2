import express from "express";
import validate, {
  validateQuery,
  validateParams,
} from "../middlewares/validate.js";
import {
  createUserSchema,
  changePasswordSchema,
  updateUserSchema,
  queryUsersSchema,
  userIdParamSchema,
} from "../schemas/userSchema.js";

function createUsersRouter(controller, { authenticate, authorize }) {
  const router = express.Router();

  router.use(authenticate);

  router.get("/me", controller.me);
  router.patch(
    "/me/password",
    validate(changePasswordSchema),
    controller.changeMyPassword,
  );

  router.get(
    "/",
    authorize("admin", "moderador"),
    validateQuery(queryUsersSchema),
    controller.list,
  );
  router.post(
    "/",
    authorize("admin"),
    validate(createUserSchema),
    controller.create,
  );
  router.get("/:id", validateParams(userIdParamSchema), controller.get);
  router.patch(
    "/:id",
    authorize("admin"),
    validateParams(userIdParamSchema),
    validate(updateUserSchema),
    controller.update,
  );
  router.delete(
    "/:id",
    authorize("admin"),
    validateParams(userIdParamSchema),
    controller.remove,
  );
  router.post(
    "/:id/reset-password",
    authorize("admin"),
    validateParams(userIdParamSchema),
    controller.resetPassword,
  );

  return router;
}

export default createUsersRouter;
