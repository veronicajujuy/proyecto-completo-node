const fs = require("fs");

const User = {
  filename: "./database/users.json",

  generateId: function () {
    let allUsers = this.findAll();
    if (allUsers.length > 0) {
      let lastUser = allUsers.pop();
      return lastUser.id + 1;
    } else {
      return 1;
    }
  },

  getData: function () {
    return JSON.parse(fs.readFileSync(this.filename, "utf-8"));
  },

  findAll: function () {
    return this.getData();
  },
  findByPk: function (id) {
    let allUsers = this.findAll();
    let userFound = allUsers.find((user) => user.id == id);
    return userFound;
  },
  findByField: function (field, text) {
    let allUsers = this.findAll();
    let userFound = allUsers.find((user) => user[field] == text);
    return userFound;
  },
  create: function (userData) {
    let allUsers = this.findAll();
    let newUser = {
      id: this.generateId(),
      ...userData,
    };
    allUsers.push(newUser);
    fs.writeFileSync(this.filename, JSON.stringify(allUsers), null, " ");
    return newUser;
  },
  delete: function (id) {
    let allUsers = this.findAll();
    let newUsers = allUsers.filter((user) => user.id != id);
    fs.writeFileSync(this.filename, JSON.stringify(newUsers), null, " ");
    return true;
  },
};

module.exports = User;

// uso de findByField
// console.log(User.findByField("email", "vmcguiney12@4shared.com"));
// console.log(User.findByField("country", "Syria"));
