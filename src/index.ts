import express from 'express';


import userRoutes from './Routes/userRoutes'
import taskRoutes from './Routes/taskRoutes'
import adminRoutes from './Routes/adminRoutes'

const PORT = 3000;
const app = express();



app.use(express.json())
app.use('/',userRoutes)
app.use('/task',taskRoutes)
app.use('/admin',adminRoutes)

app.listen(PORT,()=>{
  console.log('server is running on port 3000')
});