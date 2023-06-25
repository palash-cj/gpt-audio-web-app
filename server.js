const express = require('express');
const bodyParser = require('body-parser');
const speech=require("./routes/speechRoute");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use("/",speech);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
