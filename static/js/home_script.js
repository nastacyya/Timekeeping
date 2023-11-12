// window.addEventListener('pageshow', function(event) {
//     if(!localStorage.getItem('token')) {
//         window.location.href = '/';
//     }
// });
let currentLang = 'ru'; // Установите текущий язык ('ru' или 'en')

const daysTag = document.querySelector(".days");
currentDate = document.querySelector(".current-month");
prevNextIcon = document.querySelectorAll(".icons span");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const dateForm = document.querySelector('.date-form');
const absenceForm = document.querySelector('.absence_data');
const addBtn = document.getElementById('add-btn');
const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');
const deleteAbsenceBtn = document.getElementById('delete-absence-btn');
const updateBtn = document.getElementById("update-btn");
const saveBtn = document.getElementById('save-btn');
const treeView = document.querySelector('.tree-view');
const myCalendar = document.getElementById('myCalendar'); 
const infoText = document.querySelector('.info-text p');
const selectedOption = document.querySelector('.selected-option');
const options = document.querySelector('.options');
const editText = document.getElementById("show-data-text");
const enterValue = document.querySelector('.enter-value');
const value = document.getElementById('value');
const error = document.querySelector(".error p");
const errortxt = document.querySelector(".errortxt p");
const errorDiv = document.querySelector(".error");
const errortxtDiv = document.querySelector(".errortxt");
const noteInput = document.getElementById('add-note');
const startInput = document.getElementById("absence_start");
const endInput = document.getElementById("absence_end");
const overtimeValue = document.getElementById("absence_value");
const valueDiv = document.querySelector(".value-div");
const notesTextarea = document.getElementById("notes");
const notesDiv = document.querySelector(".notes-div");
const absenceTypeInput = document.querySelector(".absence_type");
const absencesList = document.querySelector('.absences_list');
const infoDiv = document.querySelector('.info-text');
const formContainer = document.querySelector('.form-container');
const buttonsDiv = document.querySelector('.buttons-div');

const token = localStorage.getItem('token');
const styleSheet = document.styleSheets[0];

let cachedAbsenceTypes = null;
let cachedUserAbsences = null;
let cachedData = {};
let absenceId; //id for deleting
let selectedStartDate = null;
let selectedEndDate = null;
let selectedUserId = null;  // a global variable to store the selected user ID
let isAddingMode = false;
let isDeleteMode = false; 
let isEditMode = false;
let absence_id; //id for editing
let vocabulary; // A variable to store translations

function toggleSideNav() {
    const menu = document.querySelector('.menu-box');
    var sideNav = document.querySelector('.side-nav');
    sideNav.classList.toggle('active');
    menu.classList.toggle('active');
    if (sideNav.style.display === 'none' || sideNav.style.display === '') {
        sideNav.style.display = 'block';
    } else {
        sideNav.style.display = 'none';
    }
}

document.querySelector('.menu-box').addEventListener('click', toggleSideNav);

// Vocabulary
function applyTranslation() {
  absenceTypeInput.innerHTML = "<span id='invisible'>*</span>";
  document.getElementById('main').textContent = vocabulary.main_page[currentLang];
  document.getElementById('exit').textContent = vocabulary.exit[currentLang];
  document.getElementById('my-calendar').textContent = vocabulary.my_calendar[currentLang];
  document.getElementById('mon').textContent = vocabulary.mon[currentLang];
  document.getElementById('tue').textContent = vocabulary.tue[currentLang];
  document.getElementById('wed').textContent = vocabulary.wed[currentLang];
  document.getElementById('thu').textContent = vocabulary.thu[currentLang];
  document.getElementById('fri').textContent = vocabulary.fri[currentLang];
  document.getElementById('sat').textContent = vocabulary.sat[currentLang];
  document.getElementById('sun').textContent = vocabulary.sun[currentLang];
  editText.textContent = vocabulary.show_txt[currentLang];
  addBtn.textContent = vocabulary.add[currentLang];
  editBtn.textContent = vocabulary.edit[currentLang];
  deleteBtn.textContent = vocabulary.delete[currentLang];
  deleteAbsenceBtn.textContent = vocabulary.delete_btn[currentLang];
  saveBtn.textContent = vocabulary.save_btn[currentLang];
  updateBtn.textContent = vocabulary.update_btn[currentLang];
  startDateInput.placeholder = vocabulary.dates_placeholder[currentLang];
  endDateInput.placeholder = vocabulary.dates_placeholder[currentLang];
  document.getElementById('add_type').innerHTML = '<span>*</span>' + vocabulary.add_type[currentLang];
  document.getElementById('add_start').innerHTML = '<span>*</span>' + vocabulary.add_start[currentLang];
  document.getElementById('add_end').innerHTML = '<span>*</span>' + vocabulary.add_end[currentLang];
  document.getElementById('add_overtime').innerHTML = '<span>*</span>' + vocabulary.add_overtime[currentLang];
  document.getElementById('add_note').textContent = vocabulary.add_note[currentLang];
  document.getElementById('start').textContent = vocabulary.start[currentLang];
  document.getElementById('end').textContent = vocabulary.end[currentLang];
  document.getElementById('reason').textContent = vocabulary.reason[currentLang];
  document.getElementById('overtime').textContent = vocabulary.overtime[currentLang];
  document.getElementById('notes_label').textContent = vocabulary.notes[currentLang];
  infoText.textContent = vocabulary.show_info[currentLang];
  const userDataDiv = document.getElementById('welcome');
    getUserData().then(data => {
        if (data) {
            userDataDiv.innerHTML = vocabulary.welcome[currentLang] + `<br> ${data.givenName} ${data.sn}!`;
        } else {
            userDataDiv.innerHTML = '';
        }
    });
}
// getting new date, current year and month
let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();
// storing full name of all months in array
const translations = {
  months: {
    "ru": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль",
      "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    "en": ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"]
  }
};
const renderCalendar = () => {

    const isCurrentMonth = currMonth === date.getMonth() && currYear === date.getFullYear();

    // Hide nextIcon if current month is displayed
    if (isCurrentMonth) {
        prevNextIcon[1].style.visibility = "hidden";
    } else {
        prevNextIcon[1].style.visibility = "visible";
    }

    let firstDayofMonth = new Date(currYear, currMonth, 0).getDay(), // getting first day of month
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
   
    let liTag = "";
    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }
    for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
        // adding active class to li if the current day, month, and year matched
        let isToday = i === date.getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear() ? "active" : "";
        liTag += `<li class="${isToday}">${i}</li>`;
    }
    for (let i = lastDayofMonth; i <= 6; i++) { // creating li of next month first days
        if (lastDayofMonth === 0) {
           break;
        } else {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
     }
    }
    currentDate.innerText = `${translations.months[currentLang][currMonth]} ${currYear}`; // passing current mon and yr as currentDate text
    daysTag.innerHTML = liTag;
}

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
            currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if(currMonth < 0 || currMonth > 11) { 
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        } 
        
        renderCalendar();
       // Check if a user is selected, then mark their absences
       if (selectedUserId) {
        markUserAbsencesOnCalendar(selectedUserId);
        }
    });
});

