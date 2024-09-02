import { Router, Response , Request } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();


router.get('/', authMiddleware(['admin']),async(req:Request,res:Response) => {
  const usersList = await prisma.user.findMany({
    include:{
      tasks:true
    }
  });

  res.json({usersList})
})

router.post('/:id',authMiddleware(['admin']), async(req:Request,res:Response) => {
  const {task} = req.body;
  const id = parseInt(req.params.id);
  const createdTask = await prisma.task.create({
    data:{
      task,
      userId:id
    }
  });

  res.status(201).json({createdTask});
})









export default router;