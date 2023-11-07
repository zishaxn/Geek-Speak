# Simple Blog Application

The Simple Blog Application is a web application that allows users to create, update, and delete blog posts. It is built using MongoDB, Express, and Node.js, and includes user authentication with login and logout functionality.

## Features

- **User Authentication**: Users can sign up, log in, and log out of the application.
- **Blog Creation**: Registered users can create new blog posts with a title, content, and optional images.
- **Blog Editing**: Users can edit their own blog posts, updating the title, content, and images.
- **Blog Deletion**: Users can delete their own blog posts.
- **View Blogs**: Visitors and registered users can view all published blog posts.
- **Responsive Design**: The application is designed to work on various devices and screen sizes.

## Technologies Used

- **MongoDB**: A NoSQL database for storing blog posts and user data.
- **Express**: A web application framework for Node.js.
- **Node.js**: A server-side JavaScript runtime.
- **bcrypt**: Secure password hashing.
- **bcryptjs**: Bcrypt for JavaScript.
- **body-parser**: HTTP request data parsing.
- **cors**: Cross-Origin Resource Sharing.
- **dotenv**: Configuration and secrets management.
- **jsonwebtoken**: Authentication and authorization.
- **jwt-decode**: JSON Web Token decoding.
- **serve-favicon**: A middleware for serving a favicon.
- **validator**: Input validation.

## Installation

1. Clone the repository: `git clone <repository-url>`
2. Install dependencies: `npm install`
3. Set up MongoDB: Configure your MongoDB database connection in `config/database.js`.
4. Start the server: `npm start`
5. Open your web browser and visit `http://localhost:3000` to access the application.

## Usage

- Register for a new account or log in with your existing credentials.
- Create, edit, or delete your blog posts.
- View all published blog posts created by you and other users.

## Contributing

Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them with clear and concise messages.
4. Push your branch to your forked repository: `git push origin feature/your-feature-name`
5. Create a pull request to the main repository.

## License

This project is licensed under the [MIT License](LICENSE).

## Guidance and Reference

I followed [Ademir Alijagic](https://www.linkedin.com/in/ademiralijagic).
