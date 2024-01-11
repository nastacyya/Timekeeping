const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const secretKey = 'your-secret-key';

// Middleware to parse JSON data from requests
app.use(bodyParser.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/templates/login.html');
});

app.get('/homepage', (req, res) => {
    res.redirect('/templates/homepage.html');
});

app.get('/admin', (req, res) => {
    res.redirect('/templates/admin.html');
});

// Login function for checking authorization creds and generating token
app.post('/api/loginpass', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send('Authorization header missing');
    }
    try {
        const credentialsBuffer = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
        const credentials = JSON.parse(credentialsBuffer);

        const { username, password } = credentials;

        // Read credentials from creds.json
        fs.readFile(path.join(__dirname, 'mock', 'creds.json'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading creds.json:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            const storeCredentials = JSON.parse(data);
            
            // Find user by username and password
            const existing = storeCredentials.find(access => access.username === username && access.password === password);

            if (existing) {
                // Generate a JWT token and associate it with the user's ID
                const token = jwt.sign({ user_id: existing.user_id }, secretKey, { expiresIn: '11min' });

                // Send the token and user_id as a response
                res.json({ token: token, user_id: existing.user_id });
            
            } else {
                res.status(401).send('Invalid credentials');
            }
        }) 
    } catch (error) {
        console.error('Error parsing credentials:', error);
        res.status(400).send('Invalid credentials format');
    }

});

// GET, POST, DELETE, PUT for authorization data
app.get('/api/loginpass', (req, res) => {
    fs.readFile(path.join(__dirname, 'mock', 'creds.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading creds.json:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            const creds = JSON.parse(data);
            res.json(creds);
        } catch (error) {
            console.error('Error parsing creds.json:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.put('/api/loginpass/:id', (req, res) => {
    const authId = req.params.id;
    const newData = req.body;
    try {
        const existingData = readAuthData();
        const editingIndex = existingData.findIndex(record => record._id === parseInt(authId));
        const editingPw = existingData[editingIndex];
        editingPw.password = newData.password;
    
        saveAuthData(existingData);
        console.log(`Authorization record with _id ${authId} updated successfully.`);
        res.send(`${JSON.stringify(existingData, null, 2)}`);

    } catch (error) {
        console.error('Error updating authorization record:', error.message);
    }
   
});

app.delete('/api/loginpass/:id', (req, res) => {
    const authId = req.params.id;
   
    deleteAuthById(authId);

    res.json({ message: 'Authorization data deleted successfully' });
});

//Function to add new authorization record
app.post('/api/auth_data', (req, res) => {
    const newData = req.body;

    const existingData = readAuthData();
    
    // Find the maximum _id from the existing data
    const maxId = existingData.reduce((max, record) => Math.max(max, record._id), 0);
    const newId = maxId + 1;
    
    const newAuth = {
        _id: newId,
        username: newData.login,
        password: newData.passw,
        user_id: newData.user_id
    };
    existingData.push(newAuth);
    
    saveAuthData(existingData);

    res.send(`${JSON.stringify(existingData, null, 2)}`);
});
// Function to delete an authorization record 
function deleteAuthById(authId) {
    try {
    const existingData = readAuthData();

    const index = existingData.findIndex((auth) => auth._id === parseInt(authId));

    if (index !== -1) {
        existingData.splice(index, 1);

        saveAuthData(existingData);
        console.log(`Authorization record with _id ${authId} deleted successfully.`);
    } else {
        console.log(`Authorization record with _id ${authId} not found.`);
    }
    } catch (error) {
        console.error('Error deleting authorization record:', error.message);
    }
}

// Function to read authorization data from the file
function readAuthData() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'mock', 'creds.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading credentials:', error.message);
        return [];
    }
}

// Function to save authorization data to the file
function saveAuthData(creds) {
    try {
        const data = JSON.stringify(creds, null, 2);
        fs.writeFileSync(path.join(__dirname, 'mock', 'creds.json'), data, 'utf8');
        console.log('Saved new authorization data.');
    } catch (error) {
        console.error('Error saving credentials', error.message);
    }
}



