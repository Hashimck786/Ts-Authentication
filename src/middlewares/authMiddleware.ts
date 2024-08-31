import { Request , Response , NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware  = ( roles: string[] = []) => {return (req:AuthRequest ,res:Response, next:NextFunction) => {
  const authHeader = req.headers.authorization;
  const secretKey = process.env.JWT_SECRET as string;
  if(!authHeader) {
    return res.status(401).send('You are not allowed')
  }
  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  const token = authHeader.split(' ')[1];

  const verified =  jwt.verify(token,secretKey) as JwtPayload;
  req.user = verified;

  if(roles.length && !roles.includes(verified.role)) {
    return res.status(403).json({error: 'Forbidden : insufficient rights'})
  }

  next();
}
 }