# CodeBridge API

Backend assessment project using Node.js, Express.js, MySQL, bcrypt and JWT.

## 1. Requirements

- Node.js 18+
- MySQL 8+ or MariaDB
- Postman or Thunder Client

## 2. Database setup

Open MySQL/phpMyAdmin and run:

`sql/schema.sql`

It creates:

- `codebridge_api`
- `users`
- `courses`
- `enrollments`
- 6 sample courses

## 3. Configure environment

Copy `.env.example` to `.env` and set your MySQL password and a strong JWT secret.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=codebridge_api
JWT_SECRET=use_a_long_random_secret_here
JWT_EXPIRES_IN=1h
BCRYPT_ROUNDS=12
```

## 4. Install and run

```bash
npm install
npm run dev
```

Or:

```bash
npm start
```

API base URL:

`http://localhost:5000/api`

## 5. Endpoints

### Health

`GET /api/health`

### Authentication

`POST /api/auth/register`

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

`POST /api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

Copy the returned JWT and send:

`Authorization: Bearer YOUR_TOKEN`

`GET /api/auth/profile` — protected.

### Courses

`GET /api/courses`

Supports:

- `page`
- `limit`
- `search`
- `category`
- `sort=asc|desc`

Examples:

`GET /api/courses?page=1&limit=3`

`GET /api/courses?search=JavaScript`

`GET /api/courses?category=Backend`

`GET /api/courses?sort=desc`

`GET /api/courses/1`

### Enrollments

All enrollment endpoints require JWT.

`POST /api/enrollments`

Single course:

```json
{
  "course_id": 1
}
```

Multiple courses in one transaction:

```json
{
  "course_ids": [1, 2, 3]
}
```

`GET /api/enrollments/mine`

Uses an SQL INNER JOIN to return the logged-in student's courses.

`DELETE /api/enrollments/1`

Drops course 1 for the logged-in user.

## 6. Expected status codes

- 200: successful retrieval/action
- 201: registration or enrollment created
- 400: invalid input
- 401: missing/invalid/expired JWT or bad login
- 403: reserved for authorization rules if extended with admin-only routes
- 404: route/course/enrollment/user not found
- 409: duplicate email or enrollment
- 500: server/database error

## 7. Security features

- bcrypt password hashing
- JWT authentication
- parameterized MySQL queries
- duplicate enrollment enforced by database UNIQUE constraint
- foreign keys with cascade deletes
- input validation
- authentication rate limiting
- hidden `.env` secrets
- `x-powered-by` disabled
- JSON body size limit

## 8. Postman testing checklist

Test these cases:

1. Health check — 200
2. Valid registration — 201
3. Invalid name/email/password — 400
4. Duplicate registration — 409
5. Valid login — 200
6. Wrong password — 401
7. Profile without token — 401
8. Profile with invalid token — 401
9. Profile with valid token — 200
10. Course list — 200
11. Search by title/category — 200
12. Pagination and offset — 200
13. Sort ascending — 200
14. Sort descending — 200
15. Existing course — 200
16. Missing course — 404
17. Enrollment without token — 401
18. Valid single enrollment — 201
19. Valid multi-course enrollment — 201
20. Duplicate enrollment — 409
21. My courses JOIN — 200
22. Drop enrolled course — 200
23. Drop missing enrollment — 404
24. Invalid course ID — 400
25. Unknown route — 404
26. Simulated database failure — 500

## 9. Notes for the assessment

The enrollment controller explicitly uses a MySQL transaction:

- `beginTransaction()`
- validate all requested courses
- insert all enrollments
- `commit()` on success
- `rollback()` on failure

The course pagination offset is:

`offset = (page - 1) * limit`

The API never concatenates user-provided search/category values directly into SQL. Values are passed as parameterized `?` placeholders. The sort direction is selected only from the fixed values `asc` and `desc`, so it is not directly interpolated from arbitrary user input.

For a classroom demonstration of database errors, temporarily stop MySQL or use an intentionally invalid database configuration in a test environment. Do not expose database credentials in screenshots or source control.
