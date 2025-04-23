# Timekeeping system

This project was developed as part of a university qualification work and was created to meet the specific needs of a Latvian company.

The user interface allows users to mark absences on a calendar, as well as view, edit, and delete their records.

### 🧑‍💼 System Roles

The system includes 5 user roles:

1. **Employee** – Can create, read, update, and delete (CRUD) their own absence records.
2. **Foreman** – CRUD access to their own records and those of employees in their department.
3. **Management** – CRUD access to their own records and read-only access to all departmental records.
4. **Senior Management** – CRUD access to their own records and to all departmental records.
5. **Administrator** – Full CRUD access to system users, absence types, departments, and user credentials.

> **CRUD** = Create, Read, Update, Delete

---

### 🛠️ Technologies Used

- **Front-end**: HTML, CSS, Vanilla JavaScript  
- **Back-end simulation**: Node.js, Express

---

## 🌐 Live Demo

You can check out the live version of this project here:

👉 [https://timekeeping-qfub.onrender.com](https://timekeeping-qfub.onrender.com)

No setup needed — just open the link in your browser!

## 🔑 Login

You can find login credentials for each user role in the **creds.json** file located in the project.

Feel free to try out different roles and explore their features!

Example:

- Role: Foreman  
  Username: a.saveika  
  Password: 234

- Role: Senior Management  
  Username: m.kalva  
  Password: 456
  
- Role: Administrator  
  Username: admin  
  Password: admin



