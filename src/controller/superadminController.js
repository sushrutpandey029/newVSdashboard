const roleModel = require("../models/rolesModel");
const patientModel = require("../models/patientModel");
const validation = require("../validator/validator");
const Register = require("../models/registerModel");
const superadmin = require("../models/superadminModel");
const gameModel = require("../models/gameModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");



const superadminlogin = async(req,res)=>{
    try{
        let body = req.body;
        let errors = [];
       const { email, password } = body;
 
       if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
          res.status(400)
          errors.push({text:'Email Id is Invalid'})
       }
      
       const user = await superadmin.findOne({ email });
       const adminid=await superadmin.find({'email':req.body.email});

       if (user) {
          
           const validPassword = await bcrypt.compare(password, user.password);
           if (!validPassword) {
             res.status(400)
             errors.push({text:'Password is Invalid'})
             }
             res.cookie("id",user._id.toString())  // storing id in the form of cookie at the browser side, make it make secure while deploying..
       } else {
          res.status(400)
          errors.push({text:"User does not exist"})
        }
 
        if(errors.length>0){
          res.render("superAdm_login",{
              errors:errors,
              title:'Error',
              email:email,
              password:password
          })
      }else{
       req.session.user = user;
  

       const token = await jwt.sign({
           userid: user._id.toString(),
           username: user.username.toString(),
           email: user.email.toString(),
           isSuperadmin: user.isSuperadmin.toString(),
       },"Testing")
      
   
       res.setHeader("Authentication", token) 
       
        req.session.isAuth=true;

        console.log(req.session.user)

    
      

    res.redirect("mainindex")
    
      }
   }
   catch (error) {
    let errors = [];
    errors.push[{text:"Server error"}]
    return res.render("superAdm_login",{
       errors:errors,
       title:'Error'
    });
  }
}



const adminregister =async(req,res)=>{
  try {
     let body = req.body
     let errors = [];
     const { username,email,phone,password } = body

     
     
     if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
        res.status(400)
        errors.push({text:'Email Id is Invalid'})

     }

     if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
        res.status(400)
        errors.push({text:'Mobile Number is Invalid '})

     }

  //    let Admin = await Register.findOne({isAdmin:true})
  //    if(Admin){
  //       res.status(400)
  //       errors.push({text:'Admin is already in use'})
  //    }

     let isDuplicateAdmin = await superadmin.findOne({ email:email,phone:phone,issuperAdmin:true });

     if (isDuplicateAdmin) {
        res.status(400)
        errors.push({text:'Admin is already in use'})
     }

     if(errors.length>0){
        res.render("superadmin",{
            errors:errors,
            title:'Error',
            username:username,
            email:email,
            password:password,
            phone:phone
        })
    }
    else{
     // generate salt to hash password
     const salt = await bcrypt.genSalt(10);
     // now we set user password to hashed password
     body.password = await bcrypt.hash(body.password, salt);

     const output = await superadmin.create(body)
     return res.status(201).render("login")
    }
 }
 catch (error) {
  let errors = [];
  errors.push[{text:"Server error"}]
  return res.render("login",{
     errors:errors,
     title:'Error'
  });
 }
}


const superadminUpdate= async (req,res)=>{
    
  await superadmin.updateOne({_id:req.params.id},{

  


       $set:{
           username:req.body.username,
           email:req.body.email,
           phone:req.body.phone,

       },function(err,docs){
           if(err){
               console.log(err);
           }else{
              //  console.log("updated admin :");
               res.redirect('../mainindex') 
           }
       }
   })  
    
}


const changesuperpassword=async(req,res)=>{

  const newpassword = req.body.newpassword;


      if (newpassword) {
        // If the old password is correct, hash the new password
        bcrypt.hash(newpassword, 10, function(error, hashedPassword) {
          if (error) {
            // Return an error if there was a problem hashing the password
            return res.status(500).send(error);
          }

          // Save the hashed new password to the database
          superadmin.updateOne({_id:req.params.id}, { password: hashedPassword }, function(error) {
            if (error) {
              // Return an error if there was a problem updating the password
              return res.status(500).send(error);
            }

            // Return a success message if the password was updated successfully
            // res.send('Password updated successfully');
            console.log('yes')
            res.redirect('/change-superpassword') 
          });
        });
      } else {
        // Return an error if the old password is incorrect
        response.status(401).send('Incorrect old password');
      }
}



module.exports = {superadminlogin,adminregister,superadminUpdate,changesuperpassword} 