
let token;
document.addEventListener('DOMContentLoaded', () => {

  let inputs = document.querySelectorAll('.input')

  for (const bar of inputs) {
      
    
    bar.addEventListener('click', ()=>{ 
      if(bar.value == '')
        renderSearchPanel('idle')
    })

    bar.addEventListener('search', async (e) => {

      if (bar.value == '') return;

      renderSearchPanel('loading', bar.value)

      //find it in database first
      let books = SearchTitleInDatabase(bar.value.toLowerCase())

      //return if found
      if (books){
        //it has book data
        console.log('found in database. ', books)
        renderSearchPanel('found', [books])
        return;
      };

      console.log('cannot found in database.')
      //search online
      books = await SearchBookOnline(bar.value.toLowerCase())

      //it can return many books in book.docs
      if(books!= null){
        console.log('found online, cheking if any exists in datbase, sending ', books.docs)

        const {newBooks, existingBooks} = CheckBooksInDatabase(books.docs)
        
        //add new books to database, existing books are render ready
        if(newBooks.length > 0){
          console.log('found new books to add ', newBooks)

          const newBookIds = await AddNewBooks(newBooks)

          //refresh books array
          await loadDatabaseBooks()

          //get new news data from array to render with existing books
          GetBooksById(newBookIds).forEach(book => existingBooks.push(book))

          renderTabBar();
          renderPanel();
        }

        renderSearchPanel('found', existingBooks)
      }
      else{
        console.log('cannot found online')
        renderSearchPanel('not found', bar.value)
      }

    })

  }

})


function GetBooksById(ids){

  const newBooks= []

  ids.forEach(id=> {

      newBooks.push(books.find(book=> book.id == id))

  })
  return newBooks;
}

async function AddNewBooks(books) {

  //to hold ids of new books in database
  let boodIds = []

  console.log('adding new books')
  try {
    const responce = await fetch('/books/add', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({books: books})
    })

    if(!responce.ok)
      throw Error('canot add books to database')

    //get ids of new inseted books
    boodIds = await responce.json()

  }
  catch (err) {
    console.log('cannot add book')
    throw Error(err)
  }
  console.log('new added books ids ', boodIds)
  return boodIds
}
function CheckBooksInDatabase(onlineBooks) {

  let newBooks = []
  let existingBooks = []

  onlineBooks.forEach(onlineBook =>{

    const find = books.find(book=> 
      book.title === onlineBook.title.toLowerCase() &&
      book.author.toLowerCase() ===
      (onlineBook.author_name?.[0] || 'Unknown').toLowerCase() 
    ) 

    if(find)
      existingBooks.push(find)
    else
      newBooks.push(onlineBook)

  })
  // try{
    
  //   for(const book of books){

  //     const responce = await fetch('/books/check', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': localStorage.getItem('token'),
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         title: book.title.toLowerCase(),
  //         author: book.author_name?.[0] || 'Unknown'
  //       })
  //     })

  //     if (!responce.ok){
  //       console.log('error finding in database, responce.ok for ', book)
  //       continue;
  //     }

  //     //return id of book if found, otherwise null
  //     const id = await responce.json()

  //     if(id ==  null){
  //       //cannot find in database, add in database
  //       newBooks.push(book)
  //     }else{
  //       //add id for latter use
  //       boodIds.push(id)
  //     }

  //   }

  // }
  // catch(err){
  //   console.log('err checking in database ', err)
  //   throw Error(err)
  // }

  console.log('new books ', newBooks, ' exixting book ', existingBooks)
  return {newBooks: newBooks, existingBooks: existingBooks};

}

function SearchTitleInDatabase(title) {
  console.log('searching title in database')

  const reqBook = books.find(book=> book.title == title)
  return reqBook;

  // try {

  //   const responce = await fetch('/books/search', {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': localStorage.getItem('token'),
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({title})
  //   })

  //   if (!responce.ok){
  //     console.log('error finding in database, responce.ok')
  //     return null;
  //   }

  //   const book = await responce.json();

  //   if (!book || book.length <= 0){
  //     console.log('cannot find in database')
  //     return null;
  //   }

  //   return book;

  // }
  // catch (err) {
  //   console.log('err trying fetch from database ', err)
  //   throw Error(err)
  // }
}

