//middle ware can be created to handle url verifications
//currently working for doctor only, create a middleware to find each and every role..


require('dotenv').config();
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const express = require("express")
const bodyParser = require('body-parser');
const route = require('./routes/routes');
const roleModel=require("./models/rolesModel");
const patientModel=require("./models/patientModel");
const superadminModel=require("./models/superadminModel");
const registerModel=require("./models/registerModel");
const progressModel = require('./models/progressModel');
const { default: mongoose, trusted } = require('mongoose');
const multer = require('multer'); 
const path = require("path"); 
const hbs = require('hbs');
const gameModel = require('./models/gameModel');
let cookieParser = require('cookie-parser');
const Superadmin = require('./models/superadminModel');
const app = express(); 

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.text({ type: '/' }));


app.use(multer().any())


const static_path = path.join(__dirname,"../public")
const template_path = path.join(__dirname,"../templates/views")
const partial_path = path.join(__dirname,"../templates/partial")


app.use(express.static(static_path))
app.set("view engine","hbs")
app.set("views",template_path)
hbs.registerPartials(partial_path)


mongoose.connect(process.env.MONGODB_ID, {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

const store = new MongoDBSession({
    uri:process.env.MONGODB_ID,
    collection:"mySessions"
}) 

const ONE_HOUR = 1000*60*60;
const ONE_DAY = ONE_HOUR*24
const SESSION_IDLE_TIMEOUT = ONE_DAY*20; //20 DAY IS IDLE TIME

app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    store:store,
    cookie:{
        maxAge:+SESSION_IDLE_TIMEOUT,
        sameSite:"None" //changed from secure to none.. earlier it was checking if request sending site was secure or not
    }
 })
 )
  
app.use('/', route);

app.get("/index",async(req,res) => {

   const temp1 = req.cookies.id;
   let data = await roleModel.find({adminid:temp1});

   let datag= await roleModel.find({adminid:temp1}).sort({createdAt:1})
   

   const temp2 = req.cookies.id;
   let data1 = await patientModel.find({adminid:temp2});

   let datap = await patientModel.find({adminid:temp1}).sort({createdAt:1});
   
   let data2 = await gameModel.find().sort({_id:-1});

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

console.log(user)

   var array=[]

   datag.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array.push(iso.split("T")[0])
   })

   var array2=[]
   datap.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array2.push(iso.split("T")[0])
   })

   res.render("index",{docData:data,patientdata:data1, gameData:data2,graphDataDoc:array,graphDataPatient:array2,loginuser:user})
   
})


app.get("/admindash/:id",async(req,res) => {

   // const temp1 = req.cookies.id;

   let data = await roleModel.find({adminid:req.params.id});

   let datag= await roleModel.find({adminid:req.params.id}).sort({createdAt:1})
   

   // const temp2 = req.cookies.id;
   let data1 = await patientModel.find({adminid:req.params.id});

   let datap = await patientModel.find({adminid:req.params.id}).sort({createdAt:1});

   
   let data2 = await gameModel.find().sort({_id:-1});

   const temp = req.cookies.id;
   const user = await superadminModel.find({_id:temp});

console.log(user)

   var array=[]

   datag.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array.push(iso.split("T")[0])
   })

   var array2=[]
   datap.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array2.push(iso.split("T")[0])
   })

   if(user.length>0)res.render("admindash",{docData:data,patientdata:data1, gameData:data2,graphDataDoc:array,graphDataPatient:array2,loginuser:user})
   else res.render("admindash",{docData:data,patientdata:data1, gameData:data2,graphDataDoc:array,graphDataPatient:array2,loginuser:user})
})



app.get("/mainindex",async(req,res) => {

   let data= await roleModel.find().sort({_id:-1});

   let dataa = await registerModel.find().sort({createdAt:1})

   let datag= await roleModel.find().sort({createdAt:1})

   let data1 = await patientModel.find().sort({_id:-1});

   let datap = await patientModel.find().sort({createdAt:1});

   let data2 = await gameModel.find().sort({_id:-1});

   const temp = req.cookies.id;
   const user = await Superadmin.find({_id:temp});

   let admin= await registerModel.find().sort({_id:-1});

console.log(user)

   var array=[]

   datag.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array.push(iso.split("T")[0])
   })

   var array2=[]
   datap.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array2.push(iso.split("T")[0])
   })


   var array3=[]
   dataa.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array3.push(iso.split("T")[0])
   })

   res.render("mainindex",{docData:data,patientdata:data1, gameData:data2, graphDataDoc:array,graphdataadmin:array3, graphDataPatient:array2,loginuser:user,admin:admin})
})


 app.get('/register',async(req,res)=>{


   const temp = req.cookies.id;
   const user = await superadminModel.find({_id:temp});


    res.render("register",{loginuser:user});
 })

 app.get('/login',(req,res)=>{

   res.render('login')
});


