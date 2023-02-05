const roleModel = require("../models/rolesModel");
const patientModel = require("../models/patientModel");
const progressModel = require("../models/progressModel");
const validation = require("../validator/validator");
const Register = require("../models/registerModel");
const bcrypt = require('bcrypt');
const aws = require("../aws/aws");
const jwt = require("jsonwebtoken");
var multer = require('multer');
var fs = require('fs');
var path = require('path');

const axios = require("axios");
const nodemailer = require('nodemailer');


 // created deletedoc, docupdate.

const createUser = async function (req, res) {
    try {
        let body = req.body

        if (!validation.isrequestBody(body)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters, please provide user details" })
        }

        const { fullname, email, phone, password, role, payment, patientId } = body

        if (!validation.isValid(fullname)) {
            return res.status(400).send({ status: false, msg: "please provide full name" })

        }
        if (!validation.isValid(email)) {
            return res.status(400).send({ status: false, msg: "please provide email" })

        }

        if (!validation.isValid(phone)) {
            return res.status(400).send({ status: false, msg: "please provide phone" })

        }

        if (!validation.isValid(password)) {
            return res.status(400).send({ status: false, msg: "please provide password" })

        }

        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "email is not valid" })

        }

        if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: "Mobile Number is not valid" })

        }

        let isDuplicateEmail = await roleModel.findOne({ email });
        if (isDuplicateEmail) {
            res.redirect("/createUser")
        }

        let duplicatephone = await roleModel.findOne({ phone });
        if (duplicatephone) {
            return res.status(400).send({ status: false, msg: "phone is already in use" })
        }

        // generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        body.password = await bcrypt.hash(body.password, salt);

        if (role == "Admin") {
            let duplicateAdmin = await roleModel.findOne({ role: "Admin" })
            if (duplicateAdmin) {
                return res.status(400).send({ status: false, msg: "Admin Already Present!!! Only one admin can exist" })
            }
        }

        

        const output = await roleModel.create(body)
        
        return res.status(201).send({ status: true, msg: "User Succesfully Created", data: output }) // original code
        // res.redirect('../index') //added this to redirect 
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: error.message });
    }

}



const login = async (req, res) => { 
    try {
        let body = req.body;

        if (!validation.isrequestBody(body)) {
            return res.status(400).send({ status: false, message: "Please fill the required entries" });
        }

        const { email, password } = body;

        if (!validation.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please enter email id " })
        }

        if (!validation.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please enter password" })
        }

        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "email is not valid" })

        }

        const user = await roleModel.findOne({ email });

        if (user) {
           
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                res.status(400).send({ status: false, msg: "Invalid Password" });
            }
        } else {
            res.status(401).send({ status: false, msg: "User does not exist" });
        }

        req.user = user;

        const token = jwt.sign({
            userid: user._id.toString(),
            iat: Math.floor(Date.now() / 1000),
        },process.env.SECRET_KEY)
        
        console.log(token)
        res.setHeader("Authentication", token) // Setting key Value pair of Token
        

        const output = {
            userId: user._id,
            token: token
        }
        
        // req.session.isAuth=true;
        return res.status(200).send({ status: true, msg: "User login successfull", data: output })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
    
}



// ADMIN PANELS FUNCTION 


