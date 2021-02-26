# Webgallery REST API Documentation

## Comment API

### Create

- description: create a new comment
- request: `POST /api/image/:id/comments/`
    - content-type: `application/json`
    - body: object
      - content: (string) the content of the message
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the comment id
      - imageId : (string) the _id of the image to which comment belongs to.
      - author: (string) the authors username
      - content: (int) content of the comment
      - date: (int) date of the comment

``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"content":"hello world"} 
       http://localhost:3000/api/image/:id/comments/'
```

### Read

- description: retrieve the comments for a particular page , each page displaying 5 comments 
- request: `GET /api/image/:id/comments/:page/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) the message id
      - content: (string) the content of the comment.
      - author: (string) the authors username
      - date: (date) the date when comment was posted
 
``` 
$ curl http://localhost:3000//api/image/_hwehb7438/comments/1/
``` 
  
  
### Delete
  
- description: delete the comment given it's id.
- request: `DELETE /api/image/comments/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the comment id
        - content: (string) the content of the comment
        - author: (string) the authors username
        - date: (date) the date of comment
- response: 404
    - body: message :id does not exists

``` 
$ curl -X DELETE
       http://localhost:3000/api/image/comments/_hasgy754/
``` 

## Image API

### Create

- description: create a new message
- request: `POST /api/messages/`
    - content-type: `application/json`
    - body: object
      - content: (string) the content of the message
      - author: (string) the authors username
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes

``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"content":"hello world","author":"me"} 
       http://localhost:3000/api/messages/'
```

### Read

- description: retrieve the image before the one whose id is provided. 
- request: `GET /api/image/:id/prev/`   
- response: 200
    - content-type: `application/json`
    - body: 
      - previous: (string) the _id of the previous image
 
``` 
$ curl http://localhost:3000/api/image/_nxjabsj987/prev/
``` 
- description: retrieve the last 5 messages 
- request: `GET /api/image/:id/next/`   
- response: 200
    - content-type: `application/json`
    - body: 
      - next: (string) the id of next image
 
``` 
$ curl http://localhost:3000/api/image/_nxjabsj987/next/
``` 
- description: gets the info if database of images is empty or not. 
- request: `GET /api/imagesIsEmpty/`   
- response: 200
    - content-type: `application/json`
    - body:
      - empty: (boolean) true if there is an image in database, false otherwise.
 
``` 
$ curl http://localhost:3000/api/imagesIsEmpty/
``` 

- description: retrieve the infoformation about image given it's id
- request: `GET '/api/image/:id/info/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - author: (string) the authors username
      - title: (int) the title of image
      - date : (date) the date of image posted
- response: 404
    - body: image id does not exist

``` 
$ curl http://localhost:3000/api/image/_nxjabsj987/info/
``` 
 - description: retrieves anyone image from the database.
- request: `GET '/api/image/default/`
- response: 200
    - content-type: `application/json`
    - body: object
     - _id: (string) the message id
      - author: (string) the authors username
      - title: (int) the title of image
      - date : (date) the date of image posted

``` 
$ curl http://localhost:3000/api/image/default/
```  
 - description: retrieve the actual image file
- request: `GET '/api/images/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes
- response: 404
    - body: message id does not exists

``` 
$ curl http://localhost:3000/api/image/_jed5672jd9/
```  
  
### Delete
  
- description: delete the image given it's id
- request: `DELETE /api/image/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
     - _id: (string) the message id
      - author: (string) the authors username
      - title: (int) the title of image
      - date : (date) the date of image posted
- response: 404
    - body: message :id does not exists

``` 
$ curl -X DELETE
       http://localhost:3000/api/messages/jed5672jd90xg4awo789/
``` 

## User API

### Create

- description: create a new message
- request: `POST /api/messages/`
    - content-type: `application/json`
    - body: object
      - content: (string) the content of the message
      - author: (string) the authors username
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes

``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"content":"hello world","author":"me"} 
       http://localhost:3000/api/messages/'
```

### Read

- description: retrieve the last 5 messages 
- request: `GET /api/messages/[?limit=5]`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) the message id
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes
 
``` 
$ curl http://localhost:3000/api/messages/
``` 

- description: retrieve the message id
- request: `GET /api/messages/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes
- response: 404
    - body: message id does not exists

``` 
$ curl http://localhost:3000/api/messages/jed5672jd90xg4awo789/
``` 
  
### Update

- description: upvote or downvote the message id
- request: `PATCH /api/messages/:id/`
    - content-type: `application/json`
    - body: object
      - action: (string) either `upvote` or `downvote`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes
- response: 400
    - body: invalid argument
- response: 404
    - body: message :id does not exists
  
``` 
$ curl -X PATCH 
       -H 'Content-Type: application/json'
       -d '{"action":"upvote"} 
       http://localhost:3000/api/messages/jed5672jd90xg4awo789/'
```
  
  
### Delete
  
- description: delete the message id
- request: `DELETE /api/messages/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the message id
        - content: (string) the content of the message
        - author: (string) the authors username
        - upvote: (int) the number of upvotes
        - downvote: (int) the number of downvotes
- response: 404
    - body: message :id does not exists

``` 
$ curl -X DELETE
       http://localhost:3000/api/messages/jed5672jd90xg4awo789/
``` 