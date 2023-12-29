window.addEventListener('pageshow', function(event) {
    if(!localStorage.getItem('token')){
        window.location.href = '/';
    }
    if(!localStorage.getItem('admin')){
        window.location.href = '/';
    }
});

let currentLanguage = 'en'; 
const token = localStorage.getItem('token');
const logoutBtn = document.getElementById('logout-btn');
const database = document.querySelector('.database');
const departments = document.getElementById('departments');
const absences = document.getElementById('absence-types');
const users = document.getElementById('users');
const authorization = document.getElementById('auth');
const addBtn = document.querySelector('.add-btn');
const list = document.querySelector('.list');
const form = document.querySelector('.form');
const deleteBtn = document.querySelector('.delete-btn');
const updateBtn = document.querySelector('.update-btn');
const saveBtn = document.querySelector('.save-btn');
var errorText = document.getElementById("errorText");
const sectionsList = document.querySelector('.sections-list');
const styleSheet = document.styleSheets[0];
let selected_id;
let currentSection = '';
let selectedItem = false;
let addMode = false;

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
    document.getElementById('admin').textContent = vocabulary.admin[currentLanguage];
    document.getElementById('logout-btn').textContent = vocabulary.exit[currentLanguage];
    document.getElementById('users').textContent = vocabulary.users[currentLanguage];
    document.getElementById('auth').textContent = vocabulary.auth[currentLanguage];
    document.getElementById('departments').textContent = vocabulary.departments[currentLanguage];
    document.getElementById('absence-types').textContent = vocabulary.absence_types[currentLanguage];
    deleteBtn.textContent = vocabulary.delete_btn[currentLanguage];
    updateBtn.textContent = vocabulary.update[currentLanguage];
    addBtn.textContent = vocabulary.add_record[currentLanguage];
    saveBtn.textContent = vocabulary.save_btn[currentLanguage];
}

document.addEventListener ('DOMContentLoaded', function() { 
    localStorage.setItem('loginTime', new Date().getTime());  //Set time for expiry token tracking

    errorText.innerHTML = "";
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    })
    departments.addEventListener('click', () => {
        currentSection = 'departments';
        switchedSection();
        departmentsList();
    })
    absences.addEventListener('click', () => {
        currentSection = 'absences';
        switchedSection();
        absencesList();
    })
    users.addEventListener('click', () => {
        currentSection = 'users';
        switchedSection();
        usersList();
    })
    authorization.addEventListener('click', () => {
        currentSection = 'authorization';
        switchedSection();
        authList();
    })

    sectionsList.addEventListener('click', (event) => {
        const targetLi = event.target.closest('li');
        const liElements = sectionsList.getElementsByTagName('li');
        if (targetLi) {
            for (const li of liElements) {
                li.classList.remove('marked');
            }
            // Add "marked" class to the clicked <li> element
            targetLi.classList.add('marked');
        }
    });

    deleteBtn.addEventListener('click', () => {
        if(selectedItem === true) {
            deleteRecord(selected_id, currentSection);
        } else {
            errorText.innerHTML = "<span>* </span>" + vocabulary.choose[currentLanguage];
        }
    })

    updateBtn.addEventListener('click', () => {
        if(selectedItem === true) {
            const inputs = document.querySelectorAll('.edit-form input');
            if ([...inputs].every(input => (input.id !== 'def_hours' && input.value !== "") || input.id === 'def_hours')) {
                if (errorText.innerHTML != "") {
                    return;
                } else {
                    updateRecord(selected_id, currentSection);
                }
            } else {
                if (currentSection === "users") {
                    errorText.innerHTML = "<span>* </span>" + vocabulary.fill_required[currentLanguage];
                } else if (currentSection === "authorization") {
                    errorText.innerHTML = "<span>* </span>" + vocabulary.enter_pw[currentLanguage];
                } else {
                    errorText.innerHTML = "<span>* </span>" + vocabulary.fill_in[currentLanguage];
                }
            }
        } else {
            errorText.innerHTML = "<span>* </span>" + vocabulary.choose[currentLanguage];
        }
    })
    addBtn.addEventListener('click', () => {
        const list = document.querySelector('.list');
        const inputs = document.querySelectorAll('.edit-form input');
        const user_id_div = document.querySelector('.user_id_div');
        const pw = document.getElementById('password');
        if(addMode){
            addMode = false;
            errorText.innerHTML = "";
            addBtn.textContent = vocabulary.add_record[currentLanguage];
            list.style.display = 'flex';
            inputs.forEach(input => {
                input.setAttribute('readonly', 'true');
                input.value = "";
                input.style.outlineColor = "transparent";
            })
            deleteBtn.style.display = "block";
            updateBtn.style.display = "block";
            saveBtn.style.display = "none";
            if(user_id_div){
                user_id_div.style.display = "none";
            }
        } else {
            addMode = true;
            errorText.innerHTML = "";
            selectedItem = false;
            list.style.display = 'none';
            inputs.forEach(input => {
                input.removeAttribute('readonly');
                input.value = "";
                input.addEventListener('input', () => {
                    errorText.innerHTML = "";
                })
                input.style.outlineColor = "rgb(186, 186, 186)";
            })
            addBtn.textContent = vocabulary.cancel[currentLanguage];
            deleteBtn.style.display = "none";
            updateBtn.style.display = "none";
            saveBtn.style.display = "block";
            const previousSelected = document.querySelector('.selected');
            if (previousSelected) {
                previousSelected.classList.remove('selected');
            }
            if(user_id_div){
                user_id_div.style.display = "flex";
            }
            if(pw){
                pw.placeholder = "";
            }
        }
    })
    saveBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.edit-form input');
        if ([...inputs].every(input => (input.id !== 'def_hours' && input.value !== "") || input.id === 'def_hours')) {
            if (errorText.innerHTML != "") {
                return;
            } else {
                addRecord(currentSection);
            }
        } else {
            if (currentSection === "users") {
                errorText.innerHTML = "<span>* </span>" + vocabulary.fill_required[currentLanguage];
            } else {
                errorText.innerHTML = "<span>* </span>" + vocabulary.fill_in[currentLanguage];
            }
        }
    })

});

