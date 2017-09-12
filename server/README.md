# root url

https://davinci.corp/api/v1/domains/(domain_id)


- /dashboards (POST/DELETE/PUT/GET(by all/id/filter))
- /widgets (POST/DELETE/PUT/GET(by all/id/filter))
- /bizlogics (POST/DELETE/PUT/GET(by all/id/filter))
- /users (POST/DELETE/PUT/GET(by all/id/filter))
all   /users
id    /users/(id) 
filter /users?sortby=name&order=asc


- /groups (POST/DELETE/PUT/GET(by all/id/filter))
- /settings (POST/DELETE/PUT/GET(by all/id/filter))
- /bindings/dashboards_widgets (POST)
- /bindings/groups_bizlogics (POST)
- /bindings/users_groups (POST)


GET /zoos: List all Zoos (ID and Name, not too much detail)
POST /zoos: Create a new Zoo
GET /zoos/ZID: Retrieve an entire Zoo object
PUT /zoos/ZID: Update a Zoo (entire object)
PATCH /zoos/ZID: Update a Zoo (partial object)
DELETE /zoos/ZID: Delete a Zoo
GET /zoos/ZID/animals: Retrieve a listing of Animals (ID and Name).
GET /animals: List all Animals (ID and Name).
POST /animals: Create a new Animal
GET /animals/AID: Retrieve an Animal object
PUT /animals/AID: Update an Animal (entire object)
PATCH /animals/AID: Update an Animal (partial object)
GET /animal_types: Retrieve a listing (ID and Name) of all Animal Types
GET /animal_types/ATID: Retrieve an entire Animal Type object
GET /employees: Retrieve an entire list of Employees
GET /employees/EID: Retreive a specific Employee
GET /zoos/ZID/employees: Retrieve a listing of Employees (ID and Name) who work at this Zoo
POST /employees: Create a new Employee
POST /zoos/ZID/employees: Hire an Employee at a specific Zoo
DELETE /zoos/ZID/employees/EID: Fire an Employee from a specific Zoo

?limit=10: Reduce the number of results returned to the Consumer (for Pagination)
?offset=10: Send sets of information to the Consumer (for Pagination)
?animal_type_id=1: Filter records which match the following condition (WHERE animal_type_id = 1)
?sortby=name&order=asc: Sort the results based on the specified attribute (ORDER BY name ASC)


POST https://davinci..corp/api/v1/login
POST https://davinci..corp/api/v1/changepwd
POST https://davinci..corp/api/v1/logout


