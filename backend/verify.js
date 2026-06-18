const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const verificationToken = new mongoose.Schema({
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Users',
        required : true,
    },
    token : {
        type : String,
        required : true,
    },
    createdAt : {
        type : Date,
        expires : 3600,
        default : Date.now(),
    }
})

verificationToken.pre("save",async function(next){
    if(this.isModified("token")){
        try {
            const hash = await bcrypt.hash(this.token, 8);
            this.token = hash;
        }catch (error) {
            next(error);
        }
    }

    next();
})

verificationToken.methods.compareToken = async function (token){
    const result = await bcrypt.compareSync(token,this.token);
    return result;
}

module.exports = mongoose.model("VerificationToken",verificationToken);