async function SearchBookOnline(title) {

  console.log('searching online for ', title)
  let data = null; //to hold book data

  //search online
  try {
    const response = await fetch(
     `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=10`
    )

    if(!response.ok){
      console.log('error fetching, responce.ok')
      return null;
    }

    data = await response.json();
    console.log('book found online', data)
    
    if(!data){
      return null;
    }

    return data;
  }
  catch (err) {
    console.log('err trying fetch from api ', err)
    throw Error(err)
  }
}


const COVER_PALETTE = [
  "#2f4736", "#7a3b2e", "#3c4a63", "#7a5c2e",
  "#4a3b5c", "#2e5c52", "#5c2e3b", "#3b5c4a"
];

let books = []
let user_books = [];
let user;

const TABS = [
  { key: "explore", label: "Explore", empty: "Nothing left to explore", emptyBody: "You've browsed every title in the catalog for now." },
  { key: "currently-reading", label: "Currently Reading", empty: "No books in progress", emptyBody: "Open a title from Explore and mark it as currently reading." },
  { key: "your-books", label: "Your Books", empty: "Your shelf is empty", emptyBody: "Books you add to your library will show up here." },
  { key: "wishlist", label: "Wish List", empty: "No wishlist items yet", emptyBody: "Save titles you want to read later." },
  { key: "finished", label: "Finished", empty: "No finished books yet", emptyBody: "Books you mark as finished will be archived here." }
];

let activeTab = "explore";
let activeBookId = null;

function coverColor(id) {
  return COVER_PALETTE[id % COVER_PALETTE.length];
}

