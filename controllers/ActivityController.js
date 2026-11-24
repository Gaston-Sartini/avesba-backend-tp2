/**
 * Controlador de Actividad.
 * Recibe los casos de uso por inyección de dependencias.
 */
class ActivityController {
  #useCases;

  constructor(useCases) {
    this.#useCases = useCases;
  }

  // POST /api/user-connection-log — 201: se guardó el tramo
  connectionLog = async (req, res) => {
    res.status(201).json(await this.#useCases.logConnection(req.body, req.user));
  };
}

export default ActivityController;
