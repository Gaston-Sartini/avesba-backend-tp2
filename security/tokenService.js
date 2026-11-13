import jwt from "jsonwebtoken";
import AppError from "../errors/AppError.js";

function createTokenService({
  secret,
  accessExpiresInSeconds,
  refreshExpiresInSeconds,
}) {
  return {
    accessExpiresInSeconds,

    signAccess: (payload) =>
      jwt.sign({ ...payload, type: "access" }, secret, {
        expiresIn: accessExpiresInSeconds,
      }),

    signRefresh: (payload) =>
      jwt.sign({ ...payload, type: "refresh" }, secret, {
        expiresIn: refreshExpiresInSeconds,
      }),

    verify(token) {
      try {
        return jwt.verify(token, secret, { algorithms: ["HS256"] });
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          throw new AppError(
            "TOKEN_EXPIRED",
            "El token venció, iniciá sesión de nuevo",
            401,
          );
        }
        throw new AppError("TOKEN_INVALID", "Token inválido", 401);
      }
    },
  };
}

export default createTokenService;