// GET, POST, DELETE, PUT for user absences
app.get('/api/user_absences', (req, res) => {
    fs.readFile(path.join(__dirname, 'mock', 'user_absences.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading user_absences.json:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            const user_absences = JSON.parse(data);
            res.json(user_absences);
        } catch (error) {
            console.error('Error parsing user_absences.json:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Endpoint to handle saving user absences
app.post('/api/save_user_absence', (req, res) => {
    const newData = req.body; 
   
    check_overlapping_absence(newData);

    const existingData = readUserAbsences();
    // Find the maximum _id from the existing data
    const maxId = existingData.reduce((max, record) => Math.max(max, record._id), 0);
    const newId = maxId + 1;
    
    const newAbsence = {
        _id: newId,
        absenceType: newData.absenceType,
        start_date: newData.start_date,
        end_date: newData.end_date,
        person_id: newData.person_id
    };
    // Conditionally add note and value only if they are not null or empty
    if (newData.note !== "") {
        newAbsence.note = newData.note;
    }

    if (newData.value !== null) {
        newAbsence.value = newData.value;
    }

    existingData.push(newAbsence);
    
    saveUserAbsences(existingData);

    res.send(`${JSON.stringify(existingData, null, 2)}`);
});

function check_overlapping_absence(newData) {
    const existingData = readUserAbsences();
    const overlappingIndex = existingData.findIndex(record =>
        record.start_date <= newData.end_date && record.end_date >= newData.start_date && record.person_id === newData.person_id
    );

    // If there is an overlap, adjust the end_date of the existing absence
    if (overlappingIndex !== -1) {
        const existingAbsence = existingData[overlappingIndex];
        if (existingAbsence.start_date < newData.start_date && existingAbsence.end_date <= newData.end_date) {
            existingAbsence.end_date = new Date(newData.start_date);
            existingAbsence.end_date.setDate(existingAbsence.end_date.getDate() - 1);
            existingAbsence.end_date = existingAbsence.end_date.toISOString().split('T')[0];
            saveUserAbsences(existingData);
        } else if (existingAbsence.start_date >= newData.start_date && existingAbsence.end_date <= newData.end_date) {
            deleteAbsenceById(existingAbsence._id); //delete the overlapping absence if new one covers it
        } else if (existingAbsence.start_date < newData.start_date && existingAbsence.end_date > newData.end_date){  //split the existing absence
            //shorten the existing absence by changing its end date
            const prev_end_date = existingAbsence.end_date;
            existingAbsence.end_date = new Date(newData.start_date);
            existingAbsence.end_date.setDate(existingAbsence.end_date.getDate() - 1);
            existingAbsence.end_date = existingAbsence.end_date.toISOString().split('T')[0];
            saveUserAbsences(existingData);
            
            const maxId = existingData.reduce((max, record) => Math.max(max, record._id), 0);
            const newId = maxId + 1;
            var new_start_date = new Date(newData.end_date);
            new_start_date.setDate(new_start_date.getDate() + 1);
            new_start_date = new_start_date.toISOString().split('T')[0];
            const second_half = {        //after first part was shortened, second part must be created 
                _id: newId,
                absenceType: existingAbsence.absenceType,
                start_date: new_start_date,
                end_date: prev_end_date,
                person_id: existingAbsence.person_id
            };
            // add note and value if deleted overlapping absence had them
            if (existingAbsence.note !== "") {
                second_half.note = existingAbsence.note;
            }
            if (existingAbsence.value !== null) {
                second_half.value = existingAbsence.value;
            }
        
            existingData.push(second_half);
            saveUserAbsences(existingData);
        } else {
            existingAbsence.start_date = new Date(newData.end_date);
            existingAbsence.start_date.setDate(existingAbsence.start_date.getDate() + 1);
            existingAbsence.start_date = existingAbsence.start_date.toISOString().split('T')[0];
            saveUserAbsences(existingData);
        }
    } else {
        return;
    }
}

app.delete('/api/user_absences/:id', (req, res) => {
    const absenceId = req.params.id;
   
    deleteAbsenceById(absenceId);

    res.json({ message: 'Absence deleted successfully' });
});

app.put('/api/user_absences/:id', (req, res) => {
    const absenceId = req.params.id;
    const newData = req.body;
    try {
        check_overlapping_absence(newData);
        
        const existingData = readUserAbsences();
        const editingIndex = existingData.findIndex(record => record._id === parseInt(absenceId));
        const editingAbsence = existingData[editingIndex];
        editingAbsence.absenceType = newData.absenceType;
        editingAbsence.start_date = newData.start_date;
        editingAbsence.end_date = newData.end_date;

        if (newData.note === "") {
            delete editingAbsence.note;  // remove the field from the record
        } else {
            editingAbsence.note = newData.note;
        }

        if (newData.absenceType !== 13) {
            delete editingAbsence.value;
        } else {
            editingAbsence.value = newData.value;
        }
    
        saveUserAbsences(existingData);
        console.log(`Absence with _id ${absenceId} updated successfully.`);
        res.send(`${JSON.stringify(existingData, null, 2)}`);

    } catch (error) {
        console.error('Error updating absence:', error.message);
    }
   
});

// Function to delete an absence from user_absences.json
function deleteAbsenceById(absenceId) {
    try {
    
    const existingData = readUserAbsences();

    // Find the index of the absence with the given id
    const index = existingData.findIndex((absence) => absence._id === parseInt(absenceId));
    // If the absence is found, remove it from the array
    if (index !== -1) {
        existingData.splice(index, 1);

        saveUserAbsences(existingData);
        console.log(`Absence with _id ${absenceId} deleted successfully.`);
    } else {
        console.log(`Absence with _id ${absenceId} not found.`);
    }
    } catch (error) {
        console.error('Error deleting absence:', error.message);
    }
}
// Function to read user absences from the file
function readUserAbsences() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'mock', 'user_absences.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading user absences:', error.message);
        return [];
    }
}
// Function to save user absences to the file
function saveUserAbsences(absences) {
    try {
        const data = JSON.stringify(absences, null, 2);
        fs.writeFileSync(path.join(__dirname, 'mock', 'user_absences.json'), data, 'utf8');
        console.log('User absences saved successfully.');
    } catch (error) {
        console.error('Error saving user absences:', error.message);
    }
}


// GET, POST, DELETE, PUT for users
app.get('/api/users', (req, res) => {
    fs.readFile(path.join(__dirname, 'mock', 'users.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users.json:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            const users = JSON.parse(data);
            res.json(users);
        } catch (error) {
            console.error('Error parsing users.json:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.post('/api/users', (req, res) => {
    const newData = req.body;

    const existingData = readUsers();
    
    // Find the maximum _id from the existing data
    const maxId = existingData.reduce((max, record) => Math.max(max, record._id), 0);
    const newId = maxId + 1;
    
    const newUser = {
        _id: newId,
        sn: newData.sn,
        givenName: newData.givenName,
        role: newData.role,
        department: newData.department
    };
    // Conditionally add default hours only if it is not null 
    if (newData.default_hours !== null) {
        newUser.default_hours = newData.default_hours;
    }

    existingData.push(newUser);
    
    saveUsers(existingData);

    res.send(`${JSON.stringify(existingData, null, 2)}`);
});

app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const newData = req.body;

    const existingData = readUsers();
    const editingIndex = existingData.findIndex(record => record._id === parseInt(userId));
    const editingUser = existingData[editingIndex];
    editingUser.sn = newData.sn;
    editingUser.givenName = newData.givenName;
    editingUser.role = newData.role;
    editingUser.department = newData.department;

    if (newData.default_hours === null) {
        delete editingUser.default_hours;  // remove the field from the record
    } else {
        editingUser.default_hours = newData.default_hours;
    }
    
    saveUsers(existingData);
    console.log('Updated user record.');
    res.send(`${JSON.stringify(existingData, null, 2)}`);
});

// Route for deleting a user
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
   
    deleteUserById(userId);

    res.json({ message: 'User deleted successfully' });
});

// Function to delete a user from users.json
function deleteUserById(userId) {
    try {
    const existingData = readUsers();

    const index = existingData.findIndex((user) => user._id === parseInt(userId));

    if (index !== -1) {
        existingData.splice(index, 1);

        saveUsers(existingData);
        console.log(`User with _id ${userId} deleted successfully.`);
    } else {
        console.log(`User with _id ${userId} not found.`);
    }
    } catch (error) {
        console.error('Error deleting user:', error.message);
    }
}

// Function to read users from the file
function readUsers() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'mock', 'users.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error.message);
        return [];
    }
}

