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

// Default route to redirect to login.html
app.get('/', (req, res) => {
    res.redirect('/templates/login.html');
});

app.get('/homepage', (req, res) => {
    res.redirect('/templates/homepage.html');
});

app.get('/admin', (req, res) => {
    res.redirect('/templates/admin.html');
});

// New route to handle login logic
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

                // Send the token as a response
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

// New route to handle fetching absence types
app.get('/api/absence_types', (req, res) => {
    // Read absence types from absence_types.json
    fs.readFile(path.join(__dirname, 'mock', 'absences.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading absence_types.json:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            const absenceTypes = JSON.parse(data);
            res.json(absenceTypes);
        } catch (error) {
            console.error('Error parsing absence_types.json:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

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

    // Read existing data
    const existingData = readUserAbsences();
    // Generate a new _id for the absence by taking the last _id and adding +1
    const newId = existingData.length > 0 ? existingData[existingData.length - 1]._id + 1 : 1;
    
    // Conditionally add note and value only if they are not null or empty
    const newAbsence = {
        _id: newId,
        absenceType: newData.absenceType,
        start_date: newData.start_date,
        end_date: newData.end_date,
        person_id: newData.person_id
    };

    if (newData.note !== "") {
        newAbsence.note = newData.note;
    }

    if (newData.value !== null) {
        newAbsence.value = newData.value;
    }

    existingData.push(newAbsence);
    
    // Save the updated data
    saveUserAbsences(existingData);

    res.send(`${JSON.stringify(existingData, null, 2)}`);
});

// Example route to handle DELETE requests for deleting an absence
app.delete('/api/user_absences/:id', (req, res) => {
    const absenceId = req.params.id;
   
    deleteAbsenceById(absenceId);

    res.json({ message: 'Absence deleted successfully' });
});

// Example route to handle PUT requests for editing an absence
app.put('/api/user_absences/:id', (req, res) => {
    const absenceId = req.params.id;
    const newData = req.body;
    try {
        // Read existing data
        const existingData = readUserAbsences();
    
        // Conditionally add note and value only if they are not null or empty
        const updatedAbsence = {
            _id: absenceId,
            absenceType: newData.absenceType,
            start_date: newData.start_date,
            end_date: newData.end_date,
            person_id: newData.person_id
        };
    
        if (newData.note !== "") {
            newAbsence.note = newData.note;
        }
    
        if (newData.value !== null) {
            newAbsence.value = newData.value;
        }
    
        existingData.push(updatedAbsence);
            // Save the updated data
            saveUserAbsences(existingData);
            console.log(`Absence with _id ${absenceId} updated successfully.`);
        
        } catch (error) {
            console.error('Error updating absence:', error.message);
        }
});

// Function to delete an absence from user_absences.json
function deleteAbsenceById(absenceId) {
    try {
    // Read existing data
    const existingData = readUserAbsences();

    // Find the index of the absence with the given id
    const index = existingData.findIndex((absence) => absence._id === parseInt(absenceId));
    // If the absence is found, remove it from the array
    if (index !== -1) {
        existingData.splice(index, 1);

        // Save the updated data
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

// Endpoint to handle saving users
app.post('/api/users', (req, res) => {
    const newData = req.body;

    // Read existing data
    const existingData = readUsers();
    // Generate a new _id for the user by taking the last _id and adding +1
    const newId = existingData.length > 0 ? existingData[existingData.length - 1]._id + 1 : 1;
    
    // Conditionally add default hours only if it is not null 
    const newUser = {
        _id: newId,
        sn: newData.sn,
        givenName: newData.givenName,
        role: newData.role,
        department: newData.department
    };

    if (newData.default_hours !== null) {
        newAbsence.default_hours = newData.default_hours;
    }

    existingData.push(newUser);
    
    // Save the updated data
    saveUsers(existingData);

    res.send(`${JSON.stringify(existingData, null, 2)}`);
});

// Example route to handle DELETE requests for deleting an absence
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
   
    // Implement the logic to delete the absence with the specified ID
    deleteUserById(userId);

    res.json({ message: 'User deleted successfully' });
});

// Function to delete an absence from user_absences.json
function deleteUserById(userId) {
    try {
    // Read existing data
    const existingData = readUsers();

    // Find the index of the user with the given id
    const index = existingData.findIndex((user) => user._id === parseInt(userId));
    // If the user is found, remove it from the array
    if (index !== -1) {
        existingData.splice(index, 1);

        // Save the updated data
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
        console.log('Users saved successfully.');
    } catch (error) {
        console.error('Error saving users:', error.message);
    }
}
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});