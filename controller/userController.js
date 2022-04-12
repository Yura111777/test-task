const jwt = require("jsonwebtoken");
const db = require("../db");
const AppError = require("../util/appError");

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  //Remove password from output
  user.password = undefined;

  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  });
};

class UserController {
  async createUser(req, res, next) {
    const { first_name, last_name, email, phone, password } = req.body;
    const newUser = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, password ) values ($1,$2,$3,$4,crypt($5, gen_salt('bf'))) RETURNING * `,
      [first_name, last_name, email, phone, password]
    );

    createSendToken(newUser.rows[0], 201, res);
  }

  async getOneUser(req, res) {
    const id = parseInt(req.params.id);

    db.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows[0]);
    });
  }

  async updateUser(req, res) {
    const id = parseInt(req.params.id);
    const { first_name, email } = req.body;

    db.query(
      "UPDATE users SET first_name = $1, email = $2 WHERE id = $3",
      [first_name, email, id],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.status(200).send(`User modified with ID: ${id}`);
      }
    );
  }

  async logIn(req, res, next) {
    try {
      const { email, password } = req.body;

      //1) Check if email and password exist
      if (!email || !password) {
        return next(new AppError("Incorrect email or password", 401));
      }

      //2) Check if user exist && password correct
      const user = await db.query(
        `SELECT * FROM users WHERE email = $1 AND password = crypt($2, password)`,
        [email, password],
        (error, results) => {
          if (error) {
            return next(new AppError("Incorrect email or password", 401));
          }
        }
      );
      //3) If everything okay, sent token to a client
      createSendToken(user.rows[0], 200, res);

      req.user = user.rows[0];
    } catch (err) {
      return next(new AppError("Incorrect email or password", 401));
    }
  }
}

module.exports = new UserController();
