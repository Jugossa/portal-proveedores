import { useState } from "react";
import proveedores from "./proveedores.json";
import FrutaPanel from "./FrutaPanel";

export default function Login() {
  const [cui, setCui] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [proveedor, setProveedor] = useState(null);

  const handleLogin = () => {
    const user = proveedores.find(p => p.cui === cui && p.password === password);
    if (user) {
      setProveedor(user);
      setError("");
    } else {
      setError("CUIT o contraseña incorrectos");
    }
  };

  if (proveedor) {
    return (
      <div>
        <h2 style={{ padding: "1rem", fontFamily: "Arial" }}>
          Bienvenido, {proveedor.nombre}
        </h2>
        <FrutaPanel nombre={proveedor.nombre} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial"
    }}>
      <div style={{
        border: "1px solid #ccc",
        padding: "2rem",
        borderRadius: "8px",
        width: "300px"
      }}>
        <h1 style={{ textAlign: "center" }}>Portal de Proveedores de Jugos</h1>

        <label>CUIT</label>
        <input
          type="text"
          value={cui}
          onChange={(e) => setCui(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "1rem" }}
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "1rem" }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "8px",
            backgroundColor: "#2d7",
            color: "white",
            border: "none"
          }}
        >
          Ingresar
        </button>
      </div>
    </div>
  );
}
