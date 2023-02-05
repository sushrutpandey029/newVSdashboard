const express = require("express")
const session = require("express-session")
const router = express.Router()
var multer = require('multer');
var fs = require('fs');
var path = require('path');

router.get('/',(req,res)=>{
console.log(req.session); 
req.session.isAuth=true;
res.send("Session")
});

const roleController = require("../controller/roleController")
const patientController = require("../controller/patientController")
const adminController=require("../controller/adminController")
const gameController=require("../controller/gameController")
const superadminController=require("../controller/superadminController")


// Super Admin Api's
router.post("/superadminlogin",superadminController.superadminlogin)

router.post("/superadminUpdate/:id",superadminController.superadminUpdate)

router.post("/changesuperpassword/:id",superadminController.changesuperpassword)

router.post("/adminchangepassword/:id",adminController.adminchangepassword);








// router.post("/docregister",roleController.createUsernew)
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
      cb(null, "public/doc");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now()+file.originalname);
    },
});

const upload = multer({storage});
  router.post(
    "/file/upload",
    upload.single("file"),
    roleController.createUsernew
);

router.post("/login",roleController.login)
router.post("/docchangepassword/:id",roleController.docchangepassword)


// admin api added ..
router.post("/register",adminController.register);
router.post("/adminlogin",adminController.adminlogin);
router.post("/logout",adminController.logout);
router.post("/adminUpdate/:id",adminController.adminUpdate)
router.post("/changepassword/:id",adminController.changepassword);

// router.post("/adminlogin1",adminController.adminlogin1);

// router.post("/adminprofile",adminController.adminprofile);
router.post("/doclogin",roleController.doclogin)
router.get("/delete-doctor/:id",roleController.deletedoc);
router.post("/docUpdate/:id",roleController.docUpdate);
router.post("/add-patient",patientController.createPatientnew);



router.get("/delete-patient/:id",patientController.delete_patient)
router.post("/edit-patient/:id",patientController.update_patient)
router.post("/game_register",gameController.game_register)
router.post("/edit_game/:id",gameController.update_game)
router.get("/delete-game/:id",gameController.delete_game)


// section edited ends here..

router.get("/findPatient",patientController.findPatient)
router.get("/docPatient",patientController.docPatient)
router.get("/gameHistory",patientController.gameHistory)
router.get("/zipfile",patientController.zipfile)
router.get("/gameData",patientController.gameData)
router.post("/storeData",patientController.storeData)
router.post("/addgames",patientController.addgames)
router.get("/gamelist",patientController.gamelist)


//router.get("/admin",adminController.admin)
module.exports = router