import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    console.log("authenticating...");
    let { token } = req.cookies;
    if (!token)
      return res
        .status(400)
        .json({ message: "Authentication token not found." });
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken)
      return res
        .status(400)
        .json({ message: "Authentication token is not valid." });
    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    return res.status(500).json({ message: `IsAuth Error: ${error}` });
  }
};

export default isAuth;
