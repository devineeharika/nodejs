const mongoose=require('mongoose')
const farmerschema=mongoose.Schema({
    farmerid:{
        type:mongoose.Schema.Types.ObjectId,

        ref:'User'

    },
        latitude:{
        type:Number,
        required:true

    },
    longitude:{
        type:Number,
        required:true

    },
    
});
module.exports=mongoose.model('farmer',farmerschema);
