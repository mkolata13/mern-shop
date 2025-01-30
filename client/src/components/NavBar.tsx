import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUsernameFromJwt } from "../utils/GetJwtUsername";
import { getRoleFromJwt } from "../utils/GetJwtRole";
import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";
import useCart from "../hooks/useCart";

const NavBar: React.FC = () => {
  const { isLoggedIn, role, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <Navbar bg="light" expand="lg">
      <Container style={{ maxWidth: "1000px" }}>
        <Navbar.Brand as={Link} to="/">
          AJI Shop
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          <Nav className="mx-auto">
            {isLoggedIn && role === "CLIENT" && (
              <>
                <Nav.Link as={Link} to="/products">Catalog</Nav.Link>
                <Nav.Link as={Link} to="/orders">My orders</Nav.Link>
                <Nav.Link as={Link} to="/cart" className="d-flex align-items-center">
                  <FaShoppingCart size={20} />
                  Cart
                  {totalItems > 0 && (
                    <Badge pill bg="danger" className="ms-1">
                      {totalItems}
                    </Badge>
                  )}
                </Nav.Link>
              </>
            )}
            {isLoggedIn && role === "EMPLOYEE" && (
              <>
                <Nav.Link as={Link} to="/employee/import-products">Import products</Nav.Link>
                <Nav.Link as={Link} to="/employee/products">Manage Products</Nav.Link>
                <Nav.Link as={Link} to="/employee/orders">Manage orders</Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="d-flex ms-auto align-items-center">
            {isLoggedIn ? (
              <>
                <span className="me-2">
                  {getUsernameFromJwt()} ({getRoleFromJwt()})
                </span>
                <Nav.Link as="button" className="btn btn-link" onClick={logout}>
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="btn btn-link">
                  Log in
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="btn btn-link">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
