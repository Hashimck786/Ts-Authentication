import express from 'express';


import userRoutes from './Routes/userRoutes'

const PORT = 3000;
const app = express();



app.use(express.json())
app.use('/',userRoutes)

app.listen(PORT,()=>{
  console.log('server is running on port 3000')
});