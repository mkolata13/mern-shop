import React, { useEffect, useState } from "react";
import { Product } from "../types/Product";
import { getProducts, updateProduct } from "../api/product";
import { Container, Row, Col, Button, Table, Alert, Modal, Form, Spinner, Toast } from "react-bootstrap";
import { Category } from "../types/Category";
import { getCategories } from "../api/category";
import { createSeoDescription } from "../api/product";

const ProductCatalogEmployee: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingSeo, setLoadingSeo] = useState<boolean>(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProducts();
        setProducts(response.products);
        setFilteredProducts(response.products);

        const categoriesResponse = await getCategories();
        if (categoriesResponse && Array.isArray(categoriesResponse.categories)) {
          setAllCategories(categoriesResponse.categories);
        } else {
          setError("Invalid data format for categories.");
        }
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

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const validateProduct = (): boolean => {
    let valid = true;

    if (!selectedProduct?.name || selectedProduct.name.trim().length < 1) {
      setNameError("Name must not be empty");
      valid = false;
    } else {
      setNameError(null);
    }

    if (!selectedProduct?.description || selectedProduct.description.trim().length < 1) {
      setDescriptionError("Description must not be empty");
      valid = false;
    } else {
      setDescriptionError(null);
    }

    if (!selectedProduct?.price || selectedProduct.price < 0.01) {
      setPriceError("Price must be greater than 0");
      valid = false;
    } else {
      setPriceError(null);
    }

    if (!selectedProduct?.weight || selectedProduct.weight < 0.01) {
      setWeightError("Weight must be greater than 0");
      valid = false;
    } else {
      setWeightError(null);
    }

    return valid;
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct || !validateProduct()) return;

    try {
      await updateProduct(
        selectedProduct._id,
        selectedProduct.name,
        selectedProduct.description,
        selectedProduct.price,
        selectedProduct.weight,
        selectedProduct.category._id
      );
      setShowModal(false);
      setProducts((prev) => prev.map(p => p._id === selectedProduct._id ? selectedProduct : p));
      setFilteredProducts((prev) => prev.map(p => p._id === selectedProduct._id ? selectedProduct : p));
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product.");
    }
  };

  const handleSeoDescription = async () => {
    if (selectedProduct) {
      setLoadingSeo(true);
      try {
        const seoDescription = await createSeoDescription(selectedProduct._id);
        if (!seoDescription) {
          throw new Error("SEO description could not be generated.");
        }
        setSelectedProduct({
          ...selectedProduct,
          description: seoDescription,
        });
      } catch (err) {
        console.error("Error generating SEO description:", err);
        setToastMessage("Failed to generate SEO description.");
        setShowToast(true);
      } finally {
        setLoadingSeo(false);
      }
    }
  };  

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">Product Catalog</h2>
        </Col>
      </Row>

      <div className="mb-3 d-flex justify-content-center">
        <input
          className="form-control me-2"
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <select
          id="categorySelect"
          value={selectedCategory}
          onChange={handleCategoryChange}
          aria-label="Select category filter"
          className="form-select me-2"
        >
          <option value="">All Categories</option>
          {allCategories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button onClick={handleSearch} variant="primary">
          Search
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <Alert variant="warning">No products available.</Alert>
      ) : (
        <Table striped bordered hover responsive="sm" className="shadow-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Weight</th>
              <th>Price</th>
              <th>Actions</th>
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
                    onClick={() => handleEditProduct(product)}
                    className="me-2"
                  >
                    Edit Product
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {selectedProduct && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  isInvalid={!!nameError}
                />
                <Form.Control.Feedback type="invalid">{nameError}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  value={selectedProduct.description}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                  isInvalid={!!descriptionError}
                />
                <Form.Control.Feedback type="invalid">{descriptionError}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedProduct.category._id}
                  onChange={(e) => {
                    const selectedCategory = allCategories.find(c => c._id === e.target.value);
                    if (selectedCategory) {
                      setSelectedProduct({ ...selectedProduct, category: selectedCategory });
                    }
                  }}
                >
                  {allCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Weight</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedProduct.weight}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, weight: parseFloat(e.target.value) })}
                  isInvalid={!!weightError}
                />
                <Form.Control.Feedback type="invalid">{weightError}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedProduct.price}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                  isInvalid={!!priceError}
                />
                <Form.Control.Feedback type="invalid">{priceError}</Form.Control.Feedback>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="info"
              onClick={handleSeoDescription}
              disabled={loadingSeo}
            >
              {loadingSeo ? <Spinner animation="border" size="sm" /> : "Generate SEO Description"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={loadingSeo}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveChanges}
              disabled={loadingSeo}
            >
              Save Changes
            </Button>
          </Modal.Footer>
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            bg="danger"
            className="position-fixed top-0 m-2"
          >
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </Modal>
      )}
    </Container>
  );
};

export default ProductCatalogEmployee;
