import React, { useState } from "react";
import PropTypes from "prop-types";
import {
	Card,
	Button,
	Col,
	Badge,
	Stack,
	Modal,
	Form,
	ListGroup,
	Container,
} from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { formatBigNumber, truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon"

const Recipe = ({ recipe, buy, reviewRecipe, address }) => {
	const {
		index,
		price,
		name,
		description,
		sold,
		formula,
		image,
		owner,
		canView,
		canReview,
		feedbacks,
		ratingsCounter,
	} = recipe;
	const [review, setReview] = useState("");
	const [rate, setRate] = useState("");
	const [show, setShow] = useState(false);
	const [showFormula, setShowFormula] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const handleCloseFormula = () => setShowFormula(false);
	const handleShowFormula = () => setShowFormula(true);

	return (
		<Col>
			<Card className=" h-100">
				<Card.Header>
					<Stack direction="horizontal" gap={2}>
						<span className="font-monospace text-secondary">
							{truncateAddress(owner)}
						</span>
						<Badge bg="secondary" className="ms-auto">
							{sold} sold
						</Badge>

						<Badge bg="primary" className="ms-auto">
							Rated: {feedbacks.length > 0? ratingsCounter / feedbacks.length : ""}
						</Badge>
					</Stack>
				</Card.Header>
				<div className=" ratio ratio-4x3">
					<img
						src={image}
						alt={name}
						style={{ objectFit: "cover" }}
					/>
				</div>
				<Card.Body className="d-flex  flex-column text-center">
					<Card.Title>{name}</Card.Title>
					<Card.Text className="flex-grow-1 ">
						{description}
					</Card.Text>
					{canView || address === owner ? (
						<>
							<Button
								variant="dark"
								onClick={handleShowFormula}
								className="mb-2"
							>
								Show formula
							</Button>
							<Modal
								show={showFormula}
								onHide={handleCloseFormula}
								backdrop="static"
								keyboard={false}
							>
								<Modal.Header closeButton>
									<Modal.Title>
										Formula for {name}
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<ReactMarkdown
										children={formula}
									></ReactMarkdown>
								</Modal.Body>
								<Modal.Footer>
									<Button
										variant="secondary"
										onClick={handleCloseFormula}
									>
										Close
									</Button>
								</Modal.Footer>
							</Modal>
						</>
					) : (
						<Button
							variant="outline-dark"
							onClick={() => buy(index, price)}
							className="w-100 py-3"
						>
							Buy for {formatBigNumber(price)} CELO
						</Button>
					)}

					<Button
						variant="success"
						onClick={handleShow}
						className="mt-2"
					>
						Reviews
					</Button>
					<Modal
						show={show}
						onHide={handleClose}
						backdrop="static"
						keyboard={false}
					>
						<Modal.Header closeButton>
							<Modal.Title>Reviews for {name}</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Container>
								<ListGroup as="ul">
									{feedbacks.map((feedback, index) => {
										return (
											<ListGroup.Item as="li" key={index} className="mt-2" style={{backgroundColor: "black", color: "white"}}>
												<Stack direction="horizontal">
												<Identicon address={feedback.reviewer} size={28} className="ms-2 me-1"/>
												Rating: {feedback.rating}
												</Stack>
												{feedback.review}
											</ListGroup.Item>
										);
									})}
								</ListGroup>
							</Container>
							{canReview ? (
								<Form>
									<Form.Group
										className="mb-3"
										controlId="review"
									>
										<Form.Label>Review</Form.Label>
										<Form.Control
											as="textarea"
											value={review}
											onChange={(e) =>
												setReview(e.target.value)
											}
											style={{ height: "150px" }}
										/>
									</Form.Group>
									<Form.Group
										className="mb-3"
										controlId="rate"
									>
										<Form.Label>Rate</Form.Label>
										<Form.Control
											type="number"
											min="0"
											max="5"
											value={rate}
											onChange={(e) =>
												setRate(e.target.value)
											}
										/>
									</Form.Group>

									<Button
										variant="success"
										onClick={()=>{
											reviewRecipe(index, review, rate);
										}}
									>
										Submit Review
									</Button>
								</Form>
							) : (
								""
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleClose}>
								Close
							</Button>
						</Modal.Footer>
					</Modal>
				</Card.Body>
				<Card.Footer></Card.Footer>
			</Card>
		</Col>
	);
};

Recipe.propTypes = {
	recipe: PropTypes.instanceOf(Object).isRequired,
	buy: PropTypes.func.isRequired,
	reviewRecipe: PropTypes.func.isRequired,
	address: PropTypes.string.isRequired,
};

export default Recipe;
