const mongoose=require('mongoose')
const agroexpertschema=mongoose.Schema({
    agroexpertid:{
        type:mongoose.Schema.Types.ObjectId,

        ref:'User'

    },
    educationqualification:{
        type:String,
        required:true

    },
    
});
module.exports=mongoose.model('agroexpert',agroexpertschema);
