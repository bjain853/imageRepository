# Webgallery REST API Documentation

## Comment API

### Create

- description: create a new comment
- request: `POST /api/comments/`
    - content-type: `application/json`
    - body: object
      - content: (string) the content of the message
      - imageId : (string) id of the image on which comment was posted.
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the comment id
      - imageId : (string) the _id of the image to which comment belongs to.
      - author: (string) the authors username
      - content: (int) content of the comment
      - date: (int) date of the comment
- response : 404 
  - content-type: `application/json`
    - body : (string) Comment content not provided
- response : 403
  - content-type: `application/json`
    - body: (string) Access Denied  
``` 
$ curl -b cookie.txt -i -X POST -H "Content-Type: application/json" -d "{\"content\":\"Beautiful picture\",\"imageId\":\"_cjdsvh765\"}" http://localhost:3000/api/comments/
```

### Read

- description: retrieve the comments for image with id :id on page number  :page , each page displaying :size comments 
- request: `GET /api/image/:id/comments/:page/:size/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) the message id
      - content: (string) the content of the comment.
      - author: (string) the authors username
      - date: (date) the date when comment was posted
- response : 404
  - content-type: `application.json`
  - body : (string)  Id : :id is invalid
- response : 403
  - content-type: `application/json`
    - body: (string) Access Denied  
 
``` 
$ curl -b cookie.txt  http://localhost:3000/api/image/_hwehb7438/comments/1/4/
``` 
  
  
### Delete
  
- description: delete the comment given it's id.
- request: `DELETE /api/comments/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the comment id
        - content: (string) the content of the comment
        - author: (string) the authors username
        - date: (date) the date of comment
- response: 400
    - body: Bad Request
- response : 404 
  - body :  Comment with id: :id doesn't exist
- response : 500
  - body :  Comment id :id can't be deleted
- response : 403
  - content-type: `application/json`
    - body: (string) Access Denied  
  
``` 
$ curl -b cookie.txt -X DELETE http://localhost:3000/api/comments/_hasgy754/
``` 

## Image API

### Create

- description: Upload a new image to the server
- request: `POST /api/images/`
    - content-type: `multipart/form-data`
    - body: object
      - file: (binary file) the image that was uploaded
      - title: (string) the title of the image
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - title: (string) the title of image
      - author: (string) the image uploaders username
      - date: (int) the number of upvotes
      - next: Object
        - _id : (string) id of the next image in list 
      - previous : Object
        - _id : (string) id of the previous image in list 
- response : 500
  - content-type : `application/json`
    - body : (string) Image cannot be saved to database
- response : 501 
  - content-type :  `application/json`
    - body : Object 
      - err : Any error which occured while inserting the image  
- response : 404
  - content-type : `application/json`
  - body : (string) Bad Request 
- response : 403
  - content-type: `application/json`
    - body: (string) Access Denied  

``` 
$ curl -i -F "title=Batman" -F "picture=@/path/to/pic.jpg" http://localhost:3000/api/images/
```

### Read

- description: retrieve the image given it's id
- request: `GET /api/images/:id/`   
- response: 200
    - content-type: `image/*`
    - body: (binary-data) image whose id is provided
- response : 404
    - content-type: `application/json`
      - Image with imageId : id does not exist
- response : 403
  - content-type: `application/json`
    - body: (string) Access Denied  
 
``` 
$ curl -b cookie.txt http://localhost:3000/api/images/_nxjabsj987/
``` 

- description: retrieve info about an image
- request: `GET /api/image/:id/info/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - title: (string) the title of image
      - author: (string) the image uploaders username
      - date: (int) the number of upvotes
      - next: Object
        - _id : (string) id of the next image in list 
      - previous : Object
        - _id : (string) id of the previous image in list
- response : 200
  - content-type:   `application/json` 
- response : 500
  - content-type : `application/json`
  - body : Object 
  - error : Error occured during querying database.  
- response : 404
  - content-type : `application/json`
  - body :  (string) Image with id :id doesn't exist
- response : 400
  - content-type : `application/json`
    - body : (string) Bad Request 
- response : 403
  - content-type: `application/json`
    - body: (string) Access Denied  
 
``` 
$ curl -b cookie.txt http://localhost:3000/api/image/_nxjabsj987/info/
``` 

- description: gets the info if database of images is empty or not. 
- request: `GET /api/imagesIsEmpty/`   
- response: 200
    - content-type: `application/json`
    - body: Object
      - empty: (boolean) true if there is an image in database, false otherwise.
- response : 500
  - content-type : `application/json`
  - body : Object
  -  err : error which occured during querying database.
- response : 403
  - content-type: `application/json`
    - body: (string) Access Denied  
 
``` 
$ curl -b cookie.txt http://localhost:3000/api/imagesIsEmpty/
``` 
  
### Delete
  
- description: delete the image given it's id
- request: `DELETE /api/image/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
     - deleted : (boolean) true if image was successfully deleted otherwise false.
- response: 400
  - content-type : `application/json`
    - body: (string) Bad Request
- response : 404
  - content-type : `application/json`
    - body :  (string) Image with id: :id doesn't exist
- response : 500
 - content-type : `application/json`
    - body : Object
    -  Error: (Object) error which occured while querying the database
- response : 501
  - content-type: `application/json`
    - body : (string) Comments related to image cannot be deleted
- response : 403
  - content-type: `application/json`
    - body: (string) Access Denied  

``` 
$ curl -X DELETE http://localhost:3000/api/image/_jed5672j/
``` 

## User API

### Create

- description: Sign up a new user
- request: `POST /api/signup/`
    - content-type: `application/json`
      - body: object
        - username: (string) username of user
        - password: (string) user's password
- response: 200
    - content-type: `application/json`
      - body: (string) user :username signed up
- response 409
  - content-type : `application/json`
    - body : (string) username :username already exists 
- response 400
  - content-type : `application/json`
    - body : (string) username/password not provided   
- response 500 
  - content-type: `application/json`
    - body : Object
      - Error : (Object) Error which occured during querying of the database.

``` 
$ curl -X POST -d "username=admin&password=pass4admin" http://localhost:3000/signup/
```


### Read

- description: Sign in an existing user
- request: `POST /api/signin/`
    - content-type: `application/json`
    - body: object
      - username: (string) username of user
      - password: (string) user's password
- response: 200
    - content-type: `application/json`
    - body: string
      - user username signed in
- response: 401
  - content-type : `application/json`
  - body : string
    - No such username exists 
- response: 400
  - content-type : `application/json`
  - body : string
    - Username/Password not provided   
- response: 500 
  - content-type: `application/json`
  - body : string 
    - err 

``` 
$ curl -X POST -d "username=admin&password=pass4admin" -c cookie.txt http://localhost:3000/api/signin/
```

- description : send currently logged in user
- request: `GET /api/user/`
- content : null
- response : 200
  - content-type: `application/json`
    - body : Object
      - User : (string) username of logged in user   
  
### Delete
  
- description: delete the user from server's session
- request: `DELETE /api/signout/`
- response: 200
    - content-type: `text/html`
    - body: (webpage) login.html

``` 
$ curl -X GET http://localhost:3000/api/signout/
``` 