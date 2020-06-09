// imports
const express = require("express");
const cors = require("cors");
const app = express();

// constants
const PORT = 3030;

// middleware
app.use(cors());
app.use(express.json());

// router
// routes used to modify database (not recommendet to expose them if you 
// except you add authorization or use it locally) ---------//
app.use('/api/v1/lang', require('./routers/lang'));      //
app.use('/api/v1/word', require('./routers/word'));      //
app.use('/api/v1/letter', require('./routers/letter'));  //
// ---------------------------------------------------------//

// user routes
// app.use('/api/v1/user', require('./routers/user'));

// public routes (read-only)
app.use('/api/v1/randomWords', require('./routers/randomWords'));
// app.use('/api/v1/customWords', require('./routers/randomWords'));
// app.use('/api/v1/abstractWords', require('./routers/randomWords'));

app.listen(PORT, () => {
  console.error(`app listen on ${PORT}.`);
});
