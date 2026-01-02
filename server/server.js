const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const app = express()

const cookieParser = require('cookie-parser')
app.use(cookieParser())

dotenv.config({path:'./config.env'})

require('./db/conn')

// CORS configuration - allow requests from frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use(require('./router/auth'))



app.listen(3001,() => {
    console.log('Server is running at port 3001');
})