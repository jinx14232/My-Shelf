import express from 'express'
import db from '../db.js'

const router = express.Router()

//dashboard
router.get('/', (req, res) => {
    //just authorize, window will redirect in app.js to dashboard
    res.send({
        message: 'user verified'
    });
})

//all books from db
router.get('/books', (req, res)=>{
    const books = db.prepare('SELECT * FROM books').all()
    res.json(books)
})

router.get('/me', (req, res)=>{
    const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(req.user.id)
    res.json(user)
})

export default router



