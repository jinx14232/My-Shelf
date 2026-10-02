function togglePassword(id, btn) {
    const input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
}

const emailI = document.getElementById("email");
const passwordI = document.getElementById("password");
const nameI = document.getElementById("name");
const form = document.querySelector('form')

const apiBase = "/";
let token;
let endPoint;

localStorage.clear()

form.addEventListener('submit', (e) => {
    endPoint = form.dataset.endpoint;
    e.preventDefault()
    Authenticate()
})

function validMail(mail){
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(mail);
}
function validName(name){
    return /^[A-Za-z ]+$/.test(name);
}

function hideMailWar(){
    const warning = document.getElementById('email-warning')
    if(!warning) return
    warning.classList.remove('warning')
    warning.classList.add('warning-hide')
}

function hideNameWar(){
    const warning = document.getElementById('name-warning')
    if(!warning) return
    warning.classList.remove('warning')
    warning.classList.add('warning-hide')

}
function hideErrLine(){
    const warning = document.getElementById('login-err')
    if(!warning) return
    warning.innerText = ''
    warning.classList.remove('warning')
    warning.classList.add('warning-hide')
}

function showMailWar(){
    const warning = document.getElementById('email-warning')
    if(!warning) return
    warning.classList.remove('warning-hide')
    warning.classList.add('warning')
}

function showNameWar(){

    const warning = document.getElementById('name-warning')
    if(!warning) return
    warning.classList.remove('warning-hide')
    warning.classList.add('warning')
}
function showErrLine(err){

    const warning = document.getElementById('login-err')
    if(!warning) return
    warning.innerText = err
    warning.classList.remove('warning-hide')
    warning.classList.add('warning')
}


async function Authenticate() {

    hideMailWar()
    hideNameWar()
    hideErrLine()

    //get credentials
    const email = emailI.value;
    const password = passwordI.value;
    const name = nameI? nameI.value : ''
    
    if(!validMail(email)){
        
        showMailWar()
        return
    }
    if(nameI && !validName(name)){
        
        showNameWar()
        return
    }

    const body = {
        name: name,
        email: email,
        password: password
    }


    try {
        const responce = await fetch(apiBase + endPoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        let data = await responce.json();

        if (data.token) {
            token = data.token;
            localStorage.setItem("token", token);
            ShowDashboard()
            return
        }
        else if(data.message == 'user not found'){
            showErrLine('User not found')
            return
        }
        else if(data.message == 'wrong password'){
            showErrLine('Wrong Password')
            return
        }
        else if(data.message == 'email already in use')
        {
            showErrLine('E-mail already in use')
            return
        }
        else if(data.message == 'invalid token' || data.message == 'no token provided' )
        {
            localStorage.clear()
            window.location.href = '/index.html'
        }

    } catch (err) {
        throw Error("Failed to authenticate");
    }

}

async function ShowDashboard() {

    const token = localStorage.getItem('token')

    try {

        //load dashboard file, header for middle ware auth
        const response = await fetch(apiBase + 'app', {
            headers: { 'Authorization': token }
        })

        const data = await response.json()

        if (!response.ok) {

            localStorage.removeItem('token');
            window.location.href = '/index.html';

        } else {
            window.location.href = '/dashboard.html';
        }

    } catch (err) {
        throw Error('unable to show dashboard')
    }
}