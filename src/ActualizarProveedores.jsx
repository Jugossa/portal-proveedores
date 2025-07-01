import { useState } from "react";
import axios from "axios";

export default function ActualizarProveedores() {
  const [file, setFile] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMensaje("Seleccioná un archivo Excel primero.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:3001/upload-proveedores", formData);
      setMensaje(res.data.message);
    } catch (err) {
      console.error(err);
      setMensaje("Error al subir el archivo.");
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h3>Actualizar archivo de proveedores</h3>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        onClick={handleUpload}
        style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
      >
        Actualizar Proveedores
      </button>
      {mensaje && <p style={{ marginTop: "1rem" }}>{mensaje}</p>}
    </div>
  );
}
