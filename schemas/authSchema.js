import { z } from "zod";

const password = z
  .string({ error: "La contraseña es obligatoria" })
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede tener más de 72 caracteres");

const nombre = (label) =>
  z
    .string({ error: `El ${label} es obligatorio` })
    .trim()
    .min(1, `El ${label} no puede estar vacío`)
    .max(100, `El ${label} no puede tener más de 100 caracteres`);

const email = z.email({ error: "Debe ser un correo electrónico válido" });

const registerSchema = z.object({
  nombre: nombre("nombre"),
  apellido: nombre("apellido"),
  email,
  password,
});

const loginSchema = z.object({
  email,
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria"),
});

const refreshSchema = z
  .object({
    refresh_token: z
      .string()
      .min(1, "El refresh_token no puede estar vacío")
      .optional(),
  })
  .default({});

export { password, registerSchema, loginSchema, refreshSchema };
