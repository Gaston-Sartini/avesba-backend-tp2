async function listUsers({ page, per_page, role }, { usersDao }) {
  const filters = { role, is_active: true };

  const items = await usersDao.getAll({ ...filters, page, limit: per_page });
  const total = await usersDao.count(filters);

  return {
    items,
    total,
    page,
    per_page,
    pages: Math.ceil(total / per_page),
  };
}

export default listUsers;
