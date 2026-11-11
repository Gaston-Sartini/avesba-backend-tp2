import AppError from "../errors/AppError.js";

function createLoginAttempts({ maxAttempts, windowMs }) {
  const attempts = new Map(); // email -> { count, firstAt }

  const isExpired = (entry) => Date.now() - entry.firstAt >= windowMs;

  return {
    check(email) {
      const entry = attempts.get(email);
      if (entry && !isExpired(entry) && entry.count >= maxAttempts) {
        throw new AppError(
          "TOO_MANY_ATTEMPTS",
          "Máximo de intentos de login excedido. Intentá más tarde.",
          429,
        );
      }
    },

    registerFailure(email) {
      const entry = attempts.get(email);
      if (!entry || isExpired(entry)) {
        attempts.set(email, { count: 1, firstAt: Date.now() });
      } else {
        entry.count += 1;
      }
    },

    clear(email) {
      attempts.delete(email);
    },
  };
}

export default createLoginAttempts;
