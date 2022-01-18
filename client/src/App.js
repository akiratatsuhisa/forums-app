import "./App.css";
import { Routes, Route } from "react-router-dom";
import { BaseLayout } from "./Component/BaseLayout";
import { Home } from "./Views/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BaseLayout></BaseLayout>}>
        <Route index element={<Home></Home>}></Route>
      </Route>
    </Routes>
  );
}

export default App;
