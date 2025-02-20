import { useLocation } from "react-router-dom";

function Test() {
  const location = useLocation();

  return (
    <div>
      현재 URL: {window.location.origin + location.pathname + location.search}
    </div>
  );
}

export default Test;