app.get('/logout',(req,res)=>{
   req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.clearCookie('session-id');
        res.redirect('/login');
      }
    });
})

app.get('/superadminlogout',(req,res)=>{
   req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.clearCookie('session-id');
        res.redirect('/superadminlogin');
      }
    });
})


app.get('/doclogout',(req,res)=>{
   req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.clearCookie('session-id');
        res.redirect('/doctor_login');
      }
    });
})




// app.get('/tom', (req, res) => {
//    // Check if the user is logged in
//    const isLoggedIn = req.session.user;
 
//    // Render the header template and pass the login data to it
//    res.render('header', { user: req.session.user });
//  });



app.get('/edit-profile',async(req,res)=>{

   const temp= req.cookies.id;
   const data=await registerModel.find({_id:temp})


   res.render("edit-profile",{userData:data,loginuser:data});
})


app.get('/superedit-profile',async(req,res)=>{
   const temp= req.cookies.id;
   const data=await superadminModel.find({_id:temp})


   res.render("superedit-profile",{userData:data,loginuser:data});
})

app.get("/change-password",async(req,res)=>{

   const temp= req.cookies.id;
   const data =await registerModel.find({_id:temp})

   res.render("change-password",{userData:data,loginuser:data});
})

app.get("/change-superpassword",async(req,res)=>{

   const temp= req.cookies.id;
   const data =await superadminModel.find({_id:temp})

   const temp1= req.cookies.id;
   const superuser =await superadminModel.find({_id:temp1})

   res.render("change-superpassword",{userData:data,loginuser:superuser});
})

app.get('/admin-profile',async(req,res)=>{

   const temp= req.cookies.id;
   const data=await registerModel.find({_id:temp})

   if(data.length>0)res.render("admin-profile",{data:data,loginuser:data});
   else res.send("access not provided")
});

app.get('/admin_profiles/:id',async(req,res)=>{

   const temp= req.cookies.id;
   const data=await superadminModel.find({_id:temp})

   const admin = await registerModel.find({"_id":req.params.id});

   res.render("admin_profiles",{admin:admin,loginuser:data})

});


app.get('/superadmin_profile',async(req,res)=>{

   const temp= req.cookies.id;
   const data=await superadminModel.find({_id:temp})


   if(data.length>0)res.render("superadmin_profile",{data:data,loginuser:data});
   else res.send("access not provided")
});

app.get('/profile',(req,res)=>{
   res.render("profile");
})

app.get('/forgot-password',(req,res)=>{
   res.render("forgot-password");
})

app.get('/change-password',(req,res)=>{
   res.render("change-password");
})


app.get('/docchange-password/:id',async(req,res)=>{

   const datadoc = await roleModel.find({_id:req.params.id});

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   const temp2 = req.cookies.id;
   const docuser = await roleModel.find({_id:temp2});

   // console.log(datadoc)

   if(user.length>0)res.render("docchange-password",{docdata:datadoc,loginuser:user})
   else if (superuser.length>0)res.render("docchange-password",{docdata:datadoc,loginuser:superuser})
   else res.render("docchange-password",{docdata:datadoc,loginuser:docuser})
})

app.get('/game_categorie/:category',async(req,res)=>{
   let data = await gameModel.find({gamecategories:req.params.category})

   const temp = req.cookies.id;
   const user = await superadminModel.find({_id:temp});

   
   res.render("games",{userData:data,loginuser:user});
})


app.get('/sgame_categorie/:category',async(req,res)=>{

   let data = await gameModel.find({gamecategories:req.params.category})
   const temp = req.cookies.id;

   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await Superadmin.find({_id:temp1});

   
   res.render("sgames",{userData:data,loginuser:user,loginuser:superuser});
})



