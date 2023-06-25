const express=require('express');
const app=express.Router();
const {ask,home}=require("../controller/speechController");

app.get('/', home);
app.post('/ask', ask);

module.exports=app;