function switchedSection() {
    addMode = false;
    addBtn.textContent = vocabulary.add_record[currentLanguage];
    list.style.display = 'flex';
    addBtn.style.display = "block";
    deleteBtn.style.display = "block";
    updateBtn.style.display = "block";
    saveBtn.style.display = "none";
    list.innerHTML = '';
    form.innerHTML = '';
    selectedItem = false;
    errorText.innerHTML = "";
}

function departmentsList() { 
    form.innerHTML = `
        <form class="edit-form">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name">
            <label for="value">Value:</label>
            <input type="text" id="value" name="value">
        </form>
        `; 
    const inputs = document.querySelectorAll('.edit-form input')
    const depName = document.getElementById("name");
    const depValue = document.getElementById("value");
    fetch('/api/departments',)
    .then(response => response.json())
    .then(departments => {
        const ul = document.createElement('ul');
        inputs.forEach(input => {
            input.setAttribute('readonly', 'true');
            input.style.outlineColor = "transparent";
        })
        departments.forEach(department => {
            const li = document.createElement('li');
            li.innerHTML = `${department.name}`;
            ul.appendChild(li);
            li.addEventListener('click', () => {
                selectedItem = true;
                errorText.textContent = "";
                const previousSelected = ul.querySelector('.selected');
                if (previousSelected) {
                    previousSelected.classList.remove('selected');
                }
                li.classList.add('selected');
                inputs.forEach(input => {
                    input.removeAttribute('readonly', 'true');
                    input.style.outlineColor = "rgb(186, 186, 186)";
                })
                depName.value = department.name;
                depValue.value = department.value;
                selected_id = department._id;
                return selected_id;
            })
        })
        list.appendChild(ul);
    })
 
    depName.addEventListener('input', () => {
        errorText.innerHTML = "";
    });

    depValue.addEventListener('input', () => {
        depValue.value = depValue.value.replace(/\D/g, '');
        fetch('/api/departments')
        .then(response => response.json())
        .then(departments => {
            const enteredValue = depValue.value.trim(); // Trim to remove leading/trailing whitespace

            // Check if entered value exists in the list of departments
            const departmentExists = departments.some(department => department.value === parseInt(enteredValue));
            // Check if entered value is equal to the value of the selected department
            const isSelectedDepartment = selected_id && departments.some(department => department._id === selected_id && department.value === parseInt(enteredValue));
            
            // Display error message based on the results
            if (departmentExists && !isSelectedDepartment) {
                errorText.innerHTML = "<span>* </span>" + vocabulary.exist_value[currentLanguage];
            } else {
                errorText.innerHTML = "";
            }
        })
        .catch(error => {
            console.error('Error fetching departments:', error);
        });
    });
}

