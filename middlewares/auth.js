import AppError from "../errors/AppError.js";

function createAuthMiddlewares(tokens) {
  function authenticate(req, res, next) {
    const [scheme, headerToken] = (req.headers.authorization ?? "").split(" ");
    const token =
      scheme === "Bearer" && headerToken
        ? headerToken
        : req.cookies?.access_token;

    if (!token) {
      return next(
        new AppError("TOKEN_MISSING", "Token de autenticación faltante", 401),
      );
    }

    try {
      const payload = tokens.verify(token);
      if (payload.type !== "access") {
        throw new AppError("TOKEN_INVALID", "Token inválido", 401);
      }
      req.user = { id: Number(payload.sub), role: payload.role };
      next();
    } catch (err) {
      next(err);
    }
  }

  const authorize =
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user?.role)) {
        return next(
          new AppError(
            "FORBIDDEN",
            "Acceso denegado: no tenés permiso para realizar esta acción",
            403,
          ),
        );
      }
      next();
    };

  return { authenticate, authorize };
}

export default createAuthMiddlewares;
