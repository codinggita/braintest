# QuizApp — MERN Stack (Teacher & Student Roles)

A full-stack quiz application built with MongoDB, Express.js, React, and Node.js. Teachers can create and manage quizzes. Students can take quizzes and see their scores.

---

## Features

### Teacher
- Register / Login as a Teacher
- Create a new quiz with a title and topic
- Add multiple-choice questions to a quiz
- Edit or delete existing quizzes
- View student submissions and scores

### Student
- Register / Login as a Student
- Browse all available quizzes
- Take a quiz and answer questions one by one
- See score and results after submitting

---

## Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Frontend   | React, Axios        |
| Backend    | Node.js, Express.js |
| Database   | MongoDB, Mongoose   |
| Auth       | JWT, bcrypt         |

---

## Folder Structure

```
quiz-app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (Login, Dashboard, Quiz)
│   │   ├── context/         # Auth context (user role, token)
│   │   └── App.jsx
│   └── package.json
│
├── server/                  # Express backend
│   ├── models/
│   │   ├── User.js          # User schema (name, email, password, role)
│   │   ├── Quiz.js          # Quiz schema (title, topic, createdBy)
│   │   ├── Question.js      # Question schema (text, options, answer, quizId)
│   │   └── Submission.js    # Submission schema (studentId, quizId, score)
│   ├── routes/
│   │   ├── auth.js          # POST /auth/register, POST /auth/login
│   │   ├── quizzes.js       # CRUD routes for quizzes
│   │   └── submissions.js   # POST /submit, GET /results
│   ├── middleware/
│   │   └── auth.js          # JWT verification + role check
│   ├── .env
│   └── index.js
│
└── README.md
```

---

## MongoDB Collections

### Users
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "teacher"
}
```

### Quizzes
```json
{
  "title": "JavaScript Basics",
  "topic": "Programming",
  "createdBy": "<teacher_user_id>"
}
```

### Questions
```json
{
  "quizId": "<quiz_id>",
  "questionText": "What does 'var' do in JavaScript?",
  "options": ["Declares a variable", "Creates a loop", "Defines a function", "None"],
  "correctAnswer": "Declares a variable"
}
```

### Submissions
```json
{
  "studentId": "<student_user_id>",
  "quizId": "<quiz_id>",
  "score": 8,
  "totalQuestions": 10,
  "submittedAt": "2026-03-14T10:00:00Z"
}
```

---

## API Routes

### Auth
| Method | Route               | Access  | Description          |
|--------|---------------------|---------|----------------------|
| POST   | /api/auth/register  | Public  | Register new user    |
| POST   | /api/auth/login     | Public  | Login and get token  |

### Quizzes
| Method | Route               | Access       | Description           |
|--------|---------------------|--------------|-----------------------|
| GET    | /api/quizzes        | All users    | Get all quizzes       |
| GET    | /api/quizzes/:id    | All users    | Get one quiz          |
| POST   | /api/quizzes        | Teacher only | Create a new quiz     |
| PUT    | /api/quizzes/:id    | Teacher only | Update a quiz         |
| DELETE | /api/quizzes/:id    | Teacher only | Delete a quiz         |

### Submissions
| Method | Route                        | Access       | Description              |
|--------|------------------------------|--------------|--------------------------|
| POST   | /api/quizzes/:id/submit      | Student only | Submit quiz answers      |
| GET    | /api/quizzes/:id/results     | Teacher only | See all student results  |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free) or local MongoDB
- npm

### 1. Clone the repository
```bash
git clone https://github.com/your-username/quiz-app.git
cd quiz-app
```

### 2. Setup the server
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:
```bash
npm run dev
```

### 3. Setup the client
```bash
cd ../client
npm install
npm run dev
```

The React app runs on `http://localhost:5173` and the API on `http://localhost:5000`.

---

## How Role-Based Auth Works

1. When a user registers, they choose a role: `teacher` or `student`.
2. On login, the server returns a **JWT token** containing the user's ID and role.
3. The token is stored in the browser (localStorage or context).
4. Every protected API request sends the token in the `Authorization` header.
5. The server middleware checks the token and the role before allowing access.

```
Authorization: Bearer <token>
```

If a student tries to access a teacher-only route, the server responds with:
```json
{ "message": "Access denied. Teachers only." }
```

---

## Pages (React)

| Page              | Route             | Who can see it  |
|-------------------|-------------------|-----------------|
| Login             | /login            | Everyone        |
| Register          | /register         | Everyone        |
| Teacher Dashboard | /dashboard        | Teachers only   |
| Create Quiz       | /quiz/create      | Teachers only   |
| Edit Quiz         | /quiz/edit/:id    | Teachers only   |
| Student Home      | /home             | Students only   |
| Take Quiz         | /quiz/:id         | Students only   |
| Results           | /quiz/:id/results | Students only   |

---

## Environment Variables

| Variable    | Description                        |
|-------------|------------------------------------|
| PORT        | Port for the Express server        |
| MONGO_URI   | MongoDB connection string          |
| JWT_SECRET  | Secret key for signing JWT tokens  |

---

## Future Improvements

- Timer for each quiz
- Teacher can see per-student breakdown
- Students can retry a quiz
- Quiz categories and search/filter
- Email verification on register

---

## License

MIT License. Free to use and modify.


idea apruved by sir 