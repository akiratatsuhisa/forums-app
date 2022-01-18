import logo from "../logo.svg";

import { Button, Container, Nav, Navbar } from "react-bootstrap";

export const BaseNavigation = () => {
  return (
    <>
      <Navbar bg="light">
        <Container>
          <Navbar.Brand>
            <img
              src={logo}
              width="30"
              height="30"
              className="d-inline-block"
              alt="..."
            />{" "}
            App
          </Navbar.Brand>
          <div className="ms-auto">
            <Button variant="secondary" className="rounded-pill">
              Register
            </Button>{" "}
            <Button className="rounded-pill">Login</Button>
          </div>
        </Container>
      </Navbar>
      <Navbar
        className="shadow sticky-top"
        expand="md"
        style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
      >
        <Container>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse>
            <Nav>
              <Nav.Link>Forums</Nav.Link>
              <Nav.Link>Members</Nav.Link>
              <Nav.Link>Latests</Nav.Link>
            </Nav>
          </Navbar.Collapse>

          <div className="ms-auto">
            <Button className="rounded-pill">
              <span className="d-none d-md-inline text">Search </span>
              <i className="bi bi-search"></i>
            </Button>
          </div>
        </Container>
      </Navbar>
    </>
  );
};
