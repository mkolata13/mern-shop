import React, { useEffect, useState, useContext } from "react";
import { Product } from "../types/Product";
import { getProducts } from "../api/product";
import { Container, Row, Col, InputGroup, FormControl, Button, Table, Alert } from "react-bootstrap";
import CartContext from "../context/CartProvider";
import useCart from "../hooks/useCart";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { totalPrice } = useCart();

  const { dispatch, REDUCER_ACTIONS, cart } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProducts();
        setProducts(response.products);
        setFilteredProducts(response.products);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory ? product.category._id === selectedCategory : true)
    );
    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const addToBasket = (product: Product) => {
    const existingProduct = cart.find(item => item._id === product._id);
    
    if (existingProduct) {
      if (existingProduct.amount < 20) {
        dispatch({
          type: REDUCER_ACTIONS.ADD,
          payload: { ...product, amount: existingProduct.amount + 1 },
        });
        toast.success(`Added 1 more ${product.name} to your cart. Total price: ${totalPrice}`);
      } else {
        toast.warn(`You can't add more than 20 ${product.name}s to the cart.`);
      }
    } else {
      dispatch({
        type: REDUCER_ACTIONS.ADD,
        payload: { ...product, amount: 1 },
      });
      toast.success(`${product.name} has been added to your cart!`);
    }
  };

  const categories = [...new Set(products.map((product) => product.category._id))];

  if (loading) {
    return <div className="text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  return (
    <Container className="my-5">
      <h1 className="text-center">Product Catalog</h1>

      <Row className="mb-4">
        <Col xs={12} md={4}>
          <InputGroup>
            <FormControl
              placeholder="Search by name"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </Col>

        <Col xs={12} md={4}>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="form-select"
            aria-label="Select product category"
          >
            <option value="">All Categories</option>
            {categories.map((categoryId, index) => {
              const category = products.find(product => product.category._id === categoryId)?.category;
              return category ? (
                <option key={index} value={category._id}>
                  {category.name}
                </option>
              ) : null;
            })}
          </select>
        </Col>

        <Col xs={12} md={4}>
          <Button onClick={handleSearch} variant="primary" className="w-100">
            Search
          </Button>
        </Col>
      </Row>

      {filteredProducts.length === 0 ? (
        <Alert variant="warning">No products available.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Weight</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.category.name}</td>
                <td>{product.weight.toFixed(2)} kg</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <Button
                    variant="success"
                    onClick={() => addToBasket(product)}
                    className="me-2"
                  >
                    Add to Basket
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ProductCatalog;
