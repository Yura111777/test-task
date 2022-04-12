require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoute");

const port = process.env.PORT;
const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/api", userRouter);
app.listen(port, () => console.log(`Server running on port ${port}`));
