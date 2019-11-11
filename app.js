const express=require("express");
const app=express();
const morgan=require("morgan");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");

const userroutes=require('./routes/signup');

// mongoose.connect('mongodb+srv://DeviNeeharika:'+
// process.env.MONGO_ATLAS_PW +
// '@cluster0-6usfw.mongodb.net/test?retryWrites=true&w=majority',{
//     useNewUrlParser: true,
//     useUnifiedTopology: true  
// })
mongoose.connect("mongodb://localhost:27017/healthyharvest");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

app.use("/users",userroutes)



// app.use((req,res,next) =>{
//     const error=new Error(
//         'NOT FOUND'
//     );
//     error.status=404;
//     next(error);
// })
// app.use((req,res,next)=>{
//     res.status(errorstatus || 500);
//     res.json({
//         error:{
//             message:error.message
//         }
//     })
// })

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Backend is running on port ${port}`);
})