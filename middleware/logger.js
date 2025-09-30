const { append, fullPath } = require("@/utils/fileHelpers");

const logger = (req, res, next) => {
  let date = new Date().toISOString().split("T");
  let day = date[0];
  let time = date[1].split(".")[0];
  let filePath = fullPath("logs", `${day}.log`);
  append(filePath, `${time} ${req.method}: ${req.url}\n`);
  next();
};

module.exports = logger;