function absencesList() {
    form.innerHTML = `
        <form class="edit-form">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name">
            <label for="value">Value:</label>
            <input type="text" id="value" name="value">
            <label for="short_name">Short_name:</label>
            <input type="text" id="short_name" name="short_name">
        </form>
        `;  
    const inputs = document.querySelectorAll('.edit-form input')
    const absName = document.getElementById("name");
    const absValue = document.getElementById("value");
    const absShort = document.getElementById("short_name");
    fetch('/api/absence_types')
    .then(response => response.json())
    .then(absences => {
        const ul = document.createElement('ul');
        inputs.forEach(input => {
            input.setAttribute('readonly', 'true');
            input.style.outlineColor = "transparent";
        })
        // Populate the list with employees
        absences.forEach(absence => {
            const li = document.createElement('li');
            li.innerHTML = `${absence.name}`;
            ul.appendChild(li);
            li.addEventListener('click', () => {
                selectedItem = true;
                errorText.innerHTML = "";
                const previousSelected = ul.querySelector('.selected');
                if (previousSelected) {
                    previousSelected.classList.remove('selected');
                }
                li.classList.add('selected');
                inputs.forEach(input => {
                    input.removeAttribute('readonly');
                    input.style.outlineColor = "rgb(186, 186, 186)";
                    input.addEventListener('input', () => {
                        errorText.innerHTML = "";
                    });
                })
                absName.value = absence.name;
                absValue.value = absence.value;
                absShort.value = absence.short_name;
                selected_id = absence._id;
                return selected_id;
            })
        })
        list.appendChild(ul);
    })
   
    absValue.addEventListener('input', () => {
        absValue.value = absValue.value.replace(/\D/g, '');
        fetch('/api/absence_types')
        .then(response => response.json())
        .then(types => {
            const enteredValue = absValue.value.trim(); // Trim to remove leading/trailing whitespace

            // Check if entered value exists in the list of types
            const typeExists = types.some(type => type.value === parseInt(enteredValue));
            // Check if entered value is equal to the value of the selected type
            const isSelectedType = selected_id && types.some(type => type._id === selected_id && type.value === parseInt(enteredValue));
            
            // Display error message based on the results
            if (typeExists && !isSelectedType) {
                errorText.innerHTML = "<span>* </span>" + vocabulary.exist_value[currentLanguage];
            } else {
                errorText.innerHTML = "";
            }
        })
        .catch(error => {
            console.error('Error fetching absence types:', error);
        });
    });
}

function usersList() {
    form.innerHTML = `
        <form class="edit-form">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name">
            <label for="surname">Surname:</label>
            <input type="text" id="surname" name="surname">
            <label for="department">Department:</label>
            <input type="text" id="department" name="department">
            <label for="role">Role:</label>
            <input type="text" id="role" name="role">
            <div class="def_h_div">
                <label for="def_hours" id="def_h_label">Default hours:</label>
                <p id="info">(not required)</p>
            </div>
            <input type="text" id="def_hours" name="def_hours">
        </form>
        `;
    const inputs = document.querySelectorAll('.edit-form input')
    const name = document.getElementById("name");
    const sn = document.getElementById("surname");
    const dep = document.getElementById("department");
    const role = document.getElementById("role");
    const def_h = document.getElementById("def_hours"); 
    fetch('/api/users')
    .then(response => response.json())
    .then(users => {
        const ul = document.createElement('ul');
        users.sort((a, b) => a.sn.localeCompare(b.sn));
        inputs.forEach(input => {
            input.setAttribute('readonly', 'true');
            input.style.outlineColor = "transparent";
        })
        users.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = `${user.givenName} ${user.sn}`;
            ul.appendChild(li);
            li.addEventListener('click', () => {
                selectedItem = true;
                errorText.innerHTML = "";
                const previousSelected = ul.querySelector('.selected');
                if (previousSelected) {
                    previousSelected.classList.remove('selected');
                }
                li.classList.add('selected');
                inputs.forEach(input => {
                    input.removeAttribute('readonly');
                    input.style.outlineColor = "rgb(186, 186, 186)";
                    input.addEventListener('input', () => {
                        errorText.innerHTML = "";
                    });
                })
                
                name.value = user.givenName;
                sn.value = user.sn;
                dep.value = user.department;
                role.value = user.role;
                if(user.default_hours) {
                    def_h.value = user.default_hours;
                } else {
                    def_h.value = "";
                }
                selected_id = user._id;
                return selected_id;
            })
            
        })
        list.appendChild(ul);
    })
    dep.addEventListener('input', () => {
        dep.value = dep.value.replace(/\D/g, '');
        fetch('/api/departments')
        .then(response => response.json())
        .then(departments => {
            const enteredValue = dep.value.trim(); // Trim to remove leading/trailing whitespace

            // Check if entered value exists in the list of departments
            const departmentExists = departments.some(department => department.value === parseInt(enteredValue));

            // Display error message based on the result
            if (departmentExists || dep.value === "") {
                errorText.innerHTML = "";
            } else {
                errorText.innerHTML = "<span>* </span>" + vocabulary.not_exist_dep[currentLanguage];
            }
        })
        .catch(error => {
            console.error('Error fetching departments:', error);
        });
    });
    role.addEventListener('input', () => {
        role.value = role.value.replace(/\D/g, '');
        if (role.value > 5) {
            errorText.innerHTML = "<span>* </span>" + vocabulary.invalid_role[currentLanguage];
        } else {
            errorText.innerHTML = "";
        }
    });
    def_h.addEventListener('input', () => {
        // Remove non-digit characters and allow one decimal point
        def_h.value = def_h.value.replace(/[^\d.]/g, '');

        // Ensure there's only one decimal point
        const decimalCount = (def_h.value.match(/\./g) || []).length;
        if (decimalCount > 1) {
            def_h.value = def_h.value.slice(0, -1);
        }
        // Allow only one digit after the decimal point
        const decimalIndex = def_h.value.indexOf('.');
        if (decimalIndex !== -1) {
            const integerPart = def_h.value.slice(0, decimalIndex);
            const decimalPart = def_h.value.slice(decimalIndex + 1, decimalIndex + 2);
            def_h.value = `${integerPart}.${decimalPart}`;
        }
    });
    
}

