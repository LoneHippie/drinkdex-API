# Drinkdex API

A backend Express API for handling user authentication and user actions such as saving/uploading data and images for the Drinkdex web app.

## Technologies Used

- NodeJS
- Express
- Mongoose
- MongoDB
- JWT

### Project Goals and Structure

One of the most satisfying challenges met during this project was designing the back end architecture for a MERN stack API. I decided that while the front end can follow a slightly looser structure (the front end was designed before I learned tools such as Figma), the back end must absolutely remain clean and structured to support possible future scalability and for ease of debugging.

The project follows a consistent structure of

> server -> app -> routes -> controllers -> models

With global utilities being imported where needed.

For a secure user authentication system I went with serving JWTs over httpOnly cookies, which taught me a lot about http methods and cors in the process. I decided on MongoDB + Mongoose for storing data and creating model schemas since I was initially unsure of what shape my data would take, and a NoSQL database seemed like the most flexible approach while also letting me utilize a lot of traditional JS in the form of schema methods to cut down on what could've otherwise been tedious front end code.

The most useful trick I learned from this project that I plan to carry forward into other MERN projects was the use of two utility modules for creating clearer app errors and catching asyn errors as they go through Express's pipeline:

```
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
};
```

```
//this function can be used to wrap any async function to catch errors. Any caught errors will be sent to global error handler through Express pipeline
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
```

The use of these two utlities helped me increase workflow on the back end by adding more clarity to what I was doing and adding additional guard rails to the numerous operations being added to the API.

#### Front End

[The front end repo for Drinkdex available here](https://github.com/LoneHippie/drinkdex)
