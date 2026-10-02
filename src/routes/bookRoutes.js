import express from 'express'
import db from '../db.js'

const router = express.Router()


router.post('/add', async(req, res)=>{

    const {books} = req.body;
    const ids = []

    const insertBook = db.prepare(`
        INSERT INTO books (title, author, cover_url, category, rating, desc)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    for(const book of books) {
        
        const title = book.title.toLowerCase();
        const author = book.author_name?.[0] || 'Unknown';
        const coverUrl = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : null;
        const {category, desc} = await getMoreInfo(book.key)

        const bookInfo = insertBook.run(title, author, coverUrl, category, (Math.random() *2 + 3).toFixed(1), desc);
        ids.push(bookInfo.lastInsertRowid)

    };

    res.json(ids)
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
router.post('/check', (req, res)=>{
    
    const {title, author} = req.body

    const reqBook = db.prepare(
        `SELECT * FROM books WHERE title = ? AND author = ?`
    ).all(title, author)

    if(reqBook != null)
        res.json(reqBook[0].id)
    else
        res.json(null)

})

router.post('/search', (req, res)=>{
    
    const {title} = req.body

    const reqBook = db.prepare(
        `SELECT * FROM books WHERE title = ? `
    ).all(title)

    if(reqBook != null)
        res.json(reqBook)
    else
        res.json(null)

})

router.delete('/:id', (req, res)=>{
    const { id } = req.params;

    const result = db.prepare(`
        DELETE FROM user_books
        WHERE id = ?
    `).run(id);

    res.json({
        deleted: result.changes > 0
    });
})

router.patch('/:id', (req, res)=>{
    
    const { id } = req.params;
    const {status} = req.body;

    const result = db.prepare(`
        UPDATE user_books
         status = ?
        WHERE id = ? 
    `).run(status, id);

    res.json({
        deleted: result.changes > 0
    });
})

router.post('/', (req, res)=>{

    const {status, book_id} = req.body

     const insertBook = db.prepare(`
        INSERT INTO user_books (user_id, book_id, status)
        VALUES (?, ?, ?)
    `).run(req.user.id, book_id, status)

    res.json({message: 'book added'})

})

router.get('/', (req, res)=>{

     const userBooks = db.prepare(`
        SELECT * FROM user_books WHERE user_id = ?
    `).all(req.user.id)

    res.json(userBooks)

})


export default router