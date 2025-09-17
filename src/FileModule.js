import express from "express";

const app = express();
// app.use();  Ya aik middleware function hai jo har ek request par chala jata hai and make sure that ya always kisi bhi routes sa pahla hi chal jata hai
//is ma 3 cheeza pass hoti hai req, res, next
//req is the request object
//res is the response object
//next is the next function
app.use((req, res, next) => {
  console.log('In the middleware');
  next(); // next() is a function that is used to call the next middleware function
  // if we don't call next() then the request will be stuck and the server will not send the response
});
app.get('/', (req, res) => {
  res.send('Hello from express');
})
//Dynamic route
app.get('/user/:id', (req, res) => {
  res.send(`User ID is ${req.params.id}`);
})

/**
 Setting - Up EJS in Express
 1) npm install ejs
 2) Configure EJS in Express 
    app.set('view engine', 'ejs');
 3) app.get('/', (req, res)=>{
    res.render('Home');
  })
 4) create a views folder and a Home.ejs file
 5) in Home.ejs file write the code you want to display
 6) in the app.js file write the code to render the Home.ejs file
 */
app.use(express.static('./Views'));

//Setting up Static Files in ExpressJS
/**
1) Makes a public folder and server all the files inside it
2) Inside the public folder makes three more sub folders named as
   (i) Images, (ii) Stylesheets, (iii) JavaScript
3) Now configure the Static Files in ExpressJS
   app.use(express.static('./Public'));
4) Now we can see our images in the browser by writing the path in the URL as follows:
   http://localhost:3000/Images/image.png
 */

// Example in-memory users array
let users = [
  { id: 1, name: "Hamza" },
  { id: 2, name: "Ali" }
];

// GET all users
app.get("/users", (req, res) => {
  res.json(users); // Send JSON response
});

// POST a new user
app.use(express.json());
app.post("/users", (req, res) => {
  const newUser = req.body;
  users.push({ id: users.length + 1, ...newUser });
  res.send(`User ${newUser.name} created`);
});

//Error Handling Middleware
app.use((err, req, res, next) => {
  if(res.headersSent){
    return next(err);
  }
  res.status(500);
  //res.render('error', {error: err}); used to send custom error messages accurately
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})

//Express Generator: ya hmarra express app ko create karne ma help karta hai aur time ko save karta hai
/**
 1) npm install express-generator-g
 2) express --view=ejs myapp
 3) cd myapp
 4) npm install
 */

 /*
 Zod Request payload validation:
 Basically it is a validation library for the request payload and we can use it as a runtime + static validation 
 1) npm install zod
 2) import zod from 'zod';
 3) const schema = zod.object({
    name: zod.string().min(3),
    age: zod.number().min(18),
  });
 */
 
 /*
 Setting up the MongoDB in ExpressJS
 1) npm install mongoose
 2) import mongoose from 'mongoose';
 3) mongoose.connect('mongodb://localhost:27017/mydatabase');
 4) creating a schema model as
    const userSchema = new mongoose.Schema({
       name: String,
       age: Number,
    })
 5) module.exports = mongoose.model('User', userSchema);
 6) now we can use the model to create a new user as
    const user = new User({name: 'Hamza', age: 20});
    user.save();
 7) now we can use the model to get all the users as
    User.find();
 8) now we can use the model to get a single user as
    User.findById(id);
 9) now we can use the model to update a user as
    User.findByIdAndUpdate(id, {name: 'Hamza', age: 20});
 10) now we can use the model to delete a user as
    User.findByIdAndDelete(id);
 11) now we can update the user as
    User.findByIdAndUpdate(id, {name: 'Hamza', age: 20});
 */

// Client = cookie save data at the frontend side or Browser
// Server = session save data in the server

//Understading session in ExpressJS
/**
 1) npm install express-session
 2) import express-session from 'express-session';
 3) app.use(express-session({
       secret: 'your-secret-key',
       resave: false,
       saveUninitialized: true,
    }))
 4) now we can use the session in the routes as
    req.session.user = {id: 1, name: 'Hamza'};
 5) now we can use the session in the routes as
    req.session.user.name = 'Ali';
 6) now we can use the session in the routes as
    req.session.destroy(); to delete the session
 */

/**
 1) Flash messages are used to display messages to the user after a request is made they are mostly like as alerts, warnings, etc.
 2) npm install connect-flash
 3) make sure that put the flash in app.use function before the routes
 4) create flash in any route
 5) we cannot use the flash without setting up the session
 6) app.use(flash());
 7) aik route ma flash ka data ko set karo aur phir dosra routes ma usko display karwano
 */