// Function to save users to the file
function saveUsers(users) {
    try {
        const data = JSON.stringify(users, null, 2);
        fs.writeFileSync(path.join(__dirname, 'mock', 'users.json'), data, 'utf8');
        console.log('Saved new users list.');
    } catch (error) {
        console.error('Error saving users:', error.message);
    }
}


// GET, POST, DELETE, PUT for departments
app.get('/api/departments', (req, res) => {
    fs.readFile(path.join(__dirname, 'mock', 'departments.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading departments.json:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            const departments = JSON.parse(data);
            res.json(departments);
        } catch (error) {
            console.error('Error parsing departments.json:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.post('/api/departments', (req, res) => {
    const newData = req.body;

    const existingData = readDepartments();
    
    // Find the maximum _id from the existing data
    const maxId = existingData.reduce((max, record) => Math.max(max, record._id), 0);
    const newId = maxId + 1;
    
    const newDepartment = {
        _id: newId,
        name: newData.name,
        value: newData.value,
    };
    existingData.push(newDepartment);
    
    saveDepartments(existingData);

    res.send(`${JSON.stringify(existingData, null, 2)}`);
});

app.put('/api/departments/:id', (req, res) => {
    const depId = req.params.id;
    const newData = req.body;

    const existingData = readDepartments();
    const editingIndex = existingData.findIndex(record => record._id === parseInt(depId));
    const editingDepartment = existingData[editingIndex];
    editingDepartment.name = newData.name;
    editingDepartment.value = newData.value;
    
    saveDepartments(existingData);
    console.log('Updated department record.');
    res.send(`${JSON.stringify(existingData, null, 2)}`);
});

// Route for deleting a department
app.delete('/api/departments/:id', (req, res) => {
    const depId = req.params.id;
   
    deleteDepartmentById(depId);

    res.json({ message: 'Department deleted successfully' });
});

// Function to delete a department
function deleteDepartmentById(depId) {
    try {
  
    const existingData = readDepartments();

    const index = existingData.findIndex((department) => department._id === parseInt(depId));

    if (index !== -1) {
        existingData.splice(index, 1);

        saveDepartments(existingData);
        console.log(`Department with _id ${depId} deleted successfully.`);
    } else {
        console.log(`Department with _id ${depId} not found.`);
    }
    } catch (error) {
        console.error('Error deleting department:', error.message);
    }
}
// Function to read departments from the file
function readDepartments() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'mock', 'departments.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading departments:', error.message);
        return [];
    }
}
// Function to save departments to the file
function saveDepartments(departments) {
    try {
        const data = JSON.stringify(departments, null, 2);
        fs.writeFileSync(path.join(__dirname, 'mock', 'departments.json'), data, 'utf8');
        console.log('Saved new departments list.');
    } catch (error) {
        console.error('Error saving departments:', error.message);
    }
}


