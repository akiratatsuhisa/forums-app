import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { BaseNavigation } from "./BaseNavigation";

export const BaseLayout = () => {
  return (
    <>
      <BaseNavigation></BaseNavigation>
      <Container className="pt-3">
        <Outlet></Outlet>
      </Container>
    </>
  );
};
