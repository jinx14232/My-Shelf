
import db from '../src/db.js'

const rating = (Math.random() *2 + 3).toFixed(1)

const categories = [
    'fantasy',
    'mystery',
    'thriller',
    'science fiction',
    'romance'
];  

const insertBook = db.prepare(`
        INSERT INTO books (title, author, cover_url, category, rating, desc)
        VALUES (?, ?, ?, ?, ?, ?)
    `);


for (const cat of categories) {

    const response = await fetch(
        'https://openlibrary.org/search.json?q=' + cat + '&limit=10'
    );

    const data = await response.json();

    console.log(`Received ${data.docs.length} books`);

    for (const book of data.docs) {

        const title = book.title.toLowerCase();
        const author = book.author_name?.[0] || 'Unknown';
        const coverUrl = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : null;
        const {category, desc} = await getMoreInfo(book.key)

        insertBook.run(title, author, coverUrl, category, rating, desc);
    }

    console.log(`Books from ${cat} inserted successfully!`);
}

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