app.get('/games',async(req,res)=>{

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp2 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp2});

   let data =await gameModel.find()
   var temp1=[];

   data.forEach(element => {
      temp1.push(element.gamecategories);
   }); 
   function removeDuplicates(temp1) {
      return temp1.filter((item, 
          index) => temp1.indexOf(item) === index);
  }
 let newdata=removeDuplicates(temp1);
  res.render("categories",{userData:newdata, loginuser:superuser})
})


app.get('/sgames',async(req,res)=>{

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp2 = req.cookies.id;
   const superuser = await Superadmin.find({_id:temp2});

   let data =await gameModel.find()
   var temp1=[];

   data.forEach(element => {
      temp1.push(element.gamecategories);
   }); 
   function removeDuplicates(temp1) {
      return temp1.filter((item, 
          index) => temp1.indexOf(item) === index);
  }
 let newdata=removeDuplicates(temp1);
  res.render("categories",{userData:newdata, loginuser:user,loginuser:superuser})
})





app.get("/doctor",async(req,res)=>{
   let exist=await roleModel.find({_id:req.cookies.id})

   const temp1 = req.cookies.id;
   let data= await roleModel.find({adminid:temp1});

   let datag= await roleModel.find().sort({_id:1})

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   var array=[]
   datag.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array.push(iso.split("T")[0])
   })
   if(exist.length>0)res.send("admin login required")

   else res.render('doctor',{userData:data,graphDataDoc:array,loginuser:user})
})



app.get("/sdoctor",async(req,res)=>{

   let exist=await roleModel.find({_id:req.cookies.id})
   let data= await roleModel.find().sort({_id:1})
   let datag= await roleModel.find().sort({_id:1})

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});


   const temp1 = req.cookies.id;
   const superuser = await Superadmin.find({_id:temp1});

   var array=[]
   datag.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array.push(iso.split("T")[0])
   })
   
   res.render('sdoctor',{userData:data,graphDataDoc:array,loginuser:user,loginuser:superuser})
})

app.get("/doctor_login",(req,res)=>{

   res.render("doctor_login")
})




app.get("/superadminlogin",(req,res)=>{

   res.render("superAdm_login")
})

app.get("/admin_list",async(req,res)=>{

   const temp = req.cookies.id;
   const user = await Superadmin.find({_id:temp});

   const admin = await registerModel.find();

   res.render('admin_list',{admin:admin,loginuser:user})
})

app.get("/add-doctor",async(req,res)=>{

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   const temp2 = req.cookies.id;
   const docuser = await roleModel.find({_id:temp2});

   if(user.length>0)res.render('add-doctor',{loginuser:user})
   else if (superuser.length>0)res.render('add-doctor',{loginuser:superuser})
   else res.render('add-doctor',{loginuser:docuser})
})

app.get("/doc-dashboard/:id",async(req,res)=>{

   let docdata =await roleModel.find({_id:req.params.id}).sort({_id:-1})

   let data = await patientModel.find({DocId:req.params.id}).sort({_id:-1})

   
   // let datap = await patientModel.find({DocId:req.params.id}).sort({createdAt:1});

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   const temp2 = req.cookies.id;
   const docuser = await roleModel.find({_id:temp2});

   const temp3 = req.cookies.id;
   let datap = await patientModel.find({DocId:temp3}).sort({createdAt:1});

   // var array=[]
   // datap.map(ob =>{
   //    let iso=new Date(ob.createdAt).toISOString();
   //    array.push(iso.split("T")[0])
   // })

   var array2=[]
   datap.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array2.push(iso.split("T")[0])
   })

   console.log(array2)

   if(user.length>0)res.render("doc_dashboard",{userData:data, graphDataPatient:array2, dacdata:docdata, loginuser:user})
   else if(superuser.length>0) res.render("doc_dashboard",{userData:data,graphDataPatient:array2, dacdata:docdata,loginuser:superuser})
   else res.render("doc_dashboard",{userData:data, dacdata:docdata,graphDataPatient:array2,loginuser:docuser})
})


