import express from 'express'
import db from '../db.js'
import prisma from '../prismaClient.js'

const router = express.Router()

//dashboard
router.get('/', (req, res) => {
    //just authorize, window will redirect in app.js to dashboard
    res.send({
        message: 'user verified'
    });
})

//all books from db
router.get('/books', async(req, res)=>{
    //const books = db.prepare('SELECT * FROM books').all()
    const books = await prisma.book.findMany()
    res.json(books)
})

router.get('/me', async(req, res)=>{

    //const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(req.user.id)
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id
        },
        select: {
            email: true,
            name: true
        }
    })

    res.json(user)
})

export default router



