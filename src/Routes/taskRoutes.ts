import { Router,Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// get all tasks of user

router.get('/:id',authMiddleware(['user']), async(req:Request ,res:Response) => {
  const userId = parseInt(req.params.id) ;
  const tasks = await prisma.task.findMany({
    where:{userId}
  });

  

  res.json({tasks});
})

// create a task

router.post('/:id', authMiddleware(['user']), async(req:Request , res:Response) => {
  const userId = parseInt(req.params.id) ;
  const {task} = req.body;
  const createdTasks = await prisma.task.create({
    data:{
      task,
      userId
    }
  })

 if(!createdTasks){
  res.sendStatus(401);
 }

 res.status(201).json({createdTasks})
})

// edit a task

router.put('/:taskId',authMiddleware(['user']), async(req:Request , res:Response) => {
  const id = parseInt(req.params.taskId);
  const {task} = req.body

  const updated = await prisma.task.update({
    where: {
      id
    },
    data:{
      task
    }
  });

  res.status(200).json({updated})
})

// delete a task

router.delete('/:taskId',authMiddleware(['user']), async(req:Request ,res:Response) =>{
  const id = parseInt(req.params.taskId);
  
  const deleted = await prisma.task.delete({
    where:{
      id
    }
  })

  res.status(200).json({deleted})
})

export default router