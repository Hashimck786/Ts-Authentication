import express from 'express';

const PORT = 3000;
const app = express();


app.get('/',(req,res)=>{
  res.send('hello there ');
});
app.listen(PORT,()=>{
  console.log('server is running on port 3000')
});