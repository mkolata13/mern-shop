import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import { getOrders, updateOrder } from '../api/order';
import { getStatuses } from '../api/orderstatus';
import { Order } from '../types/Order';
import { OrderStatus } from '../types/OrderStatus';

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('UNAPPROVED');

  useEffect(() => {
    const fetchData = async () => {
      const ordersData = await getOrders();
      const statusesData = await getStatuses();
      setOrders(ordersData.orders);
      setStatuses(statusesData.statuses);
    };

    fetchData();
  }, []);

  const handleChangeStatus = async (id: string, statusId: string) => {
    await updateOrder(id, statusId);
    const updatedOrders = await getOrders();
    setOrders(updatedOrders.orders);
  };

  const handleFilterChange = (status: string) => {
    setSelectedStatus(status);
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">Manage Orders</h2>
        </Col>
      </Row>

      <div className="mb-3 d-flex justify-content-center">
        {statuses.map((status) => (
          <Button
            key={status._id}
            variant={status.name === selectedStatus ? 'primary' : 'outline-secondary'}
            onClick={() => handleFilterChange(status.name)}
            className="me-2"
          >
            {status.name}
          </Button>
        ))}
      </div>

      <Table striped bordered hover responsive="sm" className="shadow-sm">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Confirmation Date</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Items</th>
            <th>Total Price</th>
            {['CANCELLED', 'COMPLETED'].includes(selectedStatus) ? (
              <th>Opinion</th>
            ) : (
              <th>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {orders
            .filter((order) => order.status?.name === selectedStatus)
            .map((order) => (
              <tr key={order._id}>
                <td className="text-center">{order._id}</td>
                <td className="text-center">
                  {order.confirmationDate
                    ? new Date(order.confirmationDate).toLocaleDateString()
                    : 'Not Confirmed'}
                </td>
                <td className="text-center">{order.username}</td>
                <td>{order.email}</td>
                <td>{order.phoneNumber}</td>
                <td>
                  {order.items?.map((item) => (
                    <div key={item.product._id}>
                      {item.product.name} - {item.amount} pcs
                    </div>
                  )) || 'No Products'}
                </td>
                <td className="text-end">
                  {order.items?.reduce(
                    (acc, item) => acc + item.product.price * item.amount,
                    0
                  ).toFixed(2) || 0}
                  $
                </td>
                <td>
                  {['UNAPPROVED', 'APPROVED'].includes(order.status?.name || '') && (
                    <>
                      {order.status?.name === 'UNAPPROVED' && (
                        <>
                          <Button
                            variant="success"
                            onClick={() =>
                              handleChangeStatus(
                                order._id,
                                statuses.find((status) => status.name === 'APPROVED')?.name ||
                                  ''
                              )
                            }
                            className="me-2"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() =>
                              handleChangeStatus(
                                order._id,
                                statuses.find((status) => status.name === 'CANCELLED')?.name ||
                                  ''
                              )
                            }
                            className="me-2"
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {order.status?.name === 'APPROVED' && (
                        <>
                          <Button
                            variant="success"
                            onClick={() =>
                              handleChangeStatus(
                                order._id,
                                statuses.find((status) => status.name === 'COMPLETED')?.name ||
                                  ''
                              )
                            }
                            className="me-2"
                          >
                            Complete
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() =>
                              handleChangeStatus(
                                order._id,
                                statuses.find((status) => status.name === 'CANCELLED')?.name ||
                                  ''
                              )
                            }
                            className="me-2"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  {['CANCELLED', 'COMPLETED'].includes(order.status?.name || '') && (
                    <div>
                      {order.opinion ? (
                        <div>
                          <div>{order.opinion.rating}/5</div>
                          <div>{order.opinion.content}</div>
                        </div>
                      ) : (
                        <div>No Opinion</div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ManageOrders;
