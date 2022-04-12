const Router = require("express");
const userController = require("../controller/userController");

const router = new Router();
router.post("/user", userController.createUser);
router.post("/login", userController.logIn);
router.get("/user/:id", userController.getOneUser);
router.put("/user/:id", userController.updateUser);

module.exports = router;