function capitalize(str) {
  if (!str) return ""; // Handle empty strings safely
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function starSvg(filled) {
  return `<svg viewBox="0 0 20 20" class="${filled ? 'star-filled' : 'star-empty'}" fill="currentColor"><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.8l6.1-.7L10 1.5z"/></svg>`;
}

function renderStars(rating, size) {
  let out = "";
  for (let i = 1; i <= 5; i++) out += starSvg(i <= rating);
  return `<span class="${size === 'sm' ? 'stars' : ''}">${out}</span>`;
}

function bookCardHtml(book) {
  
  const isUserBook = userBook(book) != null
  return `
    <button class="book-card" onclick="openModal(${book.id})">
      <div class="book-cover" style="${book.cover_url ? `background-image: url('${book.cover_url}')` : ''}">
        ${isUserBook ? userBook(book).status !== 'explore' ? '<span class="book-status-dot"></span>' : '' : ''}
        <span>${capitalize(book.title)}</span>
      </div>
      <p class="book-category">${book.category}</p>
      <h3 class="book-title">${capitalize(book.title)}</h3>
      <p class="book-author">${book.author}</p>
      ${renderStars(book.rating, 'sm')}
    </button>
  `;
}

function userBook(book) {
  return user_books.find(b => b.book_id == book.id)
}

function renderTabBar() {

  const bar = document.getElementById("tabBar");

  bar.innerHTML = TABS.map(t => {

    const count = books.filter(b => {

      if (t.key == 'explore') {
        return b
      }
      else {
        if (userBook(b) != null) {
          return userBook(b).status == t.key
        } else
          return false;
      }

    }).length;

    return `<button class="tab-btn ${t.key === activeTab ? 'active' : ''}" onclick="switchTab('${t.key}')">
      ${t.label}<span class="tab-count">${count}</span>
    </button>`;

  }).join("");
}

function renderSearchPanel(state, book = null){

  const panel = document.querySelector('.search-result');
  panel.classList.remove('hide-info')

  if(state == 'idle')
  {
   
    panel.innerHTML = `
    <button class="modal-close" onclick="closeSearchPanel()" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <div class="empty-state"><strong>Search</strong>Search Books by Titles</div>`
  }
  else if(state == 'loading')
  {
    panel.innerHTML = `
    <button class="modal-close" onclick="closeSearchPanel()" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <div class="empty-state"><strong>Searching...</strong>Searching for ${book}</div>`
  }
  else if(state == 'not found')
  {
    panel.innerHTML = `
    <button class="modal-close" onclick="closeSearchPanel()" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <div class="empty-state"><strong>Hmm..</strong>No result found for ${book}</div>`
  }
  else if(state == 'error')
  {
    panel.innerHTML = `
    <button class="modal-close" onclick="closeSearchPanel()" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <div class="empty-state"><strong>OOPS!</strong>Cannot Search for thr book</div>`
  }
  else if(state == 'found')
  {
    //in this case, a valid book object
    panel.innerHTML = `
    <button class="modal-close" onclick="closeSearchPanel()" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <div class="book-grid">${book.map(bookCardHtml).join("")}</div>
    `
  }
}
function closeSearchPanel(){
  const panel = document.querySelector('.search-result');
  panel.classList.add('hide-info')
}

function renderPanel() {

  const main = document.getElementById("panelContainer");
  const tab = TABS.find(t => t.key === activeTab);


  const list = tab.key === "explore" ?
    books :
    books.filter(b => {
      if (userBook(b) != null) {
        return userBook(b).status == tab.key
      }
      return false;
    });

  main.innerHTML = `
    <div class="panel-heading">
      <h1>${tab.label}</h1>
      <p>${list.length} book${list.length === 1 ? '' : 's'}</p>
    </div>
    ${list.length === 0
      ? `<div class="empty-state"><strong>${tab.empty}</strong>${tab.emptyBody}</div>`
      : `<div class="book-grid">${list.map(bookCardHtml).join("")}</div>`
    }
  `;
}

async function loadBooks() {

  if (!token) {
    logout()
    return
  }

  //load database books
  await loadDatabaseBooks()
  //user books
  await loadUserBooks()



}

async function loadDatabaseBooks() {

  console.log('loading database books')
  try {
    const responce = await fetch('/app/books', {
      headers: { 'Authorization': token }
    })

    if (!responce.ok) {
      logout()
    }
    else
      books = await responce.json()

  }
  catch (err) {
    throw Error(err)
  }
  console.log('books loaded', books.length)

}

async function loadUserBooks() {
  try {

    const responce = await fetch('/books', {
      headers: { 'Authorization': token }
    })

    if (!responce.ok) {
      logout()

    }
    else
      user_books = await responce.json();

  }
  catch (err) {
    throw Error('cannot fetch user books database')
  }
}

function switchTab(key) {
  activeTab = key;
  renderTabBar();
  renderPanel();
}

function openModal(id) {
  activeBookId = id;
  renderModal();
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  activeBookId = null;
}

function statusLabel(status) {
  const map = {
    "explore": "Not in your library",
    "currently-reading": "Currently reading",
    "your-books": "In your books",
    "wishlist": "On your wish list",
    "finished": "Finished"
  };
  return map[status] || status;
}

async function setStatus(newStatus) {


  const book = books.find(b => b.id === activeBookId);
  const user_book = userBook(book)

  //if it us a user book
  if (user_book) {

    //if clicked the active status
    if (newStatus == user_book.status) {

      //if clicked your-books, and bool is aleready your... then delete
      if (newStatus == 'your-books') {
        await removeBook(user_book)
      }
      else {
        //eg if reading, and then again press reading, then it becomes your-books
        //chnage db status
        await updateBook(user_book, 'your-books')
      }
    }
    else {
      user_book.status = newStatus
      await updateBook(user_book, newStatus)
    }

  } else {
    //if it is not a user book, then its status is explore
    await addBook(book, newStatus)

  }
  await loadUserBooks();
  renderModal();
  renderTabBar();
  renderPanel();
}

async function removeBook(user_book) {

  try {
    const response = await fetch(`/books/${user_book.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });

  }
  catch (err) {
    throw Error(err)
  }

}
async function updateBook(user_book, status) {
  try {
    const response = await fetch(`/books/${user_book.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },

      body: JSON.stringify({
        status: status
      })
    });

  }
  catch (err) {
    throw Error(err)
  }
}
async function addBook(book, status) {
  try {
    const response = await fetch(`/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },

      body: JSON.stringify({
        status: status,
        book_id: book.id
      })

    });
  }
  catch (err) {
    throw Error(err)
  }
}

async function loadUser() {

  token = localStorage.getItem('token');
  try {

    const responce = await fetch(`/app/me`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    })

    if (!responce.ok) {
      logout()
    }

    user = await responce.json()

    const header = document.querySelector('header')
    header.innerHTML = `
      <h1>Welcome ${user.name}</h1>

        <div class="search-input" id= "header-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input class="input" id="input" ="search" placeholder="Search titles" />
        </div>

  <div id="user-info">
    <button class="profile-imgBtn" onclick="toggleInfo()" ></button>
    <p id="name">${user.name}</p>

    <div class="hide-info" id="open-profile" >

      <div id="info">
        <div class="profile-img" style="margin: 0;"></div>
        <div id="credentials">
          <p id="name" style="margin: 0;">${user.name}</p>
          <p id="mail" style="margin: 0;">${user.email}</p>
        </div>
      </div>

      <button id="logout-btn" onclick= "logout()">Log out</button>
    </div>
    
  </div>
    `

  }
  catch (err) {
    throw Error('enable to get user info')
  }

}

function toggleInfo() {

  const panel = document.getElementById('open-profile');
  if (panel.classList.contains('hide-info')) {
    panel.classList.remove('hide-info')
    panel.classList.add('show-info')
  } else {
    panel.classList.remove('show-info')
    panel.classList.add('hide-info')
  }

}
function logout() {
  localStorage.removeItem('token')
  window.location.href = '/index.html'
}

function setRating(value) {
  const book = books.find(b => b.id === activeBookId);
  book.rating = book.rating === value ? 0 : value;
  renderModal();
  renderPanel();
}

function renderModal() {

  const book = books.find(b => b.id === activeBookId);
  if (!book) return;
  const isUserBook = userBook(book) != null;

  const card = document.getElementById("modalCard");

  const ratingButtons = [1, 2, 3, 4, 5].map(i => `
    <button onclick="setRating(${i})" aria-label="Rate ${i} star${i === 1 ? '' : 's'}">
      ${starSvg(i <= book.rating)}
    </button>
  `).join("");
  card.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <div class="modal-cover" style="${book.cover_url ? `background-image: url('${book.cover_url}')` : ''}">
      <span>${capitalize(book.title)}</span>
    </div>
    <div class="modal-body">
      <p class="modal-category">${book.category}</p>
      <h2>${capitalize(book.title)}</h2>
      <p class="modal-author">${book.author}</p>

      <span class="status-pill">
        ${statusLabel(isUserBook ?
    userBook(book).status :
    "explore"
  )}
      </span>

      <div class="desc">${book.desc}</div>

      <div class="rating-block">
        <p class="rating-label">Your rating</p>
        <div class="rating-stars">${ratingButtons}</div>
      </div>

      <div class="modal-actions">
        <button class="btn ${isUserBook ? (userBook(book).status === 'your-books' ? 'is-active' : '') : ''} btn-primary" onclick="setStatus('your-books')">
          ${isUserBook ? userBook(book).status === 'your-books' ? 'In Your Books' : 'Add to Your Books' : 'Add to Your Books'}
        </button>
        <button class="btn ${isUserBook ? userBook(book).status === 'currently-reading' ? 'is-active' : '' : ''}" onclick="setStatus('currently-reading')">
          Currently Reading
        </button>
        <button class="btn ${isUserBook ? userBook(book).status === 'wishlist' ? 'is-active' : '' : ''}" onclick="setStatus('wishlist')">
          Wish List
        </button>
        <button class="btn ${isUserBook ? userBook(book).status === 'finished' ? 'is-active' : '' : ''}" onclick="setStatus('finished')">
          Mark Finished
        </button>
      </div>
    </div>
  `;
}

document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "modalOverlay") closeModal();
});


(async () => {

  await loadUser();
  await loadBooks();
  renderTabBar();
  renderPanel();

})();
