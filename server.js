const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const itemRouter = require('./routers/item/item');
const loginRouter = require('./routers/login/login');

const app = express();

app.use(session({
  secret: 'peterhandsome',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

app.use(express.json()); 
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
}));

app.use('/product', itemRouter);
app.use('/member', loginRouter);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(5500, () => {
  console.log(`Server is running on port 5500`);
});

