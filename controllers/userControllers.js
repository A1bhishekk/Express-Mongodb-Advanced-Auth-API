import UserModel from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
class UserControllers {

    // register api controller

    static userRegistration= async (req, res) => {
        try {
            const { name, email, password,password_confirmation, tc } = req.body;
            const user= await UserModel.findOne({email})
            // ******************
            if(user){
                return res.status(400).json({
                    status: "failed",
                    message: "User already exists",
                })
            }else{
                if(name && email && password && password_confirmation && tc){
                    if(password === password_confirmation){
                        // hash password
                        const salt = await bcrypt.genSalt(12);
                        const hashedPassword = await bcrypt.hash(password, salt);
                        const newUser= new UserModel({
                            name: name,
                            email: email,
                            password: hashedPassword,
                            tc: tc
                        })

                        await newUser.save()
                        // jwt token create 
                        const saved_user= await UserModel.findOne({email:email})
                        const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
                    //    ********************
                        return res.status(201).json({
                            status: "success",
                            message: "User registered successfully",
                            token: token,
                            user:newUser
                        })

                    }else{
                        return res.status(400).json({
                            status: "failed",
                            message: "Password and confirm password does not match",
                        })
                    }
                    
                }else{
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

    static userLogin= async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password){
                const user= await UserModel.findOne({email})
                if(user !=null){
                    const match= await bcrypt.compare(password, user.password)
                    if(match){
                        // jwt token create
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });

                        return res.status(200).json({
                            status: "success",
                            message: "User logged in successfully",
                            token: token,
                        })
                    }else{
                        return res.status(400).json({
                            status: "failed",
                            message: "Email or password is incorrect",
                        })
                    }

                }else{
                    return res.status(400).json({
                        status: "failed",
                        message: "you are not a registered user",
                    })
                }


            }else{
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

    static changeUserPassword= async (req, res) => {

        try {
            const { password,password_confirmation } = req.body;
            if(password && password_confirmation){
                if(password !== password_confirmation){
                    res.status(400).json({
                        status: "failed",
                        message: "Password and confirm password does not match",
                    })
                }else{
                    // hash password
                    const salt = await bcrypt.genSalt(12);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    // console.log(req.user)
                    await UserModel.findByIdAndUpdate(req.user._id,{$set:{password:hashedPassword}})

                    res.status(200).json({
                        status: "success",
                        message: "Password changed successfully",
                        password: hashedPassword
                    })
                    
                }

            }else{
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

    static loggedUser= async (req, res) => {
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
}

export default UserControllers