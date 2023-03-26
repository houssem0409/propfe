const UserModel = require("../models/user");
const jwt = require("jsonwebtoken"); //to generate signed token
const jwt_decode = require("jwt-decode");
const expressJwt = require("express-jwt"); // for authorization check
const { hashSync, compare, compareSync } = require("bcrypt");
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");
const moment = require("moment");
require("../helpers/passport");
const { errorHandler } = require("../helpers/dbErrorHandler");
let refreshTokens = [];
const path = require("path");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const PasswordReset = require("../models/password_reset");
const UserVerification = require("../models/user_verification");
const user = require("../models/user");
let transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "houssem14_11@hotmail.com",
    pass: "hzouheli5",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages ");
    console.log(success);
  }
});
const sendVerificationEmail = (req, res) => {
  const currentUrl = "http://localhost:8000/";
  const uniqueString = uuidv4() + req._id;
  console.log("====================================");
  console.log("rea", req);
  console.log("transpoter", transporter);

  console.log("====================================");
  const mailOptions = {
    from: "houssem14_11@hotmail.com",
    to: req.email,
    subject: "verify Your Email",
    html: `<p>Verify your email address to complete the signup and login into your account .</p><p>This Link <b> expires in 6 hours. </b> .</p>
             <p>Press <a href=${
               currentUrl + "api/user/verify/" + req._id + "/" + uniqueString
             }> here</a> toproceed . </p>`,
  };
  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      // set values in userVerification collection
      console.log("====================================");
      console.log("hashedUniqueString", hashedUniqueString);
      console.log("====================================");
      const newverification = new UserVerification({
        userId: req._id,
        uniqueString: hashedUniqueString,
        expiresAt: Date.now() + 21600000,
      });
      newverification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              console.log("verification mail sent ");
            })
            .catch((error) => {
              console.log(error);
            });
        })

        .catch((error) => {
          console.log(error);
          res.json({
            status: "Failed",
            message: "Verification email failed ",
          });
        });
    })
    .catch(() => {
      res.json({
        status: "Failed",
        message: "An error occured while hashing email data !",
      });
    });
};
exports.verifyPage = (req, res) => {
  res.sendFile(path.join(__dirname, "./../views/verified.html"));
};
exports.verifyEmail = (req, res) => {
  let { userId, uniqueString } = req.params;

  UserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;

        if (expiresAt < Date.now()) {
          UserVerification.deleteOne({ userId })
            .then((result) => {
              user.deleteOne({ userId }).then(() => {
                let message = "Link has expired . Please signup again .";
                res.redirect(`/user/verified/error=true&message=${message}`);
              });
            })
            .catch((error) => {
              let message = "Clearing user with expired unique String failed ";
              res.redirect(`/api/user/verified/error=true&message=${message}`);
            })
            .catch((error) => {
              console.log(error);
              let message =
                "An error occucred while clearing expired user verification record ";
              res.redirect(`/api/user/verified/error=true&message=${message}`);
            });
        } else {
          // valid record existes so we validate the user string
          // first compare the hashed unique string
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                // strings match
                User.updateOne({ _id: userId }, { verified: true })
                  .then(() => {
                    UserVerification.deleteOne({ userId })
                      .then(() => {
                        res.sendFile(
                          path.join(__dirname, "./../views/verified.html")
                        );
                      })
                      .catch((error) => {
                        let message =
                          "An error occured while finalize successful verification  ";
                        res.redirect(
                          `/api/user/verified/error=true&message=${message}`
                        );
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    let message =
                      "An error occured while updating user record to show verified ";
                  });
              } else {
                let message =
                  "Invalid verification details passed . check your box .";
                res.redirect(
                  `/api/user/verified/error=true&message=${message}`
                );
              }
            })
            .catch((error) => {
              let message = " An error occured while comparing unique strings ";
              res.redirect(`/user/verified/error=true&message=${message}`);
            });
        }
      } else {
        let message =
          "An error reccord doesn't exist or has been verified already , Please sin*gnup or login ";
        res.redirect(`/api/user/verified/error=true&message=${message}`);
      }
    })
    .catch((error) => {
      console.log(error);
      let message =
        " An error Ocured while cheking dor existing user verification record ";
      res.redirect(`/api/user/verified/error=true&message=${message}`);
    });
};

