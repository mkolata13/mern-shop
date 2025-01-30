import React, { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button, Alert, Form, Spinner } from "react-bootstrap";
import CartContext from "../context/CartProvider";
import { CartItem } from "../types/CartItem";
import { createOrder } from "../api/order";
import { getUsernameFromJwt } from "../utils/GetJwtUsername";

const Cart: React.FC = () => {
  const { cart, totalPrice, dispatch, REDUCER_ACTIONS } = useContext(CartContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    const usernameFromJwt = getUsernameFromJwt();
    if (usernameFromJwt) {
      setUsername(usernameFromJwt);
    }
  }, []);

  const handleRemove = (item: CartItem) => {
    dispatch({ type: REDUCER_ACTIONS.REMOVE, payload: item });
  };

  const handleQuantityChange = (item: CartItem, newAmount: number) => {
    if (newAmount >= 0 && newAmount <= 20) {
      dispatch({ type: REDUCER_ACTIONS.QUANTITY, payload: { ...item, amount: newAmount } });
    }
    if (newAmount === 0) {
      handleRemove(item);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const makeOrder = async () => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }

    setEmailError(null);
    setPhoneError(null);

    try {
      setOrderStatus(null);
      setLoading(true);
      const items = cart.map((item) => ({
        product: item._id,
        amount: item.amount,
      }));
      await createOrder(username, email, phoneNumber, items);
      setTimeout(() => {
        setLoading(false);
        setShowSuccessAlert(true);
        setOrderPlaced(true);
        setTimeout(() => {
          setShowSuccessAlert(false);
          dispatch({ type: REDUCER_ACTIONS.SUBMIT });
        }, 3000);
      }, 1000);
    } catch (error) {
      setLoading(false);
      setOrderStatus("There was an error placing your order. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <Container className="my-5">
        <h1 className="text-center">Your Cart</h1>
        <Alert variant="warning" className="text-center">
          Your cart is empty.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Your Cart</h1>
      <Row>
        <Col md={8}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.category.name}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min="0"
                      max="20"
                      value={item.amount}
                      onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                    />
                  </td>
                  <td>${(item.price * item.amount).toFixed(2)}</td>
                  <td>
                    <Button variant="danger" onClick={() => handleRemove(item)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Row>
            <Col className="text-end">
              <h4>Total Price: {totalPrice}</h4>
            </Col>
          </Row>
        </Col>
        <Col md={4}>
          <div className="p-4 rounded d-flex flex-column gap-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
            <h4>Enter Your Details</h4>
            <Form>
              <Form.Group controlId="email">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  placeholder="Enter your email"
                  isInvalid={!!emailError}
                />
                <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="phoneNumber" className="mt-3">
                <Form.Label>Phone number</Form.Label>
                <Form.Control
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setPhoneError(null);
                  }}
                  placeholder="Enter your phone number"
                  isInvalid={!!phoneError}
                />
                <Form.Control.Feedback type="invalid">{phoneError}</Form.Control.Feedback>
              </Form.Group>
            </Form>
            <Button
              variant="primary"
              className="mt-3"
              onClick={makeOrder}
              disabled={!username || !email || !phoneNumber || cart.length === 0 || loading || orderPlaced}
            >
              Place Order
            </Button>
          </div>
        </Col>
      </Row>
      {orderStatus && !loading && (
        <Row className="mt-4">
          <Col>
            <Alert variant={orderStatus.includes("success") ? "success" : "danger"}>{orderStatus}</Alert>
          </Col>
        </Row>
      )}
      {loading && (
        <Row className="mt-4">
          <Col className="text-center">
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      )}
      {showSuccessAlert && (
        <Row className="mt-4">
          <Col>
            <Alert variant="success">
              Your order has been successfully placed! Thank you for shopping with us.
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;
