import express from 'express'
import db from '../db.js'
import prisma from '../prismaClient.js'

const router = express.Router()


router.post('/add', async(req, res)=>{

    const {books} = req.body;
    const createdBooks = []

    // const insertBook = db.prepare(`
    //     INSERT INTO books (title, author, cover_url, category, rating, desc)
    //     VALUES (?, ?, ?, ?, ?, ?)
    // `);

    for(const book of books) {
        
        const title = book.title.toLowerCase();
        const author = book.author_name?.[0] || 'Unknown';
        const coverUrl = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : null;
        const {category, desc} = await getMoreInfo(book.key)

        //const bookInfo = insertBook.run(title, author, coverUrl, category, (Math.random() *2 + 3).toFixed(1), desc);
        const createdBook = await prisma.book.create({
            data: {
                title: title,
                author: author,
                cover_url: coverUrl,
                category: category,
                rating: (Math.random() * 2 + 3).toFixed(1),
                desc: desc
            }
        })
        createdBooks.push(createdBook)

    };

    res.json(createdBooks)
})

async function getMoreInfo(key) {
    try{

        const response = await fetch(`https://openlibrary.org${key}.json`);
        const work = await response.json();
        return {
            category: work.subjects?.[0] || '',
            desc: typeof work.description === 'string'
            ? work.description? work.description : ''
            : work.description?.value || ''
        }
    }
    catch(err){
        console.log(err)
    }
}

router.delete('/:id', async (req, res)=>{
    const { id } = req.params;

    // const result = db.prepare(`
    //     DELETE FROM user_books
    //     WHERE id = ?
    // `).run(id);
    const result = await prisma.userBook.delete({
        where: {
            id: Number(id)
        }
    });

    res.json({
        deleted: !!result
    });
})

router.patch('/:id', async (req, res)=>{
    
    const { id } = req.params;
    const {status} = req.body;

    const result = await prisma.userBook.update({
        where: {
            id: Number(id)
        },
        data: {
            status: status
        }
    });

    res.json({
        updated: !!result
    });
})

router.post('/', async (req, res)=>{

    const {status, book_id} = req.body

    const createdBook = await prisma.userBook.create({
        data: {
            user_id: req.user.id,
            book_id: book_id,
            status: status
        }
    });

    res.json({message: 'book added'})

})

router.get('/', async (req, res)=>{

    //  const userBooks = db.prepare(`
    //     SELECT * FROM user_books WHERE user_id = ?
    // `).all(req.user.id)
    const userBooks = await prisma.userBook.findMany({
        where: {
            user_id: req.user.id
        }
    })

    res.json(userBooks)

})


export default router