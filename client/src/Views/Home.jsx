import { Button, Card, Col, Row } from "react-bootstrap";

export const Home = () => {
  const renderCards = [...Array(20)].map((_, index) => (
    <Col key={index} md={6}>
      <Card className="shadow border-0">
        <Card.Body>
          <Card.Title>Title</Card.Title>
          <Card.Subtitle>Subtitle</Card.Subtitle>
          <Card.Text>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio eum
            perspiciatis harum fugiat porro iste unde fuga! Eligendi perferendis
            laboriosam at sint, consequatur magni rerum reprehenderit porro,
            maxime aut placeat.
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  ));

  return (
    <div>
      <h1>Home</h1>
      <Row className="py-3 g-2">
        <Col xs={12} md="auto">
          <Button className="w-100">Click</Button>
        </Col>
        <Col xs={12} md="auto">
          <Button className="w-100" variant="thirdary">
            Click
          </Button>
        </Col>
      </Row>
      <Row className="g-2">{renderCards}</Row>
    </div>
  );
};
