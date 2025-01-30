import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

function Home() {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return (
      <Container className="text-center my-5">
        <h1>Welcome to the Homepage!</h1>
        <p className="mt-4">To gain access, please log in first.</p>
        <Link to="/login">
          <Button variant="primary">Log In</Button>
        </Link>
      </Container>
    );
  }

  if (role === "CLIENT") {
    return (
      <Container className="text-center my-5">
        <h1>Welcome to the Client Homepage!</h1>
        <p className="mt-4">
          To view products, click here {" "}
          <Link to="/products">
            <Button variant="primary">View Products</Button>
          </Link>
        </p>
      </Container>
    );
  }

  if (role === "EMPLOYEE") {
    return (
      <Container className="text-center my-5">
        <h1>Welcome to the Employee Homepage!</h1>
        <p className="mt-4">
          You have access to the employee features.{" "}
          <Link to="/employee/orders">
            <Button variant="primary">Go to Orders</Button>
          </Link>
        </p>
      </Container>
    );
  }
}

export default Home;