function colorLegend() {
    fetch('/mock/absences.json')
    .then(response => response.json())
    .then(data => {
        const colorDiv = document.querySelector(".color-legend");
        const absencesList = colorDiv.querySelector(".colors-ul")
        data.forEach(absenceType => {
            const absenceValue = absenceType.value;
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span class="color-${absenceValue}"></span><p>- ${absenceType.short_name}</p>`;
            
            absencesList.appendChild(listItem);
          });
    })

    for (let i = 1; i <= 13; i++) {
        const style = `
          .color-${i} {
            background: var(--absence-${i});
            height: 20px;
            width: 20px;
            border-radius: 50%;
            display: block;
          }
        `;
        styleSheet.insertRule(style, styleSheet.cssRules.length);
      }
}

//Choose dates and write them to the form
function handleDateSelection(event) { 
    if (event.target.tagName !== 'LI') return; //to prevent clicking out of date

    const clickedDate = event.target;
    const isCurrentMonth = currMonth === date.getMonth() && currYear === date.getFullYear();
  
    if (!clickedDate.classList.contains("inactive") && isCurrentMonth) {
        const clickedDateValue = clickedDate.textContent;
        const clickedDateElement = new Date(currYear, currMonth, clickedDateValue);
        const formattedStartMonth = (currMonth + 1).toString().padStart(2, '0');
        const formattedStartDay = clickedDateValue.toString().padStart(2, '0');
        const absenceType = document.querySelector('.selected-option').value;
 
        if (!selectedStartDate) {
            selectedStartDate = clickedDateElement;
            startDateInput.value = `${currYear}-${formattedStartMonth}-${formattedStartDay}`;
            clickedDate.classList.add("selected-start");

            infoText.textContent = vocabulary.choose_end[currentLang];;

            const absenceValueMatch = clickedDate.className.match(/(end|absence)-(\d+)/);
            var startAbsenceValue = absenceValueMatch ? parseInt(absenceValueMatch[2]) : null;
            const matchStart = clickedDate.className.match(/start-(\d+)/);
            const matchValue = matchStart ? parseInt(matchStart[1]) : null;
    
            if (absenceValueMatch) {
                const selectedStart = `
                .selected-start {
                    background-image: linear-gradient(to right, var(--absence-${startAbsenceValue}-${startAbsenceValue}) 50%, var(--bg-violet) 50%,  transparent) !important; 
                } `;
                styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);
            } else if (matchStart) {
                const selectedStart = `
                .selected-start {
                    background-image: linear-gradient(to right, white 50%, var(--bg-violet) 50%,  var(--absence-${matchValue}-${matchValue}) ) !important; 
                } `;
                styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);
            } else {
                const selectedStart = `
                .selected-start {
                    background-image: linear-gradient(to right, white 50%, var(--bg-violet) 50%, transparent ) !important;
                } `;
                styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);
            }
            
        } else if (!selectedEndDate && clickedDateElement >= selectedStartDate) {

            selectedEndDate = clickedDateElement;
            endDateInput.value = `${currYear}-${formattedStartMonth}-${formattedStartDay}`;
  
            const days = daysTag.querySelectorAll('li');
            days.forEach(day => {
                const dayValue = parseInt(day.textContent);
                if (dayValue > selectedStartDate.getDate() && dayValue < selectedEndDate.getDate() && !day.classList.contains('inactive')) {
                    day.classList.add("selected-range");
                }
            });

            clickedDate.classList.add("selected-end");

            if (endDateInput.value === startDateInput.value) {
                clickedDate.classList.remove("selected-end", "selected-start");
                clickedDate.classList.add("matching-dates");
            } 
            
            if (absenceType === null) {
                infoText.textContent = vocabulary.choose_type[currentLang];
            } else if (absenceType === 13 && value.value === "") {
                infoText.textContent = vocabulary.choose_overtime[currentLang];
            } else {
                infoText.textContent = vocabulary.click_save[currentLang];
            }
   
            const absenceValueMatch = clickedDate.className.match(/(absence|start)-(\d+)/);
            const absenceValue = absenceValueMatch ? parseInt(absenceValueMatch[2]) : null;
            const matchEnd = clickedDate.className.match(/end-(\d+)/);

            // If already selected start contains class end-{i}, i value will be read
            const selectedStart = document.querySelector(".selected-start");
            const startIsEnd  = selectedStart.className.match(/end-(\d+)/);
            const matching = startIsEnd ? parseInt(startIsEnd[1]) : null;
                   

            if (absenceValueMatch) {
                if (startIsEnd) {
                    const selectedStart = `
                    .selected-start {
                        background-image: linear-gradient(to right, var(--absence-${matching}-${matching}) 50%, var(--bg-violet) 50%) !important; 
                    } `;
                    styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);
                } else {
                    const selectedStart = `
                    .selected-start {
                        background-image: linear-gradient(to right, transparent 50%, var(--bg-violet) 50%) !important; 
                    } `;
                    styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);
                }
                    const selectedEnd = `
                    .selected-end {
                        background-image: linear-gradient(to left, var(--absence-${absenceValue}-${absenceValue}) 50%, var(--bg-violet) 50%) !important; 
                    } `;
                    styleSheet.insertRule(selectedEnd, styleSheet.cssRules.length);
                
            } else if (matchEnd) {
                if (startIsEnd) {
                    const selectedStart = `
                    .selected-start {
                        background-image: linear-gradient(to right, var(--absence-${matching}-${matching}) 50%, var(--bg-violet) 50%) !important; 
                    } `;
                    styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);
                } else {
                    const selectedStart = `
                    .selected-start {
                        background-image: linear-gradient(to right, transparent 50%, var(--bg-violet) 50%) !important; 
                    } `;
                    styleSheet.insertRule(selectedStart, styleSheet.cssRules.length); 
                }
                    const selectedEnd = `
                    .selected-end {
                        background-image: linear-gradient(to right, var(--bg-violet) 50%, transparent 50%) !important; 
                    } `;
                    styleSheet.insertRule(selectedEnd, styleSheet.cssRules.length);
                
            } else {
                if (startIsEnd) {
                    const selectedStart = `
                    .selected-start {
                        background-image: linear-gradient(to right, var(--absence-${matching}-${matching}) 50%, var(--bg-violet) 50%) !important; 
                    } `;
                    styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);

                } else {
                    const selectedStart = `
                    .selected-start {
                        background-image: linear-gradient(to right, transparent 50%, var(--bg-violet) 50%) !important; 
                    } `;
                    styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);

                }
                const selectedEnd = `
                    .selected-end {
                        background-image: linear-gradient(to left, transparent 50%, var(--bg-violet) 50%) !important; 
                    } `;
                    styleSheet.insertRule(selectedEnd, styleSheet.cssRules.length);
            }
        
        } else {
            const selectedDates = daysTag.querySelectorAll('.selected-start, .selected-end, .selected-range, .matching-dates');
            selectedDates.forEach(dateElement => dateElement.classList.remove("selected-start", "selected-end", "selected-range", "matching-dates"));
    
            selectedStartDate = clickedDateElement;
            selectedEndDate = null;
            startDateInput.value = `${currYear}-${formattedStartMonth}-${formattedStartDay}`;
            endDateInput.value = "";
            clickedDate.classList.add("selected-start");
            infoText.textContent = vocabulary.choose_end[currentLang];

            const absenceValueMatch = clickedDate.className.match(/(end|absence)-(\d+)/);
            const absenceValue = absenceValueMatch ? parseInt(absenceValueMatch[2]) : null;
            const matchStart = clickedDate.className.match(/start-(\d+)/);
            const matchValue = matchStart ? parseInt(matchStart[1]) : null;

            if (absenceValueMatch) {
                const selectedStart = `
                .selected-start {
                    background-image: linear-gradient(to right, var(--absence-${absenceValue}-${absenceValue}) 50%, var(--bg-violet) 50%,  transparent) !important; 
                } `;
                styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);
            } else if (matchStart) {
                const selectedStart = `
                .selected-start {
                    background-image: linear-gradient(to right, white 50%, var(--bg-violet) 50%,  var(--absence-${matchValue}-${matchValue})) !important; 
                } `;
                styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);
             }else {
                const selectedStart = `
                .selected-start {
                    background-image: linear-gradient(to right, white 50%, var(--bg-violet) 50%, transparent ) !important; 
                } `;
                styleSheet.insertRule(selectedStart, styleSheet.cssRules.length);
            }
        }
    
    }  
}

//Choose an absence type
function absenceTypeSelect() {
    fetch('/mock/absences.json')
    .then(response => response.json())
    .then(data => {
      const customSelect = document.querySelector('.custom-select');
      const selectedOption = customSelect.querySelector('.selected-option');
      const optionsList = customSelect.querySelector('.options');

      optionsList.innerHTML = '';
      selectedOption.innerHTML = "<i class='bx bxs-chevron-down' id='arrow-icon'></i>"; 
      selectedOption.value = null;
      // Loop through the absence types and create an option element for each
      data.forEach(absenceType => {
        const absenceValue = absenceType.value;
        const listItem = document.createElement('li');
       
        listItem.innerHTML = `<span class="color-circle-${absenceValue}"></span><p>${absenceType.name}</p>`; 
        listItem.value = absenceValue;
         
        listItem.addEventListener('click', () => {
          selectedOption.innerHTML = listItem.innerHTML + "<i class='bx bxs-chevron-down' id='selected-arrow'></i>";
          selectedOption.value = absenceValue;
          
          
          if (selectedOption.value === 13) {
            enterValue.style.display = "flex";
            if (!selectedStartDate) {
                infoText.textContent = vocabulary.choose_start[currentLang];
            } else if (!selectedEndDate) {
                infoText.textContent = vocabulary.choose_end[currentLang];
            } else if (value.value === "") {
                infoText.textContent = vocabulary.choose_overtime[currentLang];
            } else {
                infoText.textContent = vocabulary.click_save[currentLang];
            }
           
          } else {
            enterValue.style.display = "none";
            value.value = "";
            errorDiv.style.display = "none";
            error.innerText = "";
            if (!selectedStartDate) {
                infoText.textContent = vocabulary.choose_start[currentLang];
            } else if (!selectedEndDate) {
                infoText.textContent = vocabulary.choose_end[currentLang];
            } else {
                infoText.textContent = vocabulary.click_save[currentLang];
            }
        }
          optionsList.style.display = 'none';
          
        });
        
        optionsList.appendChild(listItem);
      });

      selectedOption.addEventListener('click', () => {
        optionsList.style.display = optionsList.style.display === 'none' ? 'block' : 'none';
      });

      // Add an event listener to the document to hide the options list when clicking outside of it
      document.addEventListener('click', (event) => {
        if (!customSelect.contains(event.target)) {
          optionsList.style.display = 'none';
        }
      });

      for (let i = 1; i <= 13; i++) {
        const style = `
          .color-circle-${i} {
            background: var(--absence-${i});
          }
        `;
        styleSheet.insertRule(style, styleSheet.cssRules.length);
      }
    })
    .catch(error => console.error('Error fetching absence types:', error));
}

//Get from database data about user and role
async function getUserData() {
    const user_id = parseInt(localStorage.getItem('user_id'));

    if (!user_id) {
        console.error('User ID not available in localStorage.');
        return null;
    }

    try {
        const response = await fetch('/mock/users.json');
        const users = await response.json();
        const currentUser = users.find(user => user._id === user_id);

        if (currentUser) {
            const userRole = currentUser.role;

            if (userRole === 1 || userRole === 2) {
                workerRolePermissions(userRole);
            }

            if (userRole === 3 || userRole === 4) {
                supervisorRolePermissions(userRole);
            }

            if (currentUser.givenName && currentUser.sn) {
                return {
                    givenName: currentUser.givenName,
                    sn: currentUser.sn,
                    department: currentUser.department
                };
            } else {
                console.error('User data incomplete or invalid:', currentUser);
                return null;
            }
        } else {
            console.error('User not found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        return null;
    }
}

//Display user name and surname on the screen
// function showUserData() {
//     const userDataDiv = document.getElementById('welcome');
//     getUserData().then(data => {
//         if (data) {
//             userDataDiv.innerHTML = vocabulary.welcome[currentLang] + `<br> ${data.givenName} ${data.sn}!`;
//         } else {
//             userDataDiv.innerHTML = '';
//         }
//     });
// }

//Permissions for role 1 and 2
function workerRolePermissions(userRole) {
    const user_id = parseInt(localStorage.getItem('user_id'));
    const savedSelectedUserId = localStorage.getItem('selectedUserId');

        fetch('/mock/users.json')
        .then(response => response.json())
        .then(users => {
            const currentUser = users.find(user => user._id === user_id);
            const department_number = currentUser.department;
        
            // Make a GET request to retrieve departments
            fetch('/mock/departments.json')
            .then(response => response.json())
            .then(departments => {
                // Find the department with the matching number
                const department = departments.find(dep => dep.value === department_number);
    
                if (department) {
                const department_id = department._id;
                console.log(`${department._id}`)
                const department_name = department.name;
                console.log(`${department.name}`)
                // Update the DOM with the department name
                const h3 = document.createElement('h3');
                h3.textContent = department_name;
                const treeView = document.querySelector('.tree-view');
                treeView.appendChild(h3);
                
                // Make a GET request to retrieve employees of the department
                fetch('/mock/users.json')
                .then(response => response.json())
                .then(employees => {
                const ul = document.createElement('ul');
                employees.sort((a, b) => a.sn.localeCompare(b.sn));
                // Populate the list with employees
                employees.forEach(employee => {
                    const li = document.createElement('li');

                    if(userRole === 1) {                    //If userRole is 1, user can only see and edit his calendar
                        if (employee._id === user_id) {
                            selectedUserId = user_id;
                            li.innerHTML = `<strong>${employee.givenName} ${employee.sn}</strong>`;
                            
                            markUserAbsencesOnCalendar(selectedUserId);
                            daysTag.addEventListener('click', showAbsenceData);
                            sendUserAbsences();
                        } else {
                            li.innerHTML = `${employee.givenName} ${employee.sn}`;
                        }
                        
                    } else {
                        if(!savedSelectedUserId) {
                            selectedUserId = user_id;
                        } else {
                            selectedUserId = savedSelectedUserId;
                            fetch('/mock/users.json')
                            .then(response => response.json())
                            .then(users => {
                                const userFromDB = users.find(user => user._id === user_id);
                                const user_role = userFromDB.role; 
                                // Check user role here and adjust button visibility
                                if (user_role === 1 || selectedUserId === user_id) {
                                addBtn.style.display = 'block';
                                deleteBtn.style.display = 'block';
                                editBtn.style.display = 'block';
                            } else {
                                addBtn.style.display = 'none';
                                deleteBtn.style.display = 'none';
                                editBtn.style.display = 'none';
                            }
                        });
                        }
                    
                        li.innerHTML = `${employee.givenName} ${employee.sn}`;
                        li.classList.add('hover-design');
                        myCalendar.style.display = "flex";
                        if (employee._id === user_id ) {
                            li.classList.add('authorized');
                        }
                        if (employee._id === selectedUserId ) {
                            //selectedUserId = user_id;
                            markUserAbsencesOnCalendar(selectedUserId);
                            daysTag.addEventListener('click', showAbsenceData);
                            sendUserAbsences();

                            li.classList.add('employee');
                        } 

                        li.addEventListener('click', () => {
                            if (isDeleteMode === true || isEditMode === true || isAddingMode === true) {

                                    isDeleteMode = false;
                                    isEditMode = false;
                                    isAddingMode = false;

                                    returnToDefaultView();
                            } 

                            const newSelectedUserId = employee._id;
                            // Check if the selected user has changed
                            if (newSelectedUserId !== selectedUserId) {
                                const selectedElement = treeView.querySelector('.employee');
                                if (selectedElement) {
                                    selectedElement.classList.remove('employee');
                                }

                                li.classList.add('employee');

                                clearAbsenceDataForm();
                                // Set the selected user ID
                                selectedUserId = newSelectedUserId;
                                // Save selectedUserId to localStorage
                                localStorage.setItem('selectedUserId', selectedUserId);
                                
                                markUserAbsencesOnCalendar(selectedUserId);
                                sendUserAbsences();
                                daysTag.addEventListener('click', showAbsenceData);

                                fetch('/mock/users.json')
                                .then(response => response.json())
                                .then(data => {

                                    const user_role = data.role; 
                                    // Check user role here and adjust button visibility
                                    if (user_role === 1 || selectedUserId === user_id) {
                                    addBtn.style.display = 'block';
                                    deleteBtn.style.display = 'block';
                                    editBtn.style.display = 'block';
                                } else {
                                    addBtn.style.display = 'none';
                                    deleteBtn.style.display = 'none';
                                    editBtn.style.display = 'none';
                                }
                            });
                            }
                            
                        });

                    }

                    ul.appendChild(li);
                });

                    treeView.appendChild(ul);
                    });
                }
                
        });
    });
}

//Permissions for role 3, 4
function supervisorRolePermissions(userRole) {
    const user_id = localStorage.getItem("user_id");
    const treeView = document.querySelector('.tree-view');
    myCalendar.style.display = "flex";
    const savedSelectedUserId = localStorage.getItem('selectedUserId');

    if(!savedSelectedUserId) {
        selectedUserId = user_id;
    } else {
        selectedUserId = savedSelectedUserId;
        if ( (userRole === 3 && selectedUserId === user_id) || userRole === 4 || selectedUserId === user_id) {
            addBtn.style.display = 'block';
            deleteBtn.style.display = 'block';
            editBtn.style.display = 'block';
        } else {
            addBtn.style.display = 'none';
            deleteBtn.style.display = 'none';
            editBtn.style.display = 'none';
        }
    }
    markUserAbsencesOnCalendar(selectedUserId);
    sendUserAbsences();
    daysTag.addEventListener('click', showAbsenceData);

    async function fetchDepartmentsAndPopulateTreeView() {
        try {
            const response = await fetch('/api/departments', {
                headers: {
                    'Authorization': "Bearer " + token
                }
            })
            const data = await response.json();

            for (const department of data) {
                const dropdown = document.createElement('div');
                dropdown.classList.add('dropdown');
                dropdown.innerHTML = `
                    <a class="sub-btn" data-department-id="${department._id}">${department.name}<i class='bx bxs-chevron-right'></i></a>
                    <div class="sub-menu"></div>
                `;
                const subMenu = dropdown.querySelector('.sub-menu');
                fetchEmployeesByDepartment(department._id, subMenu); //so the authorized user had class "authorized" straightaway

                dropdown.addEventListener('click', function() {
                    const departmentId = dropdown.querySelector('.sub-btn').dataset.departmentId;
                    const iconElement = dropdown.querySelector('.sub-btn i');
                    toggleSubMenu(subMenu, departmentId, iconElement);
                });

                treeView.appendChild(dropdown);

            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }

  
    async function fetchEmployeesByDepartment(departmentId, subMenu) {

        return fetch(`/api/departments/${departmentId}/users`, {
            headers: {
                'Authorization': "Bearer " + token
            }
        })
        .then(response => response.json())
        .then(data => {
                            
            subMenu.innerHTML = '';
            // Sort employees by surname
            data.sort((a, b) => a.sn.localeCompare(b.sn));

            data.forEach(employee => {
                const employeeItem = document.createElement('a');
                employeeItem.href = '#';
                employeeItem.innerText = `${employee.givenName} ${employee.sn}`;

                if (employee._id.$oid === user_id) {
                    employeeItem.classList.add("authorized");
                }

                employeeItem.addEventListener('click', function(event) {
                    event.stopPropagation(); // Prevent event from propagating to parent dropdown
                    if (isDeleteMode === true || isEditMode === true || isAddingMode === true) {

                        isDeleteMode = false;
                        isEditMode = false;
                        isAddingMode = false;

                        returnToDefaultView();
                    }
                    
                    const newSelectedUserId = employee._id.$oid;

                    // Check if the selected user has changed
                    if (newSelectedUserId !== selectedUserId) {
                        const selectedElement = treeView.querySelector('.employee');
                        if (selectedElement) {
                            selectedElement.classList.remove('employee');
                        }
                        
                        employeeItem.classList.add('employee');

                        clearAbsenceDataForm();
                        selectedUserId = newSelectedUserId;
                        // Save selectedUserId to localStorage
                        localStorage.setItem('selectedUserId', selectedUserId);

                        markUserAbsencesOnCalendar(selectedUserId);
                        
                        if (userRole === 4 || selectedUserId === user_id) {
                            addBtn.style.display = 'block';
                            deleteBtn.style.display = 'block';
                            editBtn.style.display = 'block';
                            sendUserAbsences();
                        } else {
                            addBtn.style.display = 'none';
                            deleteBtn.style.display = 'none';
                            editBtn.style.display = 'none';
                        }
                    
                    }
                    
                });
            
                if (employee._id.$oid === selectedUserId) {
                    employeeItem.classList.add('employee');
                }
        
                subMenu.appendChild(employeeItem);

            });

            return data.length; // Return the number of employees
        });
        }

    function toggleSubMenu(subMenu, departmentId, iconElement) {

        const subMenuHeight = subMenu.offsetHeight;

        fetchEmployeesByDepartment(departmentId, subMenu)
            .then(employeeCount => {
                if (subMenu.style.display === 'none' || subMenu.style.display === '') {
                    subMenu.style.display = 'block';
                    subMenu.style.position = 'absolute'; 
                    iconElement.classList.add('rotate');
                    
                    const dropdown = subMenu.parentElement;
                    dropdown.classList.add('disable-hover-effects');
                    const departmentName = dropdown.querySelector('.sub-btn');
                    departmentName.style.fontWeight = '600';
                    if (dropdown) {
                        dropdown.style.marginBottom = (subMenuHeight + (employeeCount * 50)) + 'px';
                    }
                } else {
                    subMenu.style.display = 'none';
                    iconElement.classList.remove('rotate');
                    const dropdown = subMenu.parentElement;
                    dropdown.classList.remove('disable-hover-effects');
                    const departmentName = dropdown.querySelector('.sub-btn');
                    departmentName.style.fontWeight = '';
                    if (dropdown) {
                        dropdown.style.marginBottom = '0';
                    }
                }
            });
        }
        //Calling the function
        fetchDepartmentsAndPopulateTreeView();
}

//Logout function
function logout() {
    // Clear token from localStorage
    localStorage.clear();
    
    window.location.href = '/templates/login.html';
}

//Color change of the logout button when hovering
function changeColor(shouldChange) {
    const icons = document.querySelectorAll('.sub-logout i');
    const paragraphs = document.querySelectorAll('.sub-logout p');

    if (shouldChange) {
        icons.forEach(icon => icon.style.color = 'var(--bg-violet)');
        paragraphs.forEach(paragraph => paragraph.style.color = 'var(--bg-violet)');
    } else {
        icons.forEach(icon => icon.style.color = '');
        paragraphs.forEach(paragraph => paragraph.style.color = '');
    }
}

//Color change of myCalendar button when hovering
function changeColorOfCalendar(willChange) {
    const icons = document.querySelectorAll('.myCalendar i');
    const paragraphs = document.querySelectorAll('.myCalendar p');

    if (willChange) {
        icons.forEach(icon => icon.style.color = 'var(--bg-violet)');
        paragraphs.forEach(paragraph => paragraph.style.color = 'var(--bg-violet)');
    } else {
        icons.forEach(icon => icon.style.color = '');
        paragraphs.forEach(paragraph => paragraph.style.color = '');
    }
}

//Function to send post request and save absence
async function sendUserAbsences() {

    const handleSaveButtonClick = function() {
        const absenceType = document.querySelector('.selected-option').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        var note = document.getElementById('add-note').value;
        const value = document.getElementById('value').value;

        // Check if all fields are filled
        if (absenceType === null || startDate === "" || endDate === "") {
            errorDiv.style.display = "flex"; 
            error.innerText = vocabulary.fill_required[currentLang];
            return;  
        } else if (absenceType === 13 && value === "") {
            errorDiv.style.display = "flex"; 
            error.innerText = vocabulary.fill_overtime[currentLang];
            return;
        } else {
            errorDiv.style.display = "none"; 
            error.innerText = "";

            if (note.trim() === "") {
                note = null;
            }

            const data = {
                absenceType: parseInt(absenceType),
                start_date: startDate,
                end_date: endDate,
                person_id: selectedUserId,
                value: parseInt(value),
                note: note
            };

            fetch('/api/user_absences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                location.reload();
            })
            .catch(error => console.error('Error saving user absence:', error));
        }
    };

    // Check if the event listener is already added
    if (!saveBtn.hasEventListener) {
        saveBtn.addEventListener('click', handleSaveButtonClick);
        saveBtn.hasEventListener = true; // Add a flag to indicate that the event listener has been added
    }
}

// Function to mark absence dates on the calendar
async function markUserAbsencesOnCalendar(userId) {
    const days = daysTag.querySelectorAll('li');
    
    // Clear existing markings on the calendar
    days.forEach(day => {
        for (let i = 1; i <= 13; i++) {
            day.classList.remove(`start-${i}`,`end-${i}`,`absence-${i}`, `startenddate-${i}`);
        }
    });
    fetch('/mock/user_absences.json')
    .then(response => response.json())
    .then(absences => {
  
        absences.forEach(absence => {
            const startDate = new Date(absence.start_date);
            startDate.setHours(0, 0, 0, 0); // Set hours, minutes, seconds to zero
            const endDate = new Date(absence.end_date);
            endDate.setHours(0, 0, 0, 0); 
            const absenceValue = absence.absenceType;
           
            days.forEach(day => {
                const dayDate = new Date(currYear, currMonth, parseInt(day.innerText));
                
                if (dayDate >= startDate && dayDate <= endDate && !day.classList.contains('inactive')) {
                    
                    if (dayDate.getTime() === startDate.getTime()) {
                        day.classList.add(`start-${absenceValue}`);
                    } else if (dayDate.getTime() === endDate.getTime()) {
                        day.classList.add(`end-${absenceValue}`);
                    } else {
                        day.classList.add(`absence-${absenceValue}`);
                    }
                    if (startDate.getTime() === endDate.getTime()) {
                        day.classList.remove(`start-${absenceValue}`);
                        day.classList.remove(`end-${absenceValue}`);
                        day.classList.add(`startenddate-${absenceValue}`);
                    }
                }
            });
        });
    });


    for (let i = 1; i <= 13; i++) {
    const startEndStyle = `
        .start-${i}::before, .end-${i}::before, .startenddate-${i}::before {
            background: var(--absence-${i});
        }
    `;
    const startStyle = `
        .start-${i} {
            background-image: linear-gradient(to right, transparent 50%, var(--absence-${i}-${i}) 50%);
        }
    `;
    const endStyle = `
        .end-${i} {
            background-image: linear-gradient(to left, transparent 50%, var(--absence-${i}-${i}) 50%);
        }
    `;
    const absenceStyle = `
        .absence-${i} {
            background: var(--absence-${i}-${i});
        }
    `;

    styleSheet.insertRule(startEndStyle, styleSheet.cssRules.length);
    styleSheet.insertRule(absenceStyle, styleSheet.cssRules.length);
    styleSheet.insertRule(startStyle, styleSheet.cssRules.length);
    styleSheet.insertRule(endStyle, styleSheet.cssRules.length);
    }
    
}


//Button listeners
document.addEventListener ('DOMContentLoaded', function() { 
    fetch('/static/translate/translations.json')  
      .then(response => response.json())
      .then(data => {
        vocabulary = data; // Store translations in the variable
        applyTranslation(); 
      })
      .catch(error => console.error('Error:', error));

    //showUserData();
    absenceTypeSelect();
    colorLegend();
    renderCalendar();
    editAbsenceType();
    versionControl();
    startInput.setAttribute('readonly', 'true');
    endInput.setAttribute('readonly', 'true');
    overtimeValue.setAttribute('readonly', 'true');
    notesTextarea.setAttribute('readonly', 'true');

    startInput.addEventListener('input', function() {
        // Remove non-numeric characters from the input value
        startInput.value = startInput.value.replace(/\D/g, '');
    
        if (startInput.value.length > 4) {
        let enteredYear = parseInt(startInput.value.slice(0, 4));
        let enteredMonth = parseInt(startInput.value.slice(4, 6));
        let enteredDay = parseInt(startInput.value.slice(6, 8));

        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based month

        if (enteredYear != currentYear || (enteredYear === currentYear && enteredMonth !== currentMonth)) {
            errortxtDiv.style.display = "flex";
            errortxt.innerText = vocabulary.wrong_date[currentLang];
        } else {
            let lastDayOfMonth = new Date(enteredYear, enteredMonth, 0).getDate();
            if (enteredDay > lastDayOfMonth) {
                errortxtDiv.style.display = "flex";
                errortxt.innerText = vocabulary.invalid_date[currentLang];
            } else {
                // Check if start date day is greater than end date day
                let endInputDate = new Date(endInput.value);
                let endDay = endInputDate.getDate();

                if (enteredDay > endDay) {
                    errortxtDiv.style.display = "flex";
                    errortxt.innerText = vocabulary.wrong_start[currentLang];
                } else {
                    errortxtDiv.style.display = "none";
                    errortxt.innerText = "";
                }
            }
        }
            startInput.value = startInput.value.slice(0, 4) + '-' + startInput.value.slice(4, 6) + '-' + startInput.value.slice(6, 8);
        }
    });

    endInput.addEventListener('input', function() {
        // Remove non-numeric characters from the input value
        endInput.value = endInput.value.replace(/\D/g, '');
    
        // Format the date as yyyy-mm-dd
        if (endInput.value.length > 4) {
        let enteredYear = parseInt(endInput.value.slice(0, 4));
        let enteredMonth = parseInt(endInput.value.slice(4, 6));
        let enteredDay = parseInt(endInput.value.slice(6, 8));

        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based month

        if (enteredYear != currentYear || (enteredYear === currentYear && enteredMonth !== currentMonth)) {
            errortxtDiv.style.display = "flex";
            errortxt.innerText = vocabulary.wrong_date[currentLang];
        } else {
            let lastDayOfMonth = new Date(enteredYear, enteredMonth, 0).getDate();
            if (enteredDay > lastDayOfMonth) {
                errortxtDiv.style.display = "flex";
                errortxt.innerText = vocabulary.invalid_date[currentLang];
            } else {
                // Check if end date day is smaller than start date day
                let startInputDate = new Date(startInput.value);
                let startDay = startInputDate.getDate();

                if (enteredDay < startDay) {
                    errortxtDiv.style.display = "flex";
                    errortxt.innerText = vocabulary.wrong_end[currentLang];
                } else {
                    errortxtDiv.style.display = "none";
                    errortxt.innerText = "";
                }
            }
        }
            endInput.value = endInput.value.slice(0, 4) + '-' + endInput.value.slice(4, 6) + '-' + endInput.value.slice(6, 8);
        }
    });
    

    value.addEventListener('input', function() {
        var number = parseInt(this.value);
        if(number) {
            infoText.textContent = vocabulary.click_save[currentLang];
            errorDiv.style.display = "none";
            error.innerText = "";
        } 

        if (number < 1) {
            this.value = 1;
        } else if (number > 8) {
            this.value = 8;
        }
    });

    overtimeValue.addEventListener('input', function() {
        var number = parseInt(this.value);
        if(number) {
            errortxtDiv.style.display = "none";
            errortxt.innerText = "";
        } 

        if (number < 1) {
            this.value = 1;
        } else if (number > 8) {
            this.value = 8;
        }
    });

    //When user clicks on "My calendar" it returns authorized user's calendar
    myCalendar.addEventListener('click', () => {
        const authorizedUserLi = document.querySelector('.authorized');
        
        if (authorizedUserLi) {
            authorizedUserLi.click();
        }
     
    });

    addBtn.addEventListener('click', function() {
        
        if (isAddingMode) {
            isAddingMode = false;
            selectedOption.value = null;
            prevNextIcon[0].style.visibility = "visible"; 
            absenceForm.style.display = 'flex';
            dateForm.style.display = 'none';
            deleteBtn.style.display = 'block';
            editBtn.style.display = 'block';
            addBtn.textContent = vocabulary.add[currentLang];
            infoText.textContent = vocabulary.show_info[currentLang];
            daysTag.classList.remove('hoverable');
            daysTag.removeEventListener('click', handleDateSelection);
            selectedOption.innerHTML = "<i class='bx bxs-chevron-down' id='arrow-icon'></i>"; 
            options.style.display = 'none';
                // Clear input fields and remove selected classes from dates
            startDateInput.value = "";
            endDateInput.value = "";
            const selectedDates = daysTag.querySelectorAll('.selected-start, .selected-end, .selected-range, .matching-dates');
            selectedDates.forEach(dateElement => dateElement.classList.remove("selected-start", "selected-end", "selected-range", "matching-dates"));
            enterValue.style.display = "none";
            value.value = "";
            errorDiv.style.display = "none";
            error.innerText = "";
            noteInput.value = "";
            clearAbsenceDataForm();
            daysTag.addEventListener('click', showAbsenceData);
           
        } else {
            isAddingMode = true;
            
            // Check if user is currently viewing a different month, then redirect to current month
            if (currMonth !== date.getMonth() || currYear !== date.getFullYear() || currMonth === date.getMonth() || currYear === date.getFullYear()) {
                currMonth = date.getMonth();
                currYear = date.getFullYear();
                prevNextIcon[0].style.visibility = "hidden"; // Hide previous month icon
                renderCalendar();
            }

            infoText.textContent = vocabulary.choose_start[currentLang];
            dateForm.style.display = 'flex';
            absenceForm.style.display = 'none';
            deleteBtn.style.display = 'none';
            editBtn.style.display = 'none';
            addBtn.textContent = vocabulary.cancel[currentLang];
            daysTag.classList.add('hoverable');
            daysTag.addEventListener('click', handleDateSelection);
            daysTag.removeEventListener('click', showAbsenceData);
            markUserAbsencesOnCalendar(selectedUserId);
        }
    });

    
        deleteBtn.addEventListener('click', () => { 
            const screenWidth = window.innerWidth;
            
            if (isDeleteMode) {
                isDeleteMode = false; 
                buttonsDiv.style.marginLeft = "0";
                buttonsDiv.style.marginRight = "0";
                infoText.textContent = vocabulary.show_info[currentLang];
                deleteBtn.textContent = vocabulary.delete[currentLang];
                // Reset any state you want when canceling delete mode
                deleteAbsenceBtn.style.display = 'none';
                absenceForm.style.display = "flex";
                addBtn.style.display = "block";
                editBtn.style.display = 'block';
                prevNextIcon[0].style.visibility = "visible";
                clearAbsenceDataForm();
                // Remove "remove-" from class names
                const days = daysTag.querySelectorAll('li');
                days.forEach(day => {
                    day.classList.forEach(cls => {
                        if (cls.startsWith('remove-')) {
                            day.classList.remove(cls);
                            day.classList.add(cls.substring(7)); // Remove the "remove-" part
                        }
                    });
                });
                daysTag.addEventListener('click', showAbsenceData);
                daysTag.removeEventListener('click', getAbsence);
                infoDiv.style.marginBottom = "20px";
            } else {
                
                isDeleteMode = true;

                if (screenWidth <= 900) {
                    buttonsDiv.style.marginRight = "20%";
                    buttonsDiv.style.marginLeft = "-100%";
                    
                } else if (screenWidth > 900){
                    buttonsDiv.style.marginLeft = "0";
                    buttonsDiv.style.marginRight = "0";
                }

                infoDiv.style.margin = "20px 0px 0px";
                if (currMonth !== date.getMonth() || currYear !== date.getFullYear() || currMonth === date.getMonth() || currYear === date.getFullYear()) {
                currMonth = date.getMonth();
                currYear = date.getFullYear();
                prevNextIcon[0].style.visibility = "hidden"; // Hide previous month icon
                renderCalendar();
                }
                infoText.textContent = vocabulary.delete_info[currentLang];
                absenceForm.style.display = "none";
                addBtn.style.display = "none";
                editBtn.style.display = 'none';
                deleteBtn.textContent = vocabulary.cancel[currentLang];
                daysTag.addEventListener('click', getAbsence);
                markUserAbsencesOnCalendar(selectedUserId);
                daysTag.removeEventListener('click', showAbsenceData);
            }
        });

        deleteAbsenceBtn.addEventListener('click', () => {

                deleteAbsence(absenceId);
                location.reload(); 
            
        });

        editBtn.addEventListener('click', function() {
            
            if (isEditMode) {
                isEditMode = false;
                errortxtDiv.style.display = "none";
                errortxt.innerText = "";
                startInput.setAttribute('readonly', 'true');
                endInput.setAttribute('readonly', 'true');
                overtimeValue.setAttribute('readonly', 'true');
                notesTextarea.setAttribute('readonly', 'true');
                infoText.textContent = vocabulary.show_info[currentLang];
                prevNextIcon[0].style.visibility = "visible"; 
                deleteBtn.style.display = 'block';
                addBtn.style.display = 'block';
                editBtn.textContent = vocabulary.edit[currentLang];
                editText.textContent = vocabulary.show_txt[currentLang];
                updateBtn.style.display = 'none';
                clearAbsenceDataForm();
                const cursorStyle = `
                #absence_start:hover, #absence_end:hover, .notes-div textarea:hover{
                    cursor: default;
                }
                `;
                styleSheet.insertRule(cursorStyle, styleSheet.cssRules.length);
                absenceTypeInput.style.cursor = "default";
                const days = daysTag.querySelectorAll('li');
                days.forEach(day => {
                    day.classList.forEach(cls => {
                        if(cls.startsWith('edit-')){
                            day.classList.remove(cls);
                            day.classList.add(cls.substring(5)); 
                            // Remove the "arc" div
                            const arc = day.querySelector('.arcstart');
                            const arc2 = day.querySelector('.arcend');
                            if (arc) {
                                arc.remove();
                            }
                            if (arc2) {
                                arc2.remove();
                            }
                        }
                    });
                });   
            } else {
                isEditMode = true;
                // Check if user is currently viewing a different month, then redirect to current month
                if (currMonth !== date.getMonth() || currYear !== date.getFullYear() || currMonth === date.getMonth() || currYear === date.getFullYear()) {
                    currMonth = date.getMonth();
                    currYear = date.getFullYear();
                    prevNextIcon[0].style.visibility = "hidden"; // Hide previous month icon
                    renderCalendar();
                }
                
                infoText.textContent = vocabulary.edit_info[currentLang];
                absenceForm.style.display = 'flex';
                addBtn.style.display = 'none';
                deleteBtn.style.display = 'none';
                editBtn.textContent = vocabulary.cancel[currentLang]; 
                editText.textContent = vocabulary.edit_txt[currentLang];
                markUserAbsencesOnCalendar(selectedUserId);
                clearAbsenceDataForm();
            }
        });

        updateBtn.addEventListener('click', function() {
            updateAbsence(absence_id);
        });   

});

let selectedEditAbsence = null;
// Function to display data about absence in the absence_data form
function showAbsenceData(event) {
    if (event.target.tagName !== 'LI') return;
   
    event.stopPropagation();  
    if (isEditMode === true) {
        notesDiv.style.display = "block";
    }
    const target = event.target;
    if (target.tagName === 'LI') {
        const dayDate = new Date(currYear, currMonth, parseInt(target.innerText));

        if (!cachedData[selectedUserId] || !cachedAbsenceTypes) {
            fetch('/mock/user_absences.json')
            .then(response => response.json())
            .then(absences => {
                cachedData[selectedUserId] = { absences };

                fetch('/mock/absences.json')
                .then(response => response.json())
                .then(absenceTypes => {
                    cachedAbsenceTypes = absenceTypes;
                    processAbsenceData(dayDate, target, startInput, endInput, absenceTypeInput, overtimeValue, valueDiv, notesDiv, notesTextarea);
                });
            });
        } else {
            processAbsenceData(dayDate, target, startInput, endInput, absenceTypeInput, overtimeValue, valueDiv, notesDiv, notesTextarea);
        }
    }
   
    document.addEventListener('click', (event) => {
        if (!absenceForm.contains(event.target) && isEditMode === false) {
            clearAbsenceDataForm();
            startInput.setAttribute('readonly', 'true');
            endInput.setAttribute('readonly', 'true');
            overtimeValue.setAttribute('readonly', 'true');
            notesTextarea.setAttribute('readonly', 'true');
            absenceTypeInput.removeEventListener('click', displayList);
            const cursorStyle = `
                #absence_start:hover, #absence_end:hover, .notes-div textarea:hover{
                    cursor: default;
                }
            `;
            styleSheet.insertRule(cursorStyle, styleSheet.cssRules.length);
            absenceTypeInput.style.cursor = "default";
        }
    });
    
}

//Actions after found matching absence
function processAbsenceData(dayDate, target, startInput, endInput, absenceTypeInput, overtimeValue, valueDiv, notesDiv, notesTextarea) {
    const userAbsences = cachedData[selectedUserId].absences;
    const matchingAbsence = userAbsences.find(absence => {
        const startDate = new Date(absence.start_date);
        startDate.setHours(0, 0, 0, 0); 
        const endDate = new Date(absence.end_date);
        endDate.setHours(0, 0, 0, 0); 
        return dayDate >= startDate && dayDate <= endDate;
    });
    
    if (matchingAbsence && !target.classList.contains('inactive')) {
        startInput.value = matchingAbsence.start_date.split(' ')[0]; 
        endInput.value = matchingAbsence.end_date.split(' ')[0];
        
        const matchingType = cachedAbsenceTypes.find(type => type.value === matchingAbsence.absenceType);

        if (isEditMode === true) {
            if (matchingAbsence.note) {
                notesDiv.style.display = "block"; 
                notesTextarea.value = matchingAbsence.note;
            } else {
                notesDiv.style.display = "block"; 
                notesTextarea.value = "";
            }
        
            if (matchingAbsence.value) {
                valueDiv.style.display = "block"; 
                overtimeValue.value = matchingAbsence.value;
                const buttonStyle = `
                .absence_data input[type="number"]::-webkit-outer-spin-button, 
                .absence_data input[type="number"]::-webkit-inner-spin-button{
                    background: var(--initial);
                    border-left: 1px solid #BBB;
                }
                `;
                styleSheet.insertRule(buttonStyle, styleSheet.cssRules.length);
            } else {
                valueDiv.style.display = "none"; 
                overtimeValue.value = "";
            }

            absence_id = matchingAbsence._id;
            absenceTypeInput.style.cursor = "pointer";
            absenceTypeInput.addEventListener('click', displayList);
            absenceTypeInput.innerHTML = matchingType ? `<span class="color-circle-${matchingType.value}"></span><p>${matchingType.name}</p>` + "<i class='bx bxs-chevron-down' id='selected-arrow'></i>" : "";
            absenceTypeInput.value = matchingType.value;
                const style = `
                  .color-circle-${matchingType.value} {
                    background: var(--absence-${matchingType.value});
                  }
                `;
            styleSheet.insertRule(style, styleSheet.cssRules.length);
            styleSelectedEditAbsence(matchingAbsence);
            return absence_id;
              
        } else {
            absenceTypeInput.innerHTML = matchingType ? matchingType.name : "";
            absenceTypeInput.removeEventListener('click', displayList);
        }
        
        if (matchingAbsence.note) { 
            notesDiv.style.display = "block"; 
            notesTextarea.value = matchingAbsence.note;

        } else {
            notesDiv.style.display = "none";
            notesTextarea.value = "";
        }

        if (matchingAbsence.value) {
            valueDiv.style.display = "block"; 
            overtimeValue.value = matchingAbsence.value;
            const buttonStyle = `
                .absence_data input[type="number"]::-webkit-outer-spin-button, 
                .absence_data input[type="number"]::-webkit-inner-spin-button{
                    background: none;
                    border-left: none;
                }
            `;
            styleSheet.insertRule(buttonStyle, styleSheet.cssRules.length);
        } else {
            valueDiv.style.display = "none"; 
            overtimeValue.value = "";
        }

    } else {
        startInput.value = "";
        endInput.value = "";
        notesDiv.style.display = "none"; 
        valueDiv.style.display = "none"; 
        absenceTypeInput.innerHTML = "<span id='invisible'>*</span>";
        notesTextarea.value = "";
        overtimeValue.value = "";
        updateBtn.style.display = 'none';
        const days = daysTag.querySelectorAll('li');
        days.forEach(day => {
            day.classList.forEach(cls => {
                if(cls.startsWith('edit-')){
                    day.classList.remove(cls);
                    day.classList.add(cls.substring(5)); 
                    // Remove the "arc" div
                    const arc = day.querySelector('.arcstart');
                    const arc2 = day.querySelector('.arcend');
                    if (arc) {
                        arc.remove();
                    }
                    if (arc2) {
                        arc2.remove();
                    }
                }
            });
        });
        selectedEditAbsence = null;
    }
}

//Absence highlighting design and other
function styleSelectedEditAbsence(matchingAbsence) {
    updateBtn.style.display = "block";
    startInput.removeAttribute('readonly');
    endInput.removeAttribute('readonly');
    overtimeValue.removeAttribute('readonly');
    notesTextarea.removeAttribute('readonly');
    const cursorStyle = `
        #absence_start:hover, #absence_end:hover, .value-div input:hover, .notes-div textarea:hover{
            cursor: text;
        }
    `;
    styleSheet.insertRule(cursorStyle, styleSheet.cssRules.length);
    errortxtDiv.style.display = "none"; 
    const days = daysTag.querySelectorAll('li');
   
    if (selectedEditAbsence !== null ) {
        // Clear existing markings for the previously selected absence
        days.forEach(day => {
            day.classList.forEach(cls => {
                if (cls.startsWith('edit-')) {
                    day.classList.remove(cls);
                    day.classList.add(cls.substring(5));
                    
                    const arc = day.querySelector('.arcstart');
                    const arc2 = day.querySelector('.arcend');
                    if (arc) {
                        arc.remove();
                    }
                    if (arc2) {
                        arc2.remove();
                    }
                }
            });
        });     
    }
    const startDate = new Date(matchingAbsence.start_date);
    startDate.setHours(0, 0, 0, 0); 
    const endDate = new Date(matchingAbsence.end_date);
    endDate.setHours(0, 0, 0, 0); 

    selectedEditAbsence = matchingAbsence.absenceType;
    
    // Add the "remove-" at the beginning of the selected absence li elements
    const selectedDays = daysTag.querySelectorAll(`.start-${selectedEditAbsence}, .end-${selectedEditAbsence}, .absence-${selectedEditAbsence}, .startenddate-${selectedEditAbsence}`);
    selectedDays.forEach(day => {
    const dayDate = new Date(currYear, currMonth, parseInt(day.innerText));
        if (dayDate >= startDate && dayDate <= endDate && !day.classList.contains('inactive')) {
            day.classList.forEach(cls => {
                if (cls.startsWith('start-')) {
                    day.classList.remove(cls);
                    day.classList.add(`edit-${cls}`);
                    const arc = document.createElement('div');
                    arc.classList.add('arcstart');
                    day.appendChild(arc);
                } else if (cls.startsWith('end-')) {
                    day.classList.remove(cls);
                    day.classList.add(`edit-${cls}`);
                    const arc2 = document.createElement('div');
                    arc2.classList.add('arcend');
                    day.appendChild(arc2);
                } else if (cls.startsWith('absence-')) {
                    day.classList.remove(cls);
                    day.classList.add(`edit-${cls}`);
                } else if (cls.startsWith('startenddate-')) {
                    day.classList.remove(cls);
                    day.classList.add(`edit-${cls}`);
                }
            });
    }
    
    });
    
    const startEndStyle = `
        .edit-start-${selectedEditAbsence}::before, .edit-end-${selectedEditAbsence}::before, .edit-startenddate-${selectedEditAbsence}::before {
            background: var(--absence-${selectedEditAbsence}) !important; 
        }`;
    const startEndStyle2 = `
        .edit-startenddate-${selectedEditAbsence}::before {
            border: 3px solid var(--outline-gray);
        }`;
    const startStyle = `
        .edit-start-${selectedEditAbsence} {
            background-image: linear-gradient(to right, white 50%, var(--absence-${selectedEditAbsence}-${selectedEditAbsence}) 50%); 
        }`;
    const endStyle = `
        .edit-end-${selectedEditAbsence} {
            background-image: linear-gradient(to left, white 50%, var(--absence-${selectedEditAbsence}-${selectedEditAbsence}) 50%);
        }`;
    const absenceStyle = `
        .edit-absence-${selectedEditAbsence} {
            background: var(--absence-${selectedEditAbsence}-${selectedEditAbsence});
            border-bottom: 3px solid var(--outline-gray);
            border-top: 3px solid var(--outline-gray);
        }`;

    styleSheet.insertRule(startEndStyle, styleSheet.cssRules.length);
    styleSheet.insertRule(absenceStyle, styleSheet.cssRules.length);
    styleSheet.insertRule(startStyle, styleSheet.cssRules.length);
    styleSheet.insertRule(endStyle, styleSheet.cssRules.length);
    styleSheet.insertRule(startEndStyle2, styleSheet.cssRules.length);
    
}
 
// A function to clear absence_data form fields
function clearAbsenceDataForm() {
    overtimeValue.value = "";
    startInput.value = "";
    endInput.value = "";
    notesTextarea.value = "";
    absenceTypeInput.innerHTML = "<span id='invisible'>*</span>";
    notesDiv.style.display = "none"; 
    valueDiv.style.display = "none"; 
}

let selectedAbsenceValue = null;
// Function to get absence data to delete it
async function getAbsence(event) {
    const days = daysTag.querySelectorAll('li');
        event.stopPropagation(); 
        const target = event.target;
        if (target.tagName === 'LI') {
            const dayDate = new Date(currYear, currMonth, parseInt(target.innerText));
            if (!cachedData[selectedUserId] || !cachedAbsenceTypes) {
                const absencesResponse = await fetch('/mock/user_absences.json');
                const absences = await absencesResponse.json();
                cachedData[selectedUserId] = { absences };

                const typesResponse = await fetch('/mock/absences.json');
                const types = await typesResponse.json();
                cachedAbsenceTypes = types;
            }
            const userAbsences = cachedData[selectedUserId].absences;
            const matchingAbsence = userAbsences.find(absence => {
                const startDate = new Date(absence.start_date);
                startDate.setHours(0, 0, 0, 0); 
                const endDate = new Date(absence.end_date);
                endDate.setHours(0, 0, 0, 0); 
                return dayDate >= startDate && dayDate <= endDate;
            });

                if (matchingAbsence && isDeleteMode === true && !target.classList.contains('inactive')) { 

                    if (selectedAbsenceValue !== null ) {
                        // Clear existing markings for the previously selected absence
                        
                        days.forEach(day => {
                            day.classList.forEach(cls => {
                                if (cls.startsWith('remove-')) {
                                    day.classList.remove(cls);
                                    day.classList.add(cls.substring(7)); // Remove the "remove-" part
                                }
                            });
                        });     
                    }
                    const startDate = new Date(matchingAbsence.start_date);
                    startDate.setHours(0, 0, 0, 0); 
                    const endDate = new Date(matchingAbsence.end_date);
                    endDate.setHours(0, 0, 0, 0); 

                    selectedAbsenceValue = matchingAbsence.absenceType;
                    absenceId = matchingAbsence._id;
                    deleteAbsenceBtn.style.display = 'block';
                    
                    // Add the "remove-" at the beginning of the selected absence li elements
                    const selectedDays = daysTag.querySelectorAll(`.start-${selectedAbsenceValue}, .end-${selectedAbsenceValue}, .absence-${selectedAbsenceValue}, .startenddate-${selectedAbsenceValue}`);
                    selectedDays.forEach(day => {
                    const dayDate = new Date(currYear, currMonth, parseInt(day.innerText));
                        if (dayDate >= startDate && dayDate <= endDate && !day.classList.contains('inactive')) {
                            day.classList.forEach(cls => {
                                if (cls.startsWith('start-')) {
                                    day.classList.remove(cls);
                                    day.classList.add(`remove-${cls}`);
                                } else if (cls.startsWith('end-')) {
                                    day.classList.remove(cls);
                                    day.classList.add(`remove-${cls}`);
                                } else if (cls.startsWith('absence-')) {
                                    day.classList.remove(cls);
                                    day.classList.add(`remove-${cls}`);
                                } else if (cls.startsWith('startenddate-')) {
                                    day.classList.remove(cls);
                                    day.classList.add(`remove-${cls}`);
                                }
                            });
                    }
                    
                    });
                    
                    const startEndStyle = `
                    .remove-start-${selectedAbsenceValue}::before, .remove-end-${selectedAbsenceValue}::before, .remove-startenddate-${selectedAbsenceValue}::before {
                        background: var(--bg-red) !important;
                        cursor: pointer;
                    }
                    `;
                    const startStyle = `
                    .remove-start-${selectedAbsenceValue} {
                        background-image: linear-gradient(to right, white 50%, var(--bg-red) 50%) !important;
                    }
                    `;
                    const endStyle = `
                    .remove-end-${selectedAbsenceValue} {
                        background-image: linear-gradient(to left, white 50%, var(--bg-red) 50%);
                    }
                    `;
                    const absenceStyle = `
                        .remove-absence-${selectedAbsenceValue} {
                            background: var(--bg-red);
                        }
                    `;
                
                    styleSheet.insertRule(startEndStyle, styleSheet.cssRules.length);
                    styleSheet.insertRule(absenceStyle, styleSheet.cssRules.length);
                    styleSheet.insertRule(startStyle, styleSheet.cssRules.length);
                    styleSheet.insertRule(endStyle, styleSheet.cssRules.length);
                    
                    return absenceId; //absence Id which is passed to the deleteAbsence() function
                } else {
                    if (selectedAbsenceValue !== null) {
                        // Clear existing markings for the previously selected absence
                        days.forEach(day => {
                            day.classList.forEach(cls => {
                                if (cls.startsWith('remove-')) {
                                    day.classList.remove(cls);
                                    day.classList.add(cls.substring(7)); // Remove the "remove-" part
                                }
                            });
                        }); 

                        selectedAbsenceValue = null;
                    }
                    deleteAbsenceBtn.style.display = 'none';
                }
        }
                 
}                  

// Delete an absence record
function deleteAbsence(absenceId) {
    const token = localStorage.getItem('token');

    fetch('/mock/user_absences.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error deleting absence');
        }
        return response.json();
    })
    .then(data => {
        console.log('Absence deleted successfully', data);
        renderCalendar();
    })
    
}

// Return to main view when switching to another employee
function returnToDefaultView() {
    editText.textContent = vocabulary.show_txt[currentLang];
    addBtn.textContent = vocabulary.add[currentLang];
    editBtn.textContent = vocabulary.edit[currentLang];
    deleteBtn.textContent = vocabulary.delete[currentLang];
    infoText.textContent = vocabulary.show_info[currentLang];
    selectedOption.value = null;
    noteInput.value = "";
    prevNextIcon[0].style.visibility = "visible";
    absenceForm.style.display = 'flex';
    dateForm.style.display = 'none';
    updateBtn.style.display = 'none';
    deleteAbsenceBtn.style.display = 'none';
    daysTag.classList.remove('hoverable');
    daysTag.removeEventListener('click', handleDateSelection);
    daysTag.removeEventListener('click', getAbsence);
    selectedOption.innerHTML = "<i class='bx bxs-chevron-down' id='arrow-icon'></i>";  
    options.style.display = 'none';
    valueDiv.style.display = 'none';
    enterValue.style.display = 'none';
    infoDiv.style.marginBottom = "20px";
    // Clear input fields and remove selected classes from dates
    startDateInput.value = "";
    endDateInput.value = "";
    value.value = "";
    const selectedDates = daysTag.querySelectorAll('.selected-start, .selected-end, .selected-range, .matching-dates');
    selectedDates.forEach(dateElement => dateElement.classList.remove("selected-start", "selected-end", "selected-range", "matching-dates"));
    error.innerText = "";
    errortxt.innerText = "";
    errorDiv.style.display = "none";
    errortxtDiv.style.display = "none";

    // Remove "remove-" from class names
    const days = daysTag.querySelectorAll('li');
    days.forEach(day => {
        day.classList.forEach(cls => {
            if (cls.startsWith('remove-')) {
                day.classList.remove(cls);
                day.classList.add(cls.substring(7)); 
            }
            if(cls.startsWith('edit-')){
                day.classList.remove(cls);
                day.classList.add(cls.substring(5)); 
            }
            // Remove the "arc" div
            const arc = day.querySelector('.arcstart');
            const arc2 = day.querySelector('.arcend');
            if (arc) {
                arc.remove();
            }
            if (arc2) {
                arc2.remove();
            }
        });
    });

    buttonsDiv.style.marginLeft = "0";
    buttonsDiv.style.marginRight = "0";

    // Reset selectedAbsenceValue
    selectedAbsenceValue = null;
    startInput.setAttribute('readonly', 'true');
    endInput.setAttribute('readonly', 'true');
    overtimeValue.setAttribute('readonly', 'true');
    notesTextarea.setAttribute('readonly', 'true');
    absenceTypeInput.removeEventListener('click', displayList);
    const cursorStyle = `
        #absence_start:hover, #absence_end:hover, .notes-div textarea:hover{
            cursor: default;
        }
    `;
    styleSheet.insertRule(cursorStyle, styleSheet.cssRules.length);
    absenceTypeInput.style.cursor = "default";
}

//Choose absence type when isEditMode is on
function editAbsenceType() {
    fetch('/mock/absences.json')
    .then(response => response.json())
    .then(data => {
      const absenceSelect = document.querySelector('.absence_select');
      const absenceTypeInput = absenceSelect.querySelector('.absence_type');
      const absencesList = absenceSelect.querySelector('.absences_list');

      absencesList.innerHTML = '';
      absenceTypeInput.value = null;
      // Loop through the absence types and create an option element for each
      data.forEach(absenceType => {
        const absenceValue = absenceType.value;
        const listItem = document.createElement('li');
       
        listItem.innerHTML = `<span class="color-circle-${absenceValue}"></span><p>${absenceType.name}</p>`; 
        listItem.value = absenceValue;
         
        listItem.addEventListener('click', () => {
            absenceTypeInput.innerHTML = listItem.innerHTML + "<i class='bx bxs-chevron-down' id='selected-arrow'></i>";
            absenceTypeInput.value = absenceValue;
            
            if (absenceTypeInput.value === 13) {
                valueDiv.style.display = "block";
                const buttonStyle = `
                .absence_data input[type="number"]::-webkit-outer-spin-button, 
                .absence_data input[type="number"]::-webkit-inner-spin-button{
                    background: var(--initial);
                    border-left: 1px solid #BBB;
                }
                `;
                styleSheet.insertRule(buttonStyle, styleSheet.cssRules.length);
            } else {
                valueDiv.style.display = "none";
                errortxtDiv.style.display = "none";
            }
            absencesList.style.display = 'none';
          
        });
        
        absencesList.appendChild(listItem);
      });

      //Add an event listener to the document to hide the options list when clicking outside of it
      document.addEventListener('click', (event) => {
        if (!absenceSelect.contains(event.target)) {
            absencesList.style.display = 'none';
        }
      });
   
      daysTag.addEventListener('click', (event) => {
        if (!absenceForm.contains(event.target)) {
            absencesList.style.display = 'none';
            errortxt.innerText = "";
        } 
      });

      for (let i = 1; i <= 13; i++) {
        const style = `
          .color-circle-${i} {
            background: var(--absence-${i});
          }
        `;
        styleSheet.insertRule(style, styleSheet.cssRules.length);
      }
    })
    .catch(error => console.error('Error fetching absence types:', error));
}

// Date format validation before updating the absence
function isValidDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
}

//Send request to update the absence
function updateAbsence(absence_id) {
        const absenceType = document.querySelector('.absence_type').value;
        const startDate = document.getElementById('absence_start').value;
        const endDate = document.getElementById('absence_end').value;
        var noteValue = document.getElementById('notes').value;
        const value = document.getElementById('absence_value').value;

        // Check if all fields are filled
        if (startDate === "" && endDate === "")  {
            errortxtDiv.style.display = "flex";
            errortxt.innerText = vocabulary.fill_dates[currentLang];
            return;  
        } else if (startDate === "") {
            errortxtDiv.style.display = "flex";
            errortxt.innerText = vocabulary.fill_start[currentLang];
            return;
        } else if (endDate === "") {
            errortxtDiv.style.display = "flex";
            errortxt.innerText = vocabulary.fill_end[currentLang];
            return;  
        } else if (absenceType === 13 && value === "") {
            errortxtDiv.style.display = "flex";
            errortxt.innerText = vocabulary.fill_overtime[currentLang];
            return;
        } else if (errortxtDiv.style.display === "flex" && errortxt.innerText != "") {
            return;
        } else if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
            errortxtDiv.style.display = "flex";
            errortxt.innerText = vocabulary.invalid_date_format[currentLang];
            return;
        } else {
            errortxtDiv.style.display = "none";
            errortxt.innerText = "";
            const token = localStorage.getItem('token');

            if (noteValue.trim() === "") {
                noteValue = null;
            }

            const updatedAbsenceData = {
                absenceType: parseInt(absenceType),
                start_date: startDate,
                end_date: endDate,
                person_id: selectedUserId,
                value: parseInt(value),
                note: noteValue
            };

            fetch(`/api/user_absences/${absence_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': "Bearer " + token
                },
    
                body: JSON.stringify(updatedAbsenceData)
            })
            .then(response => response.json())
            .then(data => {
                location.reload();
            })
            .catch(error => console.error('Error updating user absence:', error));
        }
}

