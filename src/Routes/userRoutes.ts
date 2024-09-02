import { Router , Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt  from 'bcrypt';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validate } from "class-validator";
import { LoginDto, RegisterDto } from "../dto/user.dto";
import { authMiddleware } from "../middlewares/authMiddleware";

dotenv.config();

const router = Router();

const prisma =new PrismaClient();


router.get('/',(req,res) => {
  

  res.send('hello i am user')

})

// User register route

router.post('/register', async(req: Request,res: Response) => {
  const registerUserDto = new RegisterDto();
  Object.assign(registerUserDto,req.body);

  const errors = await validate(registerUserDto);

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.map(err => ({
        property: err.property,
        constraints: err.constraints
      }))
    });
  }



  const {name,email,password} = req.body;
  const hashedPassword = await  bcrypt.hash(password,10);

  const emailTaken = await prisma.user.findUnique({
    where:{
      email
    }
  })
  if(emailTaken){
    return res.status(409).send('email already exists')
  }

   const newUser = await prisma.user.create({
    data:{
      name,
      email,
      password:hashedPassword
    }
  });


  res.status(201).json({
    status:'success',
    data:newUser
  });


})

// user login route

router.post('/login', async(req,res) => {
  try {
    const loginDto = new LoginDto();
    Object.assign(loginDto,req.body);

    const errors = await validate(loginDto);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.map(err => ({
          property: err.property,
          constraints: err.constraints
        }))
      });
    }

    const {email,password} = req.body;
  if(!email || !password){
    return res.status(400).send('Email and Password Required');
  }

  const user = await prisma.user.findUnique({
    where:{email}
  })

  if(!user){
    return res.status(404).send('user not found')
  }

  const isPasswordValid = await bcrypt.compare(password,user.password);

  if(!isPasswordValid){
   return res.status(401).send('email and password is invalid')
  }
  
  const jwtsecret = process.env.JWT_SECRET as string;

  const token = jwt.sign({userId:user?.id,role:user?.role,email:user?.email},jwtsecret,{expiresIn : '1h'});

  const refreshToken = jwt.sign({userId:user?.id,role:user?.role,email:user?.email},jwtsecret,{expiresIn : '7d'});



  if(!token){
    return res.sendStatus(401)
  }

  await prisma.refreshToken.create({
    data:{
      token,
      userId:user.id
    }
  });

  

  res.json({token})
  } catch (error) {
    console.log('error during login',error)
    res.status(500).send('Server Error')
  }
})

// User profile route

router.get('/profile',authMiddleware(['user','admin']),async (req:Request,res:Response) => {
  res.send('you are seeing your profile')
})

//  prohibited route just for testing

router.get('/prohibited',authMiddleware(['admin']), async (req:Request,res:Response) => {
  res.send('you are an admin right? bcz you are in a admin only page')
})


// refreshtoken verification

router.post('/refreshtoken',async(req:Request,res:Response) => {
  const {refreshToken} = req.body;
  const refreshjwtsecret = process.env.REFRESH_TOKEN_SECRET as string
  const accessjwtsecret = process.env.JWT_SECRET as string;
  const decoded = jwt.verify(refreshToken,refreshjwtsecret) as { userId: string ,role: string }

  const isToken = prisma.refreshToken.findUnique({
    where:{token:refreshToken}
  })
  if(!isToken ){
    return res.status(403).send('Invalid or expired refrshtoken')
  }

  const token = jwt.sign({userId:decoded.userId,role:decoded.role},accessjwtsecret)

  res.json({token})
});

router.get('/logout/:id',authMiddleware(['user']), async(req:Request, res:Response) => {
  const id = parseInt(req.params.id);

  await prisma.refreshToken.deleteMany({
    where:{userId:id}
  })

  res.sendStatus(200);
})
export default router;