// GET, POST, DELETE, PUT for absence types
app.get('/api/absence_types', (req, res) => {
    fs.readFile(path.join(__dirname, 'mock', 'absences.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading absences.json:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            const absenceTypes = JSON.parse(data);
            res.json(absenceTypes);
        } catch (error) {
            console.error('Error parsing absences.json:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.post('/api/absence_types', (req, res) => {
    const newData = req.body;

    const existingData = readAbsenceTypes();
    
    // Find the maximum _id from the existing data
    const maxId = existingData.reduce((max, record) => Math.max(max, record._id), 0);
    const newId = maxId + 1;
    
    const newType = {
        _id: newId,
        name: newData.name,
        value: newData.value,
        short_name: newData.short_name
    };
    existingData.push(newType);
    
    saveAbsenceTypes(existingData);

    res.send(`${JSON.stringify(existingData, null, 2)}`);
});

app.put('/api/absence_types/:id', (req, res) => {
    const typeId = req.params.id;
    const newData = req.body;

    const existingData = readAbsenceTypes();
    const editingIndex = existingData.findIndex(record => record._id === parseInt(typeId));
    const editingType = existingData[editingIndex];
    editingType.name = newData.name;
    editingType.value = newData.value;
    editingType.short_name = newData.short_name;
    
    saveAbsenceTypes(existingData);
    console.log('Updated absence type record.');
    res.send(`${JSON.stringify(existingData, null, 2)}`);
});

// Route for deleting an absence type
app.delete('/api/absence_types/:id', (req, res) => {
    const typeId = req.params.id;
   
    deleteTypeById(typeId);

    res.json({ message: 'Absence type deleted successfully' });
});

// Function to delete an absence type
function deleteTypeById(typeId) {
    try {
  
    const existingData = readAbsenceTypes();

    const index = existingData.findIndex((type) => type._id === parseInt(typeId));

    if (index !== -1) {
        existingData.splice(index, 1);

        saveAbsenceTypes(existingData);
        console.log(`Absence type with _id ${typeId} deleted successfully.`);
    } else {
        console.log(`Absence type with _id ${typeId} not found.`);
    }
    } catch (error) {
        console.error('Error deleting absence type:', error.message);
    }
}
// Function to read absence types from the file
function readAbsenceTypes() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'mock', 'absences.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading absence types:', error.message);
        return [];
    }
}
// Function to save absence types to the file
function saveAbsenceTypes(types) {
    try {
        const data = JSON.stringify(types, null, 2);
        fs.writeFileSync(path.join(__dirname, 'mock', 'absences.json'), data, 'utf8');
        console.log('Saved new absence types list.');
    } catch (error) {
        console.error('Error saving absence types:', error.message);
    }
}


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});