app.get("/doc_maindashboard/:id",async(req,res)=>{
   let docdata =await roleModel.find({_id:req.params.id}).sort({_id:-1})

   let data=await patientModel.find({DocId:req.params.id}).sort({_id:-1})

   let datap=await patientModel.find({DocId:req.params.id}).sort({_id:1})

   var array=[]
   datap.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array.push(iso.split("T")[0])
   })
   res.render("doc_maindashboard",{userData:data,graphData:array,dacdata:docdata})
})



app.get("/patient_dashboard/:id",async(req,res)=>{
      let data=await progressModel.find({"patientId":req.params.id})
      res.render("patient_dashboard",{userData:data})
})

app.get("/patients",async(req,res)=>{ // to render all the paitients 

   const temp1 = req.cookies.id;
   let data = await patientModel.find({adminid:temp1})

   const temp3 = req.cookies.id;
   let exist=await roleModel.find({_id:temp3})

   let datap = await patientModel.find().sort({_id:1})

   let Data = await patientModel.find({DocId:req.cookies.id});

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});


   var array2=[]
   datap.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array2.push(iso.split("T")[0])
   })

   if(exist.length>0)res.render('patients',{userData:Data,loginuser:exist})

   else res.render('patients',{userData:data,graphDataPatient:array2,loginuser:user})
})


app.get("/spatients",async(req,res)=>{ // to render all the paitients 
   let data = await patientModel.find()
   // let exist=await roleModel.find({_id:req.cookies.id})
   let datap = await patientModel.find().sort({_id:1})
   let Data = await patientModel.find({DocId:req.cookies.id});

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await Superadmin.find({_id:temp1});


   const temp2 = req.cookies.id;
   const doc = await roleModel.find({_id:temp2});



   var array2=[]
   datap.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      array2.push(iso.split("T")[0])
   })
   if(user.length>0)res.render('spatients',{userData:Data,graphDataPatient:array2,loginuser:user})
   else if (superuser.length>0) res.render('spatients',{userData:data,graphDataPatient:array2,loginuser:superuser})
   else res.render('spatients',{userData:data,graphDataPatient:array2,loginuser:doc})
})


app.get("/add-patient",async(req,res)=>{

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   const temp2 = req.cookies.id;
   const docuser = await roleModel.find({_id:temp2});

   const admin = await registerModel.find();

   // const admin1 = await roleModel.find({_id:temp});

   if(user.length>0)res.render("add-patient",{loginuser:user,admin:admin})
   else if (superuser.length>0)res.render("add-patient",{loginuser:superuser,admin:admin})
   else res.render("add-patient",{loginuser:docuser,admin:admin})
})

app.get("/add-game",async(req,res)=>{

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await Superadmin.find({_id:temp1});

   res.render("add-game",{loginuser:user,loginuser:superuser})
})

app.get('/edit-doctor/:id',async(req,res)=>{ // api to edit doctor
   const user1 =await roleModel.find({"_id":req.params.id})

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   const temp2 = req.cookies.id;
   const docuser = await roleModel.find({_id:temp2});

   if(user.length>0)res.render("edit-doctor",{userData:user1,loginuser:user})
   else if (superuser.length>0)res.render("edit-doctor",{userData:user1,loginuser:superuser})
   else res.render("edit-doctor",{userData:user1,loginuser:docuser})
})

app.get('/doc-profile/:id',async(req,res)=>{ // api to edit doctor
   const doc=await roleModel.find({"_id":req.params.id})
   res.render("doc-profile",{docData:doc})
})

app.get('/edit-game/:id',async(req,res)=>{
   const user1 =await gameModel.find({"_id":req.params.id})

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   if(user.length>0)res.render("edit-game",{userData:user1,loginuser:user})
   else if(superuser.length>0)res.render("edit-game",{userData:user1,loginuser:superuser})
})

app.get('/edit-patient/:id',async(req,res)=>{
   const user1 =await patientModel.find({"_id": req.params.id})

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   const temp2 = req.cookies.id;
   const docuser = await roleModel.find({_id:temp2});

   if(user.length>0)res.render("edit-patient",{userData:user1,loginuser:user})
   else if(superuser.length>0)res.render("edit-patient",{userData:user1,loginuser:superuser})
   else res.render("edit-patient",{userData:user1,loginuser:docuser})
})


// app.get('/patients-profile/:id',async(req,res)=>{
//    const user=await patientModel.find({"_id": req.params.id})

