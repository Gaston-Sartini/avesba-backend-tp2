class UsersController {
  #useCases;

  constructor(useCases) {
    this.#useCases = useCases;
  }

  me = async (req, res) => {
    res.json(await this.#useCases.getProfile(req.user));
  };

  changeMyPassword = async (req, res) => {
    res.json(await this.#useCases.changePassword(req.user, req.body));
  };

  list = async (req, res) => {
    res.json(await this.#useCases.listUsers(req.query));
  };

  get = async (req, res) => {
    res.json(await this.#useCases.getUserById(req.params.id, req.user));
  };

  create = async (req, res) => {
    res.status(201).json(await this.#useCases.createUser(req.body));
  };

  update = async (req, res) => {
    res.json(await this.#useCases.updateUser(req.params.id, req.body));
  };

  remove = async (req, res) => {
    await this.#useCases.deleteUser(req.params.id, req.user);
    res.status(204).send();
  };

  resetPassword = async (req, res) => {
    res.json(await this.#useCases.resetPassword(req.params.id));
  };
}

export default UsersController;