function authList() {
    form.innerHTML = `
        <form class="edit-form">
            <label for="login">Login:</label>
            <input type="text" id="login" name="login">
            <label for="password">Password:</label>
            <input type="text" id="password" name="password">
            <div class="user_id_div">
                <label for="user_id">User Id:</label>
                <input type="text" id="user_id" name="user_id">
            </div> 
        </form>
        `;
    const login = document.getElementById("login");
    const pw = document.getElementById("password");
    const userId = document.getElementById("user_id");
    fetch('/api/loginpass', {
        method: "GET"
    })
    .then(response => response.json())
    .then(auths => {
        const ul = document.createElement('ul');
        login.setAttribute('readonly', 'true');
        pw.setAttribute('readonly', 'true');
        pw.style.outlineColor = "transparent";
        auths.forEach(auth => {
            const li = document.createElement('li');
            li.innerHTML = `${auth.username}`;
            ul.appendChild(li);
            li.addEventListener('click', () => {
                selectedItem = true;
                errorText.innerHTML = "";
                const previousSelected = ul.querySelector('.selected');
                if (previousSelected) {
                    previousSelected.classList.remove('selected');
                }
                li.classList.add('selected');
                pw.removeAttribute('readonly');
                pw.style.outlineColor = "rgb(186, 186, 186)";
                pw.placeholder = vocabulary.new_pw[currentLanguage];
                login.value = auth.username;
                pw.value = "";
                userId.value = auth.user_id;
                selected_id = auth._id;
                return selected_id;
            })
        })
        list.appendChild(ul);
    })
    pw.addEventListener('input', () => {
        errorText.innerText = "";
    });
    
}

function deleteRecord(selected_id, section) {
    let endpoint = '';

    switch (section) {
        case 'users':
            endpoint = `/api/users/${selected_id}`;
            break;
        case 'departments':
            endpoint = `/api/departments/${selected_id}`;
            break;
        case 'absences':
            endpoint = `/api/absence_types/${selected_id}`;
            break;
        case 'authorization':
            endpoint = `/api/loginpass/${selected_id}`;
            break;
        default:
            console.error('Invalid section');
            return;
    }
    fetch(endpoint, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
       location.reload();
    })
    
}