//    res.render("patients-profile",{userData:user})
// })

app.get('/patients-profile/:id',async(req,res)=>{
   const data=await patientModel.find({"_id": req.params.id});
   const gameData=await progressModel.find({"patientId":req.params.id}).sort({patientId:1})

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});
   // console.log(gameData)
   var array2=[]
   var mpl=new Map();
   var mpp=new Map();
   var mpo=new Map();
   var arrl=[];
   var aloud=[];
   var arrp=[];
   var apitch=[];
   var arro=[];
   var aover=[];

   gameData.map(ob =>{
      let iso=new Date(ob.createdAt).toISOString();
      iso=iso.split("T")[0];
      
      if(ob.gamebase=='Loudness'){
         mpl[iso]=mpl[iso] || []
         mpl[iso].push(parseFloat(ob.overralrating))
      }else if(ob.gamebase=='Frequency'){
         mpp[iso]=mpp[iso] || []
         mpp[iso].push(parseFloat(ob.overralrating))
      }else if(ob.gamebase=='Recogintion'){
         mpo[iso]=mpo[iso] || []
         mpo[iso].push(parseFloat(ob.overralrating))
      } 
      array2.push(iso)
   })

   for(var m in mpl){
      var sum=0;
      aloud.push(m);
      for(var k=0;k<mpl[m].length;k++){
         sum+= Math.abs(mpl[m][k]);
      } 
      arrl.push(sum/mpl[m].length);
   }

   for(var m in mpp){
      var sum=0;
      apitch.push(m);
      for(var k=0;k<mpp[m].length;k++){
         sum+= Math.abs(mpp[m][k]);
      }
      arrp.push(sum/mpp[m].length);
   }

   for(var m in mpo){
      var sum=0;
      aover.push(m);
      for(var k=0;k<mpo[m].length;k++){
         sum+= Math.abs(mpo[m][k]);
      }
      arro.push(sum/mpo[m].length);
   }

   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   const temp2 = req.cookies.id;
   const docuser = await roleModel.find({_id:temp2});

  if(user.length>0) res.render("progress",{userData:data,progress:gameData,graphDataPatient:array2,loudness:arrl,datel:aloud,pitch:arrp,datep:apitch,overrall:arro,dateo:aover,loginuser:user})
  else if (superuser.length>0) res.render("progress",{userData:data,progress:gameData,graphDataPatient:array2,loudness:arrl,datel:aloud,pitch:arrp,datep:apitch,overrall:arro,dateo:aover,loginuser:superuser});
  else res.render("progress",{userData:data,progress:gameData,graphDataPatient:array2,loudness:arrl,datel:aloud,pitch:arrp,datep:apitch,overrall:arro,dateo:aover,loginuser:docuser});
});



// app.get("/user",async(req,res)=>{
//    var temp=req.cookies.id;
//    var data=await registerModel.find({_id:temp})
//    if(data.length ==0){
//       res.send("Doctor");
//    }
//    res.send("Admin")
// });

app.get("/doc_detail_profile/:_id",async(req,res)=>{

   const data = await roleModel.find({"_id":req.params._id});

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   const temp2 = req.cookies.id;
   const docuser = await roleModel.find({_id:temp2});

  if(user.length>0)res.render("doc_detail_profile",{docdata:data,loginuser:user})

   else if(superuser.length>0) res.render("doc_detail_profile",{docdata:data,loginuser:superuser})
   else  res.render("doc_detail_profile",{docdata:data,loginuser:docuser})
})


app.get("/user_detailprofile/:_id",async(req,res)=>{

   const datauser = await patientModel.find({"_id":req.params._id});

 

   const temp = req.cookies.id;
   const user = await registerModel.find({_id:temp});

   
   const temp1 = req.cookies.id;
   const superuser = await superadminModel.find({_id:temp1});

   
   const temp2 = req.cookies.id;
   const docuser = await roleModel.find({_id:temp2});



   if(user.length>0)res.render("user_detailprofile",{datauser:datauser,loginuser:user})
   else if (superuser.length>0)res.render("user_detailprofile",{datauser:datauser,loginuser:superuser})
   else res.render("user_detailprofile",{datauser:datauser,loginuser:docuser})
});

