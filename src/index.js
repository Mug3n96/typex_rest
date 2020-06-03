// imports
const express = require("express");
const cors = require("cors");
const app = express();


// constants
const PORT = 3030;

// middleware
app.use(cors());
app.use(express.json());

// routers
app.use('/api/v1/lang', require('./routers/lang'));
app.use('/api/v1/word', require('./routers/word'));
app.use('/api/v1/letter', require('./routers/letter'));



app.listen(PORT, () => {
  console.error(`app listen on ${PORT}.`);
});