function updateRecord(selected_id, section) {
    let endpoint = '';

    switch (section) {
        case 'users':
            endpoint = `/api/users/${selected_id}`;
            const givenName = document.getElementById('name').value;
            const sn = document.getElementById('surname').value;
            const department = document.getElementById('department').value;
            const role = document.getElementById('role').value;
            var def_hours = document.getElementById('def_hours').value;
            if (def_hours.trim() === "") {
                def_hours = null;
            }
            var updated = {
                givenName: givenName,
                sn: sn,
                department: parseInt(department),
                role: parseInt(role),
                default_hours: parseFloat(def_hours)
            };
            break;
        case 'departments':
            endpoint = `/api/departments/${selected_id}`;
            const depName = document.getElementById('name').value;
            const depValue = document.getElementById('value').value;
            var updated = {
                name: depName,
                value: parseInt(depValue)
            };
            break;
        case 'absences':
            endpoint = `/api/absence_types/${selected_id}`;
            const absName = document.getElementById('name').value;
            const absValue = document.getElementById('value').value;
            const short_name = document.getElementById('short_name').value;
            var updated = {
                name: absName,
                value: parseInt(absValue),
                short_name: short_name
            };
            break;
        case 'authorization':
            endpoint = `/api/loginpass/${selected_id}`;
            const login = document.getElementById("login").value;
            const pw = document.getElementById("password").value;
            const userId = document.getElementById("user_id").value;
            var updated = {
                login: login,
                passw: pw,
                user_id: userId
            };
            break;
        default:
            console.error('Invalid section');
            return;
    }

    fetch(endpoint, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updated)
    })
    .then(response => response.json())
    .then(data => {
        location.reload();
    })
    
}

function addRecord(section) {
    let endpoint = '';

    switch (section) {
        case 'users':
            endpoint = '/api/users';
            const givenName = document.getElementById('name').value;
            const sn = document.getElementById('surname').value;
            const department = document.getElementById('department').value;
            const role = document.getElementById('role').value;
            var def_hours = document.getElementById('def_hours').value;
            if (def_hours.trim() === "") {
                def_hours = null;
            }
            var added = {
                givenName: givenName,
                sn: sn,
                department: parseInt(department),
                role: parseInt(role),
                default_hours: parseFloat(def_hours)
            };
            break;
        case 'departments':
            endpoint = '/api/departments';
            const depName = document.getElementById('name').value;
            const depValue = document.getElementById('value').value;
            var added = {
                name: depName,
                value: parseInt(depValue)
            };
            break;
        case 'absences':
            endpoint = '/api/absence_types';
            const absName = document.getElementById('name').value;
            const absValue = document.getElementById('value').value;
            const short_name = document.getElementById('short_name').value;
            var added = {
                name: absName,
                value: parseInt(absValue),
                short_name: short_name
            };
            break;
        case 'authorization':
            endpoint = '/api/create_user';
            const login = document.getElementById("login").value;
            const pw = document.getElementById("password").value;
            const userId = document.getElementById("user_id").value;
            fetch('/api/users')
            .then(response => response.json())
            .then(users => {
                const matchedUser = users.find(user => user._id === parseInt(userId));
                if (matchedUser) {
                    fetch('/api/loginpass')
                    .then(response => response.json())
                    .then(data => {
                        const existingAuth = data.some(auth => parseInt(userId) === auth.user_id);
                        if (existingAuth) {
                            errorText.innerHTML = "<span>* </span>" + vocabulary.exist_auth[currentLanguage];
                        }  else {
                            var added = {
                                login: login,
                                passw: pw,
                                user_id: userId
                            };

                            postAuth(endpoint, added);
                        }
                    })  
                    
                } else {
                    errorText.innerHTML = "<span>* </span>" + vocabulary.not_exist_user[currentLanguage];
                }
            })
            break;
        default:
            console.error('Invalid section');
            return;
    }
    if(added){
        postAuth(endpoint,added);
    }
}

function postAuth(endpoint, added) {
    fetch(endpoint, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(added)
        })
        .then(response => response.json())
        .then(data => {  
           location.reload();
        })
}

// Function to check for user activity
function checkUserActivity() {
  var lastActivityTime = localStorage.getItem('lastActivityTime');

  if (!lastActivityTime) {
    localStorage.setItem('lastActivityTime', localStorage.getItem('loginTime'));
    lastActivityTime = localStorage.getItem('loginTime');
  }

  var currentTime = new Date().getTime();

  // Calculate the time difference in milliseconds
  var timeDifference = currentTime - lastActivityTime;

  // If more than 11 minutes pass without activity, clear localStorage and redirect
  if (timeDifference > 11 * 60 * 1000) {
    localStorage.clear();
    window.location.href = "/";
    localStorage.setItem('expired', true);
  }
}

// Set up a timer to check for user activity every second
setInterval(function () {
  checkUserActivity();
}, 1000);

document.addEventListener('click', function () {
  localStorage.setItem('lastActivityTime', new Date().getTime());
});