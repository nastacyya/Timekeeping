const username = document.getElementById('login');
const password = document.getElementById('passw');

window.addEventListener('pageshow', function(event) {
  const token = localStorage.getItem('token');
  const admin = localStorage.getItem('admin');
  const homepage = localStorage.getItem('homepage');
  if (token && admin) {
    window.location.href = '/admin';
  } else if (token && homepage) {
    window.location.href = '/homepage';
  } 
    username.value = "";
    password.value = "";
    localStorage.removeItem('lastActivityTime');
});

// Login by clicking on Enter key
document.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("submit").click();
  }
});

let currentLanguage = 'en'; // set current language lv or en
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
    var creds = {
      "username": username.value,
      "password": password.value
    }

      fetch('/api/loginpass', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Set-cookies": "HttpOnly; Secure",
          "Authorization": "Basic " + btoa(JSON.stringify(creds))
        }
      }) 
      .then(response => response.json())
      .then(data => {
      
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('token', data.token);
        
        fetch(`/api/users`)
        .then(response2 => response2.json())
        .then(users => {
          const userFound = users.find(user => user._id === data.user_id);
            const userRole = userFound.role; // API returns the user's role 
            localStorage.setItem('user_role', userRole);
            
            // Check user roles permissions
            if (userRole === 5) {
              let admin = true;
              localStorage.setItem('admin', admin);
              window.location.href = '/admin';
            } else if (userRole !== 5) {
              let homepage = true;
              localStorage.setItem('homepage', homepage);
              window.location.href = '';
            }
          })
        
      })
      .catch(error => {
        errorText.innerText = vocabulary.invalid[currentLanguage];
        username.style.border = "2px solid #ff3535";
        password.style.border = "2px solid #ff3535";
      });
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