//Enables absenceType selection form the list
function displayList () {
    absencesList.style.display = absencesList.style.display === 'none' ? 'block' : 'none';
}

window.addEventListener('DOMContentLoaded', function() {
    function moveInfoText() {
        const screenWidth = window.innerWidth;

        if (screenWidth <= 900 && infoDiv && buttonsDiv) {
            buttonsDiv.insertBefore(infoDiv, buttonsDiv.firstChild);
        } else if (formContainer.contains(infoDiv)) {
            formContainer.insertBefore(infoDiv, formContainer.firstChild);
        }
        if (screenWidth <= 900 && isDeleteMode === true) {
            buttonsDiv.style.marginLeft = "-100%";
            buttonsDiv.style.marginRight = "20%";
        } else if (screenWidth > 900 && isDeleteMode === true) {
            buttonsDiv.style.marginLeft = "0";
            buttonsDiv.style.marginRight = "0";
        }
        if (screenWidth <= 900 && isDeleteMode === false) {
            buttonsDiv.style.marginLeft = "0";
            buttonsDiv.style.marginRight = "0";
        } else if (screenWidth > 900 && isDeleteMode === false) {
            buttonsDiv.style.marginLeft = "0";
            buttonsDiv.style.marginRight = "0";
        }
    }

    // Initial check
    moveInfoText();

    // Check on window resize
    window.addEventListener('resize', moveInfoText);
});

function versionControl() {
    const back_v = document.getElementById("back-v");
    fetch('/mock/version.json')
    .then(response => response.json())
    .then(data => {
        back_v.textContent = "Back " + data.version;
    })
    .catch(error => console.error('Error:', error));
}