// app.get("/",async(req,res)=>{
//    var temp=req.cookies.id;
//    var data=await roleModel.find({_id:temp})
//    if(data.length !=0){
//       res.send(data[0].fullname);
//    }
//    res.send("Admin")
// })


// app.get("/header",async(req,res)=>{
//    const temp= req.cookies.id;
//    const data =await registerModel.find({_id:temp})
//    res.render("header",{userData:data});
// })



// router.post("/getAvgDaily", async (req, res) => {
//    try {

//        const fromDate = new Date(req.body.fromDate)

//        const toDate = new Date(req.body.toDate)

//        var temp = new Date(req.body.fromDate)

//        var result = []

//        while (temp <= toDate) {

//            var tempPlus1 = new Date(temp.getTime() + 24 * 60 * 60 * 1000)
//            tempPlus1.setUTCHours(0, 0, 0, 0)

//            const obss = await roleModel.find({createdAt: {$gte: temp, $lt: tempPlus1}})

//            if (obss.length == 0) {
//                result.push(0)
//            } else {
//                const total = obss.reduce((total, roleModel) => {
//                    return total + parseInt(obss.length)
//                }, 0)
   
//                result.push(total / obss.length)
//            }
       
//            temp = new Date(temp.getTime() + 24 * 60 * 60 * 1000)
//        }

//        res.status(200).json(result)

//        console.log(result)

//    } catch(err) {
//        console.log(err)
//        res.status(500).json(err)
//    }
// });


// router.post("/getAvgMonthly", async (req, res) => {
//    try {

//        const year = new Date(req.body.year)

//        var date = new Date(year.getFullYear() + "-01-01")

//        var lastDayOfMonth = new Date(year.getFullYear(), date.getMonth() + 1, 1);
//        lastDayOfMonth.setUTCHours(23, 59, 59)

//        // console.log(lastDayOfMonth)

//        var result = []

//        for (var i = 0; i < 12; i++) {

//            // console.log(date)
//            // console.log(lastDayOfMonth)

//            const obss = await roleModel.find({createdAt: {$gte: date, $lte: lastDayOfMonth}})

//            // console.log(obss.length);

//            if (obss.length == 0) {
//                result.push(0)
//            } else {
//                const total = obss.reduce((total, roleModel) => {
//                    return total + parseInt(obss.length)
//                }, 0)
   
//                result.push(total / obss.length)
//            }
       
//            // temp = new Date(temp.getTime() + 24 * 60 * 60 * 1000)

//            date = new Date(lastDayOfMonth.getTime() + 24 * 60 * 60 * 1000)
//            date.setUTCHours(0, 0, 0, 0)

//            lastDayOfMonth = new Date(year.getFullYear(), date.getMonth() + 1, 1);
//            lastDayOfMonth.setUTCHours(23, 59, 59)
//        }

//        res.status(200).json(result)

//        console.log(result)
      

//    } catch(err) {
//        res.status(500).json(err)
//    }
// });


// router.post("/getAvgYearly", async (req, res) => {
//    try {

//        const fromYear = new Date(req.body.fromYear)
//        const toYear = new Date(req.body.toYear)
//        toYear.setDate(31)
//        toYear.setMonth(11)

//        var temp = new Date(fromYear)
//        temp.setDate(1)
//        temp.setMonth(0)

//        var result = []

//        while (temp < toYear) {

//            var tempPlus1 = new Date(temp)
//            tempPlus1.setDate(31)
//            tempPlus1.setMonth(11)
//            tempPlus1.setUTCHours(23, 59, 59)

//            // console.log(temp)
//            // console.log(tempPlus1)

//            const obss = await roleModel.find({createdAt: {$gte: temp, $lte: tempPlus1}})

//            if (obss.length == 0) {
//                result.push(0)
//            } else {
//                const total = obss.reduce((total, roleModel) => {
//                    return total + parseInt(obss.length)
//                }, 0)
   
//                result.push(total / obss.length)
//            }
           
//            temp.setDate(31)
//            temp.setMonth(11)
//            temp = new Date(temp.getTime() + 24 * 60 * 60 * 1000)
//        }

//        res.status(200).json(result)
       
//    } catch(err) {
//        console.log(err)
//        res.status(500).json(err)
//    }
// });







app.listen(process.env.PORT || 4000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 4000))
});