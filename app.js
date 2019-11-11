const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
//Load User Model
require("./models/User");
require("./models/Story");

//Passport Confing
require("./config/passport")(passport);

//Load Routs
const auth = require("./routes/auth");
const index = require("./routes/index");
const stories = require("./routes/stories");

//Load Keys
const keys = require("./config/keys");

//Handle Halpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require("./helpers/hbs");
//Map global promises
mongoose.Promise = global.Promise;

//Mongoose Connect
mongoose
  .connect(keys.mongoURI, {
    // useMongoClient: true
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const app = express();

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Method Override Middleware
app.use(methodOverride("_method"));

//Handlebars Middleware
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      truncate: truncate,
      stripTags: stripTags,
      formatDate: formatDate,
      select: select,
      editIcon: editIcon
    },
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Use Routes
app.use("/auth", auth);
app.use("/", index);
app.use("/stories", stories);

//Connectin the given port
const port = process.env.PORT || 5000;

//listen this port Number
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
