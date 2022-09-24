import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { uploadToIpfs } from "../../../utils/minter";
import { ethers } from "ethers";
const AddRecipe = ({ save }) => {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [formula, setFormula] = useState("");
  const [price, setPrice] = useState("");
  const isFormFilled = () => name && image && description && formula && price;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "38px" }}
      >
        <i className="bi bi-plus"></i>
      </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Recipe</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FloatingLabel
              controlId="inputName"
              label="Recipe name"
              className="mb-3"
            >
              <Form.Control
                type="text"
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Enter name of recipe"
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputUrl"
              label="Image URL"
              className="mb-3"
            >
              <Form.Control
                  type="file"
                  className={"mb-3"}
                  onChange={async (e) => {
                      const imageUrl = await uploadToIpfs(e)
                      if (!imageUrl) {
                          alert("failed to upload image");
                          return;
                      }
                      setImage(imageUrl);
                  }
                  }
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputDescription"
              label="Description"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="description"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputFormula"
              label="Formula"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="Use markdown to write formula down"
                onChange={(e) => {
                  setFormula(e.target.value);
                }}
                style={{ height: '200px' }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputPrice"
              label="Price"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Price"
                onChange={(e) => {
                  setPrice(ethers.utils.parseUnits(e.target.value));
                }}
              />
            </FloatingLabel>
          </Modal.Body>
        </Form>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                image,
                description,
                formula,
                price,
              });
              handleClose();
            }}
          >
            Save recipe
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddRecipe.propTypes = {
  save: PropTypes.func.isRequired,
};

export default AddRecipe;