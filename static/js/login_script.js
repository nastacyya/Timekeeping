const username = document.getElementById('login');
const password = document.getElementById('passw');

window.addEventListener('pageshow', function(event) {
  if(localStorage.getItem('token')) {
      window.location.href = '/templates/homepage.html';
    } 
  username.value = "";
  password.value = "";
  localStorage.removeItem('lastActivityTime');
  localStorage.removeItem('loginTime');
});

// Login by clicking on Enter key
document.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("submit").click();
  }
});

let currentLanguage = 'en'; // Установите текущий язык (может быть, например, 'ru' или 'en')
let vocabulary; // Declare a variable to store translations
var errorText = document.getElementById("errorText");

document.addEventListener('DOMContentLoaded', function() {
  fetch('/static/translate/translations.json')  
      .then(response => response.json())
      .then(data => {
        vocabulary = data; // Store translations in the variable
        applyTranslations(); 
      })
      .catch(error => console.error('Error:', error));

    username.addEventListener('input', () => {
      username.style.border = "2px solid #ccc";
      password.style.border = "2px solid #ccc";
      errorText.innerText = "";
    });
    password.addEventListener('input', () => {
      username.style.border = "2px solid #ccc";
      password.style.border = "2px solid #ccc";
      errorText.innerText = "";
    })
});

function applyTranslations() {
  document.getElementById('title').textContent = vocabulary.title[currentLanguage];
  username.placeholder = vocabulary.username[currentLanguage];
  password.placeholder = vocabulary.password[currentLanguage];
  document.getElementById('submit').textContent = vocabulary.submit[currentLanguage];
  const expired = localStorage.getItem('expired');
  
  if(expired) {
    errorText.innerText = vocabulary.session[currentLanguage];
    localStorage.removeItem('expired');
  } else {
    errorText.innerText = "";
  }
}

//Login function
function submitForm() {
    // Check if login or password is empty
    if (username.value === "" || password.value === "") {
      errorText.innerText = vocabulary.fill_in[currentLanguage];
        if (username.value === "") {
            username.style.border = "2px solid #ff3535"; 
         } else {
             login.style.border = "2px solid #ccc"; // Reset border color
        }
        if (password.value === "") {
            password.style.border = "2px solid #ff3535";
         } else {
            password.style.border = "2px solid #ccc"; // Reset border color
        }
        return;
        
    } else {
    username.style.border = "2px solid #ccc";
    password.style.border = "2px solid #ccc";
    errorText.innerText = "";
    
                fetch('/mock/creds.json')  
                .then(response => response.json())
                .then(data => {
                  const existing = data.find(access => access.username === username.value);
                  if (existing) {
                    localStorage.setItem('user_id', existing.user_id);

                    fetch('/mock/token.json')  
                    .then(response => response.json())
                    .then(tokens => {
                      const user_found = tokens.find(token => token.user_id === existing.user_id);
                      if (user_found) {
                        localStorage.setItem('token', user_found.token);
                        window.location.href = '';
                      }
                    })
                     
                  } else {
                    errorText.innerText = vocabulary.invalid[currentLanguage];
                    username.style.border = "2px solid #ff3535";
                    password.style.border = "2px solid #ff3535";
                  }
                })
                .catch(error => console.error('Error:', error));
        }
                   
}


// Show-hide password function
function show() {
  var x = document.getElementById("passw");
  if (x.type === "password") {
    x.type = "text";
    document.getElementById("showimg").src =
      "/static/img/show-regular-24.png";
  } else {
    x.type = "password";
    document.getElementById("showimg").src =
      "/static/img/hide-solid-24.png";
  }
}




