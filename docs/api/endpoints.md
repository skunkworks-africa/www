# API Endpoints

## GET /courses

Retrieve a list of courses.

### Request

```sh
curl -X GET https://api.skunkworks.africa/v1/courses -H "Authorization: Bearer YOUR_API_KEY"
Response
json
Copy code
[
  {
    "id": 1,
    "name": "Course 1",
    "description": "Description of Course 1"
  },
  {
    "id": 2,
    "name": "Course 2",
    "description": "Description of Course 2"
  }
]
POST /courses
Create a new course.

Request
sh
Copy code
curl -X POST https://api.skunkworks.africa/v1/courses -H "Authorization: Bearer YOUR_API_KEY" -d '{
  "name": "New Course",
  "description": "Description of the new course"
}'
Response
json
Copy code
{
  "id": 3,
  "name": "New Course",
  "description": "Description of the new course"
}
