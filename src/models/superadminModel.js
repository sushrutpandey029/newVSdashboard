const mongoose = require("mongoose")

const SuperadminSchema = new mongoose.Schema({

    username:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },

    password:{
        type:String,
        required:true,
        trim:true
    },

    phone:{
        type:String,
        required:true,
        trim:true
    },
    
    isSuperadmin:{
        type:String,
        default:true
    }
})

const Superadmin = new mongoose.model("Superadmin",SuperadminSchema);
module.exports = Superadmin
