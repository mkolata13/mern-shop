import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { initProducts } from "../api/initdb";
import { getProducts } from "../api/product";

const DatabaseInitializer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isDatabaseInitialized, setIsDatabaseInitialized] = useState<boolean>(false);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const products = await getProducts();
        setIsDatabaseInitialized(products.products.length > 0);
      } catch (err) {
        setError("Error checking database status");
      }
    };
    checkDatabase();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("No valid file selected");
      return;
    }

    const isJSON = file.name.endsWith(".json");
    const isCSV = file.name.endsWith(".csv");

    if (!isJSON && !isCSV) {
      setError("Invalid file type. Please upload a JSON or CSV file.");
      return;
    }

    try {
      await initProducts(file, isJSON);
      setSuccess(true);
      setFile(null);
      setIsDatabaseInitialized(true);
    } catch (err) {
      setError("Error initializing database");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">Initialize Database</h2>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Database initialized successfully</Alert>}
      {isDatabaseInitialized ? (
        <Alert variant="info">Database already initialized</Alert>
      ) : (
        <div className="d-flex justify-content-center">
          <Form className="w-50">
            <Form.Group>
              <Form.Label>Upload JSON or CSV File</Form.Label>
              <Form.Control type="file" accept=".json,.csv" onChange={handleFileChange} />
            </Form.Group>
            <Button variant="primary" className="mt-3" onClick={handleSubmit} disabled={!file}>
              Initialize Database
            </Button>
          </Form>
        </div>
      )}
    </Container>
  );
};

export default DatabaseInitializer;
