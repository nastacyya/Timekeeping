// window.addEventListener('pageshow', function(event) {
//   if(localStorage.getItem('token')) {
//       window.location.href = '/homepage';
//     } 
  
// });

// Login by clicking on Enter key
document.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("submit").click();
  }
});

let currentLanguage = 'ru'; // Установите текущий язык (может быть, например, 'ru' или 'en')
let vocabulary; // Declare a variable to store translations

document.addEventListener('DOMContentLoaded', function() {
  fetch('/static/translate/translations.json')  
      .then(response => response.json())
      .then(data => {
        vocabulary = data; // Store translations in the variable
        applyTranslations(); 
      })
      .catch(error => console.error('Error:', error));
});

function applyTranslations() {
  document.getElementById('title').textContent = vocabulary.title[currentLanguage];
  document.getElementById('login').placeholder = vocabulary.username[currentLanguage];
  document.getElementById('passw').placeholder = vocabulary.password[currentLanguage];
  document.getElementById('submit').textContent = vocabulary.submit[currentLanguage];
}

//Login function
function submitForm() {
    const username = document.getElementById('login');
    const password = document.getElementById('passw');
    var errorText = document.getElementById("errorText");

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
    
            // var creds = {
            //     "login": username.value,
            //     "passw": password.value
            //     }
                fetch('/mock/creds.json')  
                .then(response => response.json())
                .then(data => {
                  if (username.value === data.username && password.value === data.password) {
                    localStorage.setItem('user_id', data.user_id);
                   
                    console.log(`user_id: ${data.user_id}`);
                    fetch('/mock/token.json')  
                    .then(response => response.json())
                    .then(user => {
                      if (data.user_id === user.user_id) {
                        console.log(`token: ${user.token}`);
                        localStorage.setItem('token', user.token);
                        window.location.href = '/templates/homepage.html';
                      }
                    })
                     
                  } else {
                    errorText.innerText = vocabulary.invalid[currentLanguage];
                    username.style.border = "2px solid #ff3535";
                    password.style.border = "2px solid #ff3535";
                  }
                })
                .catch(error => console.error('Error:', error));

/* 
                try {
                    const data = await response.json();
            
                    if (data.token && data.user_id) {
                      
                      localStorage.setItem('token', data.token);
                      localStorage.setItem('user_id', data.user_id);
                      const response2 = await fetch(`/api/users/${data.user_id}`, {
                        headers: {
                            'Authorization': "Bearer " + data.token
                        }
                    });
                
                    try {
                        const role_data = await response2.json();
                        const userRole = role_data.role; // API returns the user's role in a field called 'role'
                        localStorage.setItem('user_role', userRole);
                        // Check user roles permissions
                        if (userRole === 5) {
                          window.location.href = '/admin';
                        } else if (userRole !== 5) {
                          window.location.href = '/homepage';
                        }
                        
                      } catch (error) {
                          console.error('Error:', error);
                          return null;
                      }
                      
                   
                } catch (error) {
                    console.error('Error:', error);
                } 
                 */
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