exports.signup = (req, res) => {
  const user = new UserModel({
    username: req.body.username,
    email: req.body.email,
    password: hashSync(req.body.password, 10),
    role: "user",
    address: req.body.address,
    country: req.body.country,
  });
  user
    .save()
    .then((user) => {
      res.send({
        success: true,
        message: "user created successfuly and verification mail sent  ",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        err: errorHandler(err),
      });
    });
  sendVerificationEmail(user);
};

exports.signin = (req, res) => {
  UserModel.findOne({ username: req.body.username }).then((user) => {
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Could Not Find This User ! ",
      });
    }
    if (!compareSync(req.body.password, user.password)) {
      return res.status(401).send({
        success: false,
        message: "Incoorect Password  ! ",
      });
    }
    if (user.verified == false) {
      return res.status(401).send({
        success: false,
        message: "Mail hasn't verified yet . Check Box !  ",
      });
    }
    const payload = {
      username: user.username,
      email: user.email,
      id: user._id,
      role: user.role,
      startup: user.startup,
    };
    const refresh = jwt.sign(payload, "random", { expiresIn: "1m" });
    const token = jwt.sign(payload, "Random String", { expiresIn: "90m" });
    refreshTokens.push(refresh);
    return res.status(200).send({
      success: true,
      id: user._id,
      username: user.username,
      email: user.email,
      country: user.country,
      address: user.address,
      city: user.city,
      role: user.role,
      startup: user.startup,
      message: "Logged in Successfuly !  ",
      token: "Bearer " + token,
      refresh: refresh,
      expireIn: moment().add(90, "minutes").format("hh:mm:ss A"),
    });
  });
};
exports.protected = (req, res) => {
  console.log("I am here");
  var token = req.headers.authorization;
  console.log(token);
  console.log("yes");

  var decoded = jwt_decode(token);

  console.log("this is ");
  console.log(decoded);

  var query = { _id: decoded.id };
  User.find(query).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "user not found ",
      });
    }
    req.profile = user;
    console.log(user);
    res.json(user[0]);
  });
};
exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Signout Success" });
};

exports.requireSignin = expressJwt({
  secret: "Random String",
  algorithms: ["HS256"], // added later
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access denied",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  var token = req.rawHeaders[1];
  console.log(token);
  var decoded = jwt_decode(token);
  console.log("this is ");
  console.log(decoded);
  if (decoded.role !== "admin") {
    return res.status(403).json({
      error: "Admin resourse ! Access denied",
    });
  }
  next();
};
exports.isDirector = (req, res, next) => {
  var token = req.rawHeaders[1];
  console.log(token);
  var decoded = jwt_decode(token);
  console.log("this is ");
  console.log(decoded);
  if (decoded.role !== "director") {
    return res.status(403).json({
      error: " Director Ressource ! Access denied",
    });
  }
  next();
};

exports.isAdminOrDirector = (req, res, next) => {
  var token = req.rawHeaders[1];
  console.log(token);
  var decoded = jwt_decode(token);
  console.log("this is ");
  console.log(decoded);
  if (decoded.role !== "admin" || decoded.role !== "director") {
    return res.status(403).json({
      error: "Admin resourse ! Access denied",
    });
  }
  next();
};
exports.isMember = (req, res, next) => {
  var token = req.rawHeaders[1];
  console.log(token);
  var decoded = jwt_decode(token);
  console.log("this is ");
  console.log(decoded);
  if (decoded.role !== "member") {
    return res.status(403).json({
      error: "Member resourse ! Access denied",
    });
  }
  next();
};

exports.refresh = (req, res, next) => {
  const refreshToken = req.body.refresh;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.json({ message: "Refresh token not found, login again" });
  }

  // If the refresh token is valid, create a new accessToken and return it.

  jwt.verify(refreshToken, "random", (err, user) => {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    console.log(user);
    if (!err) {
      const token =
        "Bearer " +
        jwt.sign(payload, "Random String", {
          expiresIn: "90m",
        });
      const refresh = jwt.sign(payload, "random", {
        expiresIn: "60m",
      });
      refreshTokens.push(refresh);

      return res.json({
        success: true,
        token,
        refresh,
        expireIn: moment().add(90, "minutes").format("hh:mm:ss A"),
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  });
};

exports.passwordReset = (req, res) => {
  const { email, redirectUrl } = req.body;

  User.find({ email }).then((data) => {
    if (data.length) {
      // user exists

      // catch if user is verified
      if (!data[0].verified) {
        res.json({
          status: "FAILED",
          message: "Email hasn't been verified yet . chek your in box ",
        });
      } else {
        // procced with email to reset password
        sendResetEmail(data[0], redirectUrl, res);
      }
    } else {
      res.json({
        status: "FAILED",
        message: "No account with the suplied email exists !",
      });
    }
  });
};
const sendResetEmail = ({ _id, email }, redirectUrl, res) => {
  const resetString = uuidv4() + _id;
  PasswordReset.deleteMany({ userId: _id })
    .then((result) => {
      // reset records deleted successfuly
      // Now we send
      const mailOptions = {
        from: "houssem14_11@hotmail.com",
        to: email,
        subject: "Password Reset ",
        html: `<p>we heard that you lost your password  .</p><p>Don't worry , use the link below to reset it .</p><p>This Link <b> expires in 60 minutes . </b> .</p>
               <p>Press <a href=${
                 redirectUrl + "/" + _id + "/" + resetString
               }> here</a> toproceed . </p>`,
      };

      // hash the reset string
      const saltRounds = 10;
      bcrypt
        .hash(resetString, saltRounds)
        .then((hashedResetString) => {
          // set values in password reset
          const newPasswordReset = new PasswordReset({
            userId: _id,
            resetString: hashedResetString,
            expiresAt: Date.now() + 3600000,
          });
          newPasswordReset
            .save()
            .then(() => {
              transporter
                .sendMail(mailOptions)
                .then(() => {
                  // reset email sent and password reset record saved
                  res.json({
                    status: "PENDING",
                    message: "Password reset email sent  ",
                  });
                })
                .catch((error) => {
                  res.json({
                    status: "FAILED",
                    message: "Password reset email failed ",
                  });
                });
            })
            .catch((error) => {
              console.log(error);
              res.json({
                status: "FAILED",
                message: "Couldn't save the passwordReset data !  ",
              });
            });
        })
        .catch((error) => {
          console.log(error);
          res.json({
            status: "FAILED",
            message:
              "An error occured while hashing the password reset data ! ",
          });
        });
    })
    .catch((error) => {
      // error while clearing existing record
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Clearing existing password reset records failed ",
      });
    });
};
exports.resetpass = (req, res) => {
  let { userId, resetString, newPassword } = req.body;

  PasswordReset.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        const { expiresAt } = result[0];
        const hashedResetString = result[0].resetString;
        if (expiresAt < Date.now()) {
          PasswordReset.deleteOne({ userId })
            .then(() => {
              res.json({
                status: "FAILED",
                message: "password reset record link has expired . ",
              });
            })
            .catch((error) => {
              console.log(error);
              res.json({
                status: "FAILED",
                message: "Clearing  password reset record failed ",
              });
            });
        } else {
          // void reset record exists so we validate the reset string
          // first compare the hashed reset string
          bcrypt
            .compare(resetString, hashedResetString)
            .then((result) => {
              if (result) {
                // strings matched
                // hash password again
                const saltRounds = 10;
                bcrypt
                  .hash(newPassword, saltRounds)
                  .then((hashedNewPassword) => {
                    // update user password
                    User.updateOne(
                      { _id: userId },
                      { password: hashedNewPassword }
                    )
                      .then(() => {
                        // updating is compteted
                        PasswordReset.deleteOne({ userId })
                          .then(() => {
                            // both user record and reset record updated
                            res.json({
                              status: "SUCCESS",
                              message: "Pasword has been reset successfuly !",
                            });
                          })
                          .catch((error) => {
                            console.log(error);
                            res.json({
                              status: "FAILED",
                              message:
                                "An error occured while finalizing password reset  ",
                            });
                          });
                      })
                      .catch((error) => {
                        console.log(error);
                        res.json({
                          status: "FAILED",
                          message: "Updating user Password failed ",
                        });
                      });
                  })
                  .catch((error) => {
                    res.json({
                      status: "FAILED",
                      message: "An error occured while hashing new password . ",
                    });
                  });
              } else {
                // Existing record but incoorect reset string passed .
              }
            })
            .catch((error) => {
              res.json({
                status: "FAILED",
                message: "Comparing password reset strings failed  ",
              });
            });
        }
      } else {
        // Password reset record doesn't exist

        res.json({
          status: "FAILED",
          message: "Password Reset Request not Found  ",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "chaking for existing reset password record failed",
      });
    });
};