const createUsernew = async function (req, res) {
    // console.log("new user", info.messageId)
  
    try {
      let body = {
        fullname: req.body.fullname,
        lastfullname: req.body.lastfullname,
        username: req.body.username,
        adminid: req.body.adminid,
        email: req.body.email,
        Dob: req.body.Dob,
        phone: req.body.phone,
        password: req.body.password,
        role: req.body.role,
        Address: req.body.Address,
        file: req.file.filename,
        Country: req.body.Country,
        City: req.body.City,
        State: req.body.State,
        pincode: req.body.pincode,
        Biography: req.body.Biography,
        status: req.body.status,
        payment: req.body.payment,
      };
  
      if (!validation.isrequestBody(body)) {
        return res
          .status(400)
          .send({
            status: false,
            msg: "Invalid parameters, please provide user details",
          });
      }
  
      const {fullname,lastfullname,username,adminid,email,phone,password,role,payment,patientId} = body;
  
      // if (body.file) {
      //     const response = await axios.post("/file/upload", {
      //         file: body.file,
      //         name: Date.now()+ body.file.name
      //     })
  
      // }
  
      if (!validation.isValid(fullname)) {
        return res
          .status(400)
          .send({ status: false, msg: "please provide full name" });
      }
  
      if (!validation.isValid(adminid)) {
        return res
          .status(400)
          .send({ status: false, msg: "please provide adminid" });
      }
  
      if (!validation.isValid(lastfullname)) {
        return res
          .status(400)
          .send({ status: false, msg: "please provide lastfullname" });
      }
  
      if (!validation.isValid(username)) {
        return res
          .status(400)
          .send({ status: false, msg: "please provide username" });
      }
  
      if (!validation.isValid(email)) {
        return res
          .status(400)
          .send({ status: false, msg: "please provide email" });
      }
  
      if (!validation.isValid(phone)) {
        return res
          .status(400)
          .send({ status: false, msg: "please provide phone" });
      }
  
      if (!validation.isValid(password)) {
        return res
          .status(400)
          .send({ status: false, msg: "please provide password" });
      }
  
      if (password.length < 6 || password.length > 15) {
        return res
          .status(400)
          .send({ status: false, msg: "password length min 6 and max 15" });
      }
  
      if (!/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email)) {
        return res.status(400).send({ status: false, msg: "email is not valid" });
      }
  
      if (!/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone)) {
        return res
          .status(400)
          .send({ status: false, msg: "Mobile Number is not valid" });
      }
  
      let isDuplicateEmail = await roleModel.findOne({ email });
      if (isDuplicateEmail) {
        res.redirect("/createUser");
      }
  
      let duplicatephone = await roleModel.findOne({ phone });
      if (duplicatephone) {
        return res
          .status(400)
          .send({ status: false, msg: "phone is already in use" });
      }
  
      let duplicateusername = await roleModel.findOne({ username });
      if (duplicateusername) {
        return res
          .status(400)
          .send({ status: false, msg: "username is already in use" });
      }
  
      // generate salt to hash password
      const salt = await bcrypt.genSalt(10);
      // now we set user password to hashed password
      body.password = await bcrypt.hash(body.password, salt);
  
      if (role == "Admin") {
        let duplicateAdmin = await roleModel.findOne({ role: "Admin" });
        if (duplicateAdmin) {
          return res
            .status(400)
            .send({
              status: false,
              msg: "Admin Already Present!!! Only one admin can exist",
            });
        }
      }
  
      let testAccount = await nodemailer.createTestAccount();
  
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "rashupandey029@gmail.com", // generated ethereal user
          pass: "nsedmjzulrvhucif", // generated ethereal password
        },
      });
  
      let info = await transporter.sendMail({
        from: "rashupandey029@gmail.com", // sender address
        to: body.email, // list of receivers
        subject: "Registration Confirmed VS", // Subject line
        text: "Welcome to Voice Simulation", // plain text body
        html: `<b>Hi ${body.fullname}</b><br><b>Welcome to Voice Simulation</b><br><p>Your registration was successful. Thank you for joining our service!</p><b>Your Login Id = </b> ${body.email}<br> <b>Your Login Password = </b>${password}<br><br> Best Regards <br>Voice Simulation <br> Head Office <br>Thank You `, // html body
      });
  
      console.log("new user", info.messageId);
      console.log("To", info);
  
      console.log(body.file);
  
        const output = await roleModel.create(body);
      //   res.status(200).json(output);
  
      // return res.status(201).send({ status: true, msg: "User Succesfully Created", data: output }) // original code
      res.redirect("../doctor"); //added this to redirect
    } catch (errors) {
      //   console.log(errors)
      //   res.status(500).json(errors);
      res.render("../docregister", { msg: errors.msg });
      // conslog.log(errors);
    }
};


const doclogin = async(req,res)=>{
    try{
        let body = req.body;
        let errors = [];
       const { email, password } = body;
 
       if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
          res.status(400)
          errors.push({text:'Email Id is Invalid'})
       }
 
       const user = await roleModel.findOne({ email });
    //    const adminid=await roleModel.find({'email':req.body.email})
       if (user) {
           const validPassword = await bcrypt.compare(password, user.password);
           if (!validPassword) {
             res.status(400)
             errors.push({text:'Password is Invalid'})
             } 
             if(user.role!="Doctor"){
                res.status(400)
                errors.push({text:'Enter a valid doctor id'})
             }
             res.cookie("id",user._id.toString())  // storing id in the form of cookie at the browser side, make it secure while deploying..
       } else {
          res.status(400)
          errors.push({text:"User does not exist"})
        }
 
        if(errors.length>0){
          res.render("doctor_login",{
              errors:errors,
              title:'Error',
              email:email,
              password:password
          })
      }else{
       req.user = user;
    //   console.log(user);

       const token = await jwt.sign({
           userid: user._id.toString(),
       },"Testing")
      
    //    console.log("token ",token);
       res.setHeader("Authentication", token) // Setting key Value pair of Token
       
       req.session.isAuth=true;

    //    return res.status(200).send(`/doc-dashboard/:${user._id.toString()}`); 
       res.redirect(`../doc-dashboard/${user._id.toString()}`)
    }
   }
   catch (error) {
    let errors = [];
    errors.push[{text:"Server error"}]
    return res.render("doctor_login",{
       errors:errors,
       title:'Error'
    });
  }
}


