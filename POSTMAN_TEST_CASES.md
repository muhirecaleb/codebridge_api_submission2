# CodeBridge API — Postman Test Cases

Base URL: `http://localhost:5000/api`

## Register

### Valid
POST `/auth/register`

```json
{
  "full_name": "Test Student",
  "email": "student1@example.com",
  "password": "Password123"
}
```

Expected: 201

### Invalid email
Expected: 400

### Duplicate email
Repeat the valid request.

Expected: 409

## Login

POST `/auth/login`

Expected valid: 200

Wrong password: 401

Save the returned `token`.

## Profile

GET `/auth/profile`

Without Authorization header: 401

With:

`Authorization: Bearer <token>`

Expected: 200

## Courses

GET `/courses?page=1&limit=2`

Expected: 200 and `pagination.offset = 0`.

GET `/courses?page=2&limit=2`

Expected: 200 and `pagination.offset = 2`.

GET `/courses?search=JavaScript`

Expected: 200.

GET `/courses?category=Backend`

Expected: 200.

GET `/courses?sort=asc`

Expected: courses ordered by price low-to-high.

GET `/courses?sort=desc`

Expected: courses ordered by price high-to-low.

GET `/courses/99999`

Expected: 404.

## Enrollment

POST `/enrollments`

Header:

`Authorization: Bearer <token>`

Body:

```json
{
  "course_id": 1
}
```

Expected: 201.

Repeat the same request.

Expected: 409.

For transaction testing:

```json
{
  "course_ids": [2, 3, 4]
}
```

Expected: 201 and all three rows are inserted.

GET `/enrollments/mine`

Expected: 200 and course details returned through JOIN.

DELETE `/enrollments/1`

Expected: 200.

Repeat the delete.

Expected: 404.

## Unauthorized test

Remove the Bearer token from enrollment requests.

Expected: 401.

## Unknown route

GET `/something-random`

Expected: 404.

## Database error

For a controlled classroom demonstration only, stop the MySQL server and call an endpoint that needs the database.

Expected: 500 JSON error response.

tested the api and it is working 