import { z } from "zod";
import { password, registerSchema } from "./authSchema.js";

const ROLES = ["jugador", "moderador", "admin"];
const role = z.enum(ROLES, {
  error: "El rol debe ser 'jugador', 'moderador' o 'admin'",
});

const createUserSchema = registerSchema.extend({
  role: role.default("jugador"),
});

const changePasswordSchema = z.object({
  current_password: z
    .string({ error: "La contraseña actual es obligatoria" })
    .min(1, "La contraseña actual es obligatoria"),
  new_password: password,
});

const updateUserSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .max(100)
    .optional(),
  apellido: z
    .string()
    .trim()
    .min(1, "El apellido no puede estar vacío")
    .max(100)
    .optional(),
  role: role.optional(),
  is_active: z.boolean({ error: "is_active debe ser true o false" }).optional(),
});

const queryUsersSchema = z.object({
  page: z.coerce
    .number()
    .int("La página debe ser un entero")
    .positive("La página debe ser mayor a 0")
    .default(1),
  per_page: z.coerce
    .number()
    .int("per_page debe ser un entero")
    .positive("per_page debe ser mayor a 0")
    .max(100, "per_page no puede ser mayor a 100")
    .default(20),
  role: role.optional(),
});

const userIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser un número positivo"),
});

export {
  ROLES,
  createUserSchema,
  changePasswordSchema,
  updateUserSchema,
  queryUsersSchema,
  userIdParamSchema,
};
