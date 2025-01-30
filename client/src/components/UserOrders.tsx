import React, { useEffect, useState } from "react";
import { Table, Container, Spinner, Alert, Button, Form, Modal } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { getOrders } from "../api/order";
import { addOpinionToOrder } from "../api/order";
import { Order } from "../types/Order";

interface JwtPayload {
  username?: string;
}

const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No authentication token found");

        const decoded: JwtPayload = jwtDecode(token);

        const response = await getOrders();

        if (!response.orders) throw new Error("Invalid response format");

        const userOrders = response.orders.filter(
          (order: Order) => order.username === decoded.username
        );

        setOrders(userOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleAddOpinion = async () => {
    if (!selectedOrderId) return;
  
    const rating = ratings[selectedOrderId] || 0;
    const opinionContent = content;
  
    try {
      await addOpinionToOrder(selectedOrderId, rating, opinionContent);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrderId ? { ...order, opinion: { rating, content: opinionContent } } : order
        )
      );
      setModalMessage("Opinion added successfully!");
    } catch (err) {
      console.error("Error adding opinion:", err);
      setModalMessage("Failed to add opinion.");
    }
    setShowModal(true);
  };
  
  const handleShowModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalMessage(null);
    setContent("");
    setRatings((prevRatings) => ({
      ...prevRatings,
      [orderId]: 0,
    }));
    setShowModal(true);
  };
  

  const handleRatingChange = (orderId: string, rating: number) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [orderId]: rating,
    }));
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading orders...</p>
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger" className="text-center">{error}</Alert>;
  }

  return (
    <Container className="my-5">
      <h2 className="text-center">Your Orders</h2>

      {orders.length === 0 ? (
        <Alert variant="warning" className="text-center">No orders found.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Items</th>
              <th>Total Price</th>
              <th>Opinion</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.email}</td>
                <td>{order.phoneNumber || "N/A"}</td>
                <td>{order.status?.name || "Unknown"}</td>
                <td>
                  <ul>
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <li key={item.product._id}>
                          {item.amount}x {item.product.name} - $
                          {typeof item.product.price === "number" ? item.product.price.toFixed(2) : "0.00"}
                        </li>
                      ))
                    ) : (
                      <li>No items</li>
                    )}
                  </ul>
                </td>
                <td>
                  $
                  {order.items
                    .reduce((acc, item) => acc + item.amount * item.product.price, 0)
                    .toFixed(2)}
                </td>
                <td>
                  {order.status?.name === "COMPLETED" || order.status?.name === "CANCELLED" ? (
                    order.opinion ? (
                      <p>
                        {order.opinion.rating}/5 <br />
                        {order.opinion.content}
                      </p>
                    ) : (
                      <div>
                        <Button
                          variant="primary"
                          onClick={() => handleShowModal(order._id)}
                        >
                          Rate Order
                        </Button>
                      </div>
                    )
                  ) : (
                    <p>No opinion available</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalMessage ? "Message" : "Rate Your Order"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMessage ? (
            <p className="text-center">{modalMessage}</p>
          ) : (
            <>
              <Form.Group>
                <Form.Label>Rating (1-5)</Form.Label>
                <div>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={ratings[selectedOrderId || ""] === rating ? "primary" : "outline-primary"}
                      onClick={() => handleRatingChange(selectedOrderId || "", rating)}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </Form.Group>
              <Form.Group>
                <Form.Label>Opinion</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add your opinion"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {!modalMessage && (
            <Button variant="primary" onClick={handleAddOpinion}>
              Submit Opinion
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserOrders;
