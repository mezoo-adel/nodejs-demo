const bcrypt = require("bcrypt");
const User = require("@/Models/User");

const getUserReponse = (user) => {
  return { username: user.username, name: user.name, email: user.email };
};

const getUserRequest = async (req) => {
  const username = req.params.username;
  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found");
  return user;
};

const index = async (req, res) => {
  const users = await User.find();
  res.json(users.map(getUserReponse));
};

const show = async (req, res) => {
  const user = getUserRequest(req);
  res.json(getUserReponse(user));
};

const create = async (req, res) => {
  const userData = req.body;
  userData.password = bcrypt.hashSync(userData.password, 10);

  try {
    const user = await User.create(userData);
    res.status(201).json({
      message: "User created successfully",
      user: getUserReponse(user),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  const updateData = req.body;
  const user = getUserRequest(req);

  if (updateData.password) {
    updateData.password = bcrypt.hashSync(updateData.password, 10);
  }

  await user.updateOne(updateData);

  res.json({
    message: "User updated successfully",
    user: getUserReponse(user),
  });
};

const destroy = async (req, res) => {
  const user = await getUserRequest(req);
  await User.findOneAndDelete({ username: user.username });
  res.json({ message: "User deleted successfully" });
};

module.exports = {
  index,
  show,
  create,
  update,
  destroy,
};