// const doclogin = async(req,res)=>{
//     try{
//         let body = req.body;
//         let errors = [];
//        const { email, password } = body;
 
//        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
//           res.status(400)
//           errors.push({text:'Email Id is Invalid'})
//        }
  
//        const user = await roleModel.findOne({ email });
//        if (user) {
//            const validPassword = await bcrypt.compare(password, user.password);
//            if (!validPassword) {
//              res.status(400)
//              errors.push({text:'Password is Invalid'})
//              }else if(user.role!="Doctor"){
//                 res.status(400)
//                 errors.push({text:'Enter a valid doctor id'})
//              } 
//             await res.cookie("id",user._id.toString())  // storing id in the form of cookie at the browser side, make it secure while deploying..
//        } else {
//           res.status(400)
//           errors.push({text:"User does not exist"})
//         }
 
//         if(errors.length>0){
//           res.render("login",{
//               errors:errors,
//               title:'Error',
//               email:email,
//               password:password
//           })
//       }
//        req.user = user;
//        const token =jwt.sign({
//            userid: user._id.toString(),
//        },"Testing")
      
//       await res.setHeader("Authentication", token) // Setting key Value pair of Token
//        req.session.isAuth=true;
//             //   return res.status(200).send(`/doc-dashboard/:${user._id.toString()}`); 
//        var ID=user._id.toString();
//        res.redirect(`doc-dashboard/${ID}`) 
//     //    res.redirect("index")
//    }
//    catch (error) {
//     let errors = [];
//     errors.push[{text:"Server error"}]
//     return res.render("login",{
//        errors:errors,
//        title:'Error'
//     }); 
//   }
//  }


const deletedoc =async(req,res)=>{
        const ID =req.params.id;
       console.log(ID)
    await roleModel.findOneAndDelete({_id:ID});
    
   // let data = await roleModel.find()
    // console.log(data.length);
    res.redirect('../doctor') 
}

const docUpdate=async (req,res)=>{
   await roleModel.updateOne({_id:req.params.id},{
        $set:{
            fullname:req.body.fullname,
            lastfullname:req.body.lastfullname,
            email:req.body.email,
            Dob:req.body.Dob,
            phone:req.body.phone,
            role:req.body.role,
            Address:req.body.Address,
            Country:req.body.Country,
            City:req.body.City,
            State:req.body.State,
            pincode:req.body.pincode,
            profilepic:req.body.profilepic,
            Biography:req.body.Biography,
            status:req.body.status,
            payment:req.body.payment
        },
        
        
        
        function(err,docs){
            if(err){
                
                console.log(err);
            }else{

               
       
                console.log("updated doc :",docs);
                res.render('/doctor')  
            }
        }
    })  
     
}


const countUpdate = async (req,res)=>{
    await roleModel.updateOne({_id:req.params.id},{
         $set:{
             count:req.body.count,
         },
         function(err,docs){
             if(err){
                 
                console.log(err);
             }else{
                console.log("updated doc :",docs);
                res.render('/doctor') 
             }
        }
     })  
      
 }

const docchangepassword=async(req,res)=>{

    const newpassword = req.body.newpassword;

        if (newpassword) {
          // If the old password is correct, hash the new password
          bcrypt.hash(newpassword, 10, function(error, hashedPassword) {
            if (error) {
              // Return an error if there was a problem hashing the password
              return res.status(500).send(error);
            }
  
            // Save the hashed new password to the database
            roleModel.updateOne({_id:req.params.id}, { password: hashedPassword }, function(error) {
              if (error) {
                // Return an error if there was a problem updating the password
                return res.status(500).send(error);
              }
  
              // Return a success message if the password was updated successfully
              // res.send('Password updated successfully');
              console.log('yes')
              res.redirect('/doctor')
            });
          });
        } else {
          // Return an error if the old password is incorrect
          response.status(401).send('Incorrect old password');
        }
}




module.exports = { createUser,login,deletedoc,docUpdate,createUsernew,doclogin,docchangepassword,countUpdate};