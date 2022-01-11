const User = require("../models/User.model");
const RefreshToken = require("../models/RefreshToken.model");
const jwt = require("jsonwebtoken");
const privateKey = process.env.PRIVATE_KEY;
const audience = process.env.AUDIENCE;
const issuer = process.env.ISSUER;
const jwtTokenExpires = process.env.JWT_TOKEN_EXPIRES;
const refreshTokenExpires = process.env.REFRESH_TOKEN_EXPIRES;

const algorithm = "HS256";

exports.generateJwtToken = (user) => {
  if (!user) throw new Error("Invalid user");

  try {
    const { id, username, email, displayName, givenName, familyName, roles } =
      user;
    return jwt.sign(
      {
        sub: id,
        id,
        username,
        email,
        displayName,
        givenName,
        familyName,
        roles,
      },
      privateKey,
      { algorithm, expiresIn: jwtTokenExpires, audience, issuer }
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};

exports.validateJwtToken = (token) => {
  if (!token) return null;
  const tokenValue = token.split(" ")[1];
  try {
    return jwt.verify(tokenValue, privateKey, { algorithm, audience, issuer });
  } catch (error) {
    console.error(error);
    return null;
  }
};

exports.generateRefreshToken = async (user) => {
  if (!user) throw new Error("Invalid user");

  try {
    const { id } = user;
    const token = Math.random().toString(36).substring(2, 15);

    const expires = new Date();
    expires.setTime(expires.getTime() + refreshTokenExpires);

    const refreshToken = new RefreshToken({
      userId: id,
      value: token,
      expires,
    });

    await refreshToken.save();
    return token;
  } catch (error) {
    console.error(error);
    return null;
  }
};

exports.revokeRefreshToken = async (token, { replacedBy = null } = {}) => {
  try {
    const result = await RefreshToken.updateOne(
      { value: token },
      { replacedBy, revokedAt: new Date() }
    );
    return result.value;
  } catch (error) {
    console.error(error);
    return null;
  }
};
