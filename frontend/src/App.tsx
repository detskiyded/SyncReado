import { request } from "./utils/api";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    request("/api/health")
      .then((data) => console.log("Response: ", data))
      .catch((error) => console.log("Error: ", error));
  }, []);

  return <></>;
}

export default App;
