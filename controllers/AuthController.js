import {
  COOKIE_OPTIONS,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
} from "../config/cookies.js";

function setAuthCookies(res, { access_token, refresh_token }) {
  res.cookie("access_token", access_token, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  res.cookie("refresh_token", refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

class AuthController {
  #useCases;

  constructor(useCases) {
    this.#useCases = useCases;
  }

  register = async (req, res) => {
    const tokens = await this.#useCases.register(req.body);
    setAuthCookies(res, tokens);
    res.status(201).json(tokens);
  };

  login = async (req, res) => {
    const tokens = await this.#useCases.login(req.body);
    setAuthCookies(res, tokens);
    res.json({ ...tokens, mensaje: "Inicio de sesión exitoso" });
  };

  refresh = async (req, res) => {
    const refreshToken = req.body.refresh_token ?? req.cookies?.refresh_token;
    const tokens = await this.#useCases.refresh(refreshToken);
    setAuthCookies(res, tokens);
    res.json(tokens);
  };

  logout = (req, res) => {
    res.clearCookie("access_token", COOKIE_OPTIONS);
    res.clearCookie("refresh_token", COOKIE_OPTIONS);
    res.json({ mensaje: "Sesión cerrada exitosamente" });
  };
}

export default AuthController;
