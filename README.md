# MERN Shop

This project consists of a client and an API backend. The backend is built with Express, Typegoose (a wrapper for Mongoose), MongoDB, and TypeScript. The frontend is a React application using React-Bootstrap and TypeScript. JWT is used for authentication and authorization, and the project uses Docker for the database setup.

## Technologies

### Backend:
- **Node.js** – JavaScript runtime
- **Express** – Web framework
- **TypeScript** – Typed JavaScript
- **Typegoose (Mongoose)** – MongoDB ODM
- **MongoDB** – NoSQL database
- **JWT** – for JWT-based authentication
- **Docker** – Database containerization

### Frontend:
- **React** – Frontend library
- **React-Bootstrap** – UI components
- **React-Toastify** – Notifications

## Setup

### Backend

1. Clone the repository:

    ```bash
    git clone <repository_url>
    cd <project_folder>
    ```

2. Install dependencies:

    ```bash
    cd api
    npm install
    ```

3. Create a `.env` file in the `backend/` folder and configure environment variables for MongoDB, Groq, and JWT secrets:

    ```env
    MONGO_URI=mongodb://admin:admin@localhost:27017
    PORT=3000

    GROQ_API_KEY=   # You can get your Groq API key from: https://console.groq.com/keys
    GROQ_URL=https://api.groq.com/openai/v1/chat/completions

    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret

    REFRESH_TOKEN_EXPIRATION_TIME=30m
    ACCESS_TOKEN_EXPIRATION_TIME=5m

    FRONTEND_URL=http://localhost:5173
    ```

4. Start the backend server:

    ```bash
    npm run devStart
    ```

### Frontend

1. Navigate to the frontend folder:

    ```bash
    cd client
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the frontend development server:

    ```bash
    npm run dev
    ```

### Docker Setup

1. To start the MongoDB database in Docker:

    ```bash
    docker compose -f backend/dockerfiles/docker-compose.yml up -d
    ```

2. This will set up the MongoDB instance for the Express backend, and the database will be accessible at:  

    ```bash
    mongodb://admin:admin@localhost:27017
    ```

### JWT Authentication

- JWT tokens are used to authenticate and authorize requests.
- When a user logs in, a JWT token is generated and returned. This token should be included in the `Authorization` header of requests to protected routes.

### API Routes

#### **Authentication Routes**
- `POST /api/login`: Logs in a user and returns a JWT token.
- `POST /api/register`: Registers a new user.
- `GET /api/refresh`: Refreshes the authentication token.
- `GET /api/logout`: Logs out the user by invalidating the refresh token.

#### **Product Routes**
- `GET /api/products/`: Retrieves a list of all products.
- `POST /api/products/`: Creates a new product.
- `GET /api/products/:id`: Retrieves a single product by ID.
- `PUT /api/products/:id`: Updates a product by ID.
- `GET /api/products/:id/ai-description`: Generates an AI-based description for a product.

#### **Order Routes**
- `GET /api/orders/`: Retrieves all orders.
- `POST /api/orders/`: Creates a new order.
- `PATCH /api/orders/:id`: Updates an order (restricted to EMPLOYEE role).
- `GET /api/orders/status/:id`: Retrieves orders with a specific status.
- `POST /api/orders/:id/opinions`: Adds an opinion to an order (restricted to CLIENT role).

#### **Order Status Routes**
- `GET /api/order-status/`: Retrieves all available order statuses.

#### **Category Routes**
- `GET /api/categories/`: Retrieves all product categories.

#### **Database Initialization Routes**
- `POST /api/init/`: Initializes the product database using an uploaded file (restricted to EMPLOYEE role).

### Folder Structure

- `backend/`: Contains the Express server and API logic.
- `backend/dockerfiles/`: Docker-related files for database setup.
- `backend/.env`: Environment variables for backend configuration.
- `frontend/`: Contains the React application with the user interface.
- `sample_data/`: Sample data to initialize the product database.

## Running the Project

1. Make sure Docker is running and the MongoDB container is up.
2. Start the backend and frontend as described above.
3. Open the application in your browser at `http://localhost:5173` (React frontend) and interact with the API.

## Notes

- The backend API is available at `http://localhost:3000` by default.
- JWT authentication is implemented for user login and protected routes.
- Make sure to configure your environment variables (`.env`) with the appropriate MongoDB URI and JWT secrets.
- You can create only **client-type** users.
- There is **one employee-type user** already created in the database with the following credentials:

    ```
    Login: pracownik1
    Password: haslo123
    ```