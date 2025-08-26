require('dotenv').config()
const express = require("express")
const app = express();

app.get('/' , ()=>{
    res.send('This is considered as home page')
})

app.use(express.json())
app.use(express.static('public'))







app.listen(process.env.PORT || 3000 , (req,res)=>{
     console.log("server listen on port no 3000")
})