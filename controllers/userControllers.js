import UserModel from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
class UserControllers {

    // register api controller

    static userRegistration = async (req, res) => {
        try {
            const { name, email, password, password_confirmation, tc } = req.body;
            const user = await UserModel.findOne({ email })
            // ******************
            if (user) {
                return res.status(400).json({
                    status: "failed",
                    message: "User already exists",
                })
            } else {
                if (name && email && password && password_confirmation && tc) {
                    if (password === password_confirmation) {
                        // hash password
                        const salt = await bcrypt.genSalt(12);
                        const hashedPassword = await bcrypt.hash(password, salt);
                        const newUser = new UserModel({
                            name: name,
                            email: email,
                            password: hashedPassword,
                            tc: tc
                        })

                        await newUser.save()
                        // jwt token create 
                        const saved_user = await UserModel.findOne({ email: email })
                        const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
                        //    ********************
                        return res.status(201).json({
                            status: "success",
                            message: "User registered successfully",
                            token: token,
                            user: newUser
                        })

                    } else {
                        return res.status(400).json({
                            status: "failed",
                            message: "Password and confirm password does not match",
                        })
                    }

                } else {
                    return res.status(400).json({
                        status: "failed",
                        message: "All fields are required",
                    })
                }

            }

        } catch (error) {
            res.status(500).json({
                status: "failed",
                message: error.message,
            })
        }
    }

    // login api controller

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await UserModel.findOne({ email })
                if (user != null) {
                    const match = await bcrypt.compare(password, user.password)
                    if (match) {
                        // jwt token create
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });

                        return res.status(200).json({
                            status: "success",
                            message: "User logged in successfully",
                            token: token,
                        })
                    } else {
                        return res.status(400).json({
                            status: "failed",
                            message: "Email or password is incorrect",
                        })
                    }

                } else {
                    return res.status(400).json({
                        status: "failed",
                        message: "you are not a registered user",
                    })
                }


            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "All fields are required",
                })
            }


        } catch (error) {
            res.status(500).json({
                status: "failed",
                message: error.message,
            })

        }

    }

    // change password api controller

    static changeUserPassword = async (req, res) => {

        try {
            const { password, password_confirmation } = req.body;
            if (password && password_confirmation) {
                if (password !== password_confirmation) {
                    res.status(400).json({
                        status: "failed",
                        message: "Password and confirm password does not match",
                    })
                } else {
                    // hash password
                    const salt = await bcrypt.genSalt(12);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    // console.log(req.user)
                    await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: hashedPassword } })

                    res.status(200).json({
                        status: "success",
                        message: "Password changed successfully",
                        password: hashedPassword
                    })

                }

            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "All fields are required",
                })
            }

        } catch (error) {
            res.status(500).json({
                status: "failed",
                message: error.message,
            })
        }
    }

    // logged user details api controller

    static loggedUser = async (req, res) => {
        try {
            res.status(200).json({
                status: "success",
                message: "User details",
                user: req.user
            })
        } catch (error) {
            res.status(500).json({
                status: "failed",
                message: error.message,
            })

        }

    }

    // password reset link api controller
    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body
        if (email) {
            const user = await UserModel.findOne({ email: email })
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
                console.log(link)
                // // Send Email
                // let info = await transporter.sendMail({
                //   from: process.env.EMAIL_FROM,
                //   to: user.email,
                //   subject: "Technical Abhi - Password Reset Link",
                //   html: `<div style={background-color:"pink"}><a href=${link}>Click Here</a> to Reset Your Password</div>`
                // })
                res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email", })
            } else {
                res.send({ "status": "failed", "message": "Email doesn't exists" })
            }
        } else {
            res.send({ "status": "failed", "message": "Email Field is Required" })
        }
    }

    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body
        const { id, token } = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)
            if (password && password_confirmation) {
                if (password !== password_confirmation) {
                    res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
                } else {
                    const salt = await bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
                    res.send({ "status": "success", "message": "Password Reset Successfully" })
                }
            } else {
                res.send({ "status": "failed", "message": "All Fields are Required" })
            }
        } catch (error) {
            console.log(error)
            res.send({ "status": "failed", "message": "Invalid Token" })
        }
    }


    //   get all users api controller
    static getAllUsers = async (req, res) => {
        try {
            const users = await UserModel.find()
            res.status(200).json({
                status: "success",
                message: "All users",
                users: users
            })
        } catch (error) {
            res.status(500).json({
                status: "failed",
                message: error.message,
            })

        }
    }

}

export default UserControllers