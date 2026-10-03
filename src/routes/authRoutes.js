import express from 'express'
import jwt from 'jsonwebtoken'
import db  from '../db.js';
import bcrypt from 'bcryptjs'

const router = express.Router();

router.post('/register', (req, res)=>{

    //req.body has required credentials
    const {name, email, password} = req.body

    //check if user already exists
    try{
        const user = db.prepare(`
            SELECT * FROM users WHERE email = ?
        `).get(email)

        if(user){
            //user found
            if (!bcrypt.compareSync(password, user.password) || user.name != name) {
                return res.status(401).json({
                    message: 'email already in use'
                });
            }
            // Password correct → log them in
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                message: 'Account already existed. Logging in.',
                token
            });
        }

        //user not found, new register

    }
    catch(err)
    {
        res.status(500).json({
            message: 'Something went wrong'
        });
    }

    console.log('new registration')

    try{
        const hashedPassword = bcrypt.hashSync(password, 10);
        const insertUser = db.prepare(`INSERT INTO users (email, name, password) VALUES (?, ?, ?)`)
        const result = insertUser.run(email, name, hashedPassword)

        const token = jwt.sign({id : result.lastInsertRowid}, process.env.JWT_SECRET, {expiresIn: '24h'})
        res.json({token})

    }
    catch(err){
        res.status(500).json({
            message: 'Something went wrong'
        });
    }

})

router.post('/login', (req, res)=>{

    const {email, password} = req.body;

    try{

        const getUser = db.prepare(`SELECT * FROM users WHERE email = ?`)
        const user = getUser.get(email)

        if(!user)
            return res.status(404).send({message: "user not found"})

        const isPasswordValid = bcrypt.compareSync(password, user.password)


        if(!isPasswordValid) 
            return res.status(404).send({message: "wrong password"})


        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token }) 

    }    
    catch(err){
        console.log(err)
        res.sendStatus(503)
    }  

})

export default router 
