import { useState } from "react";
import fruta from "./profru.json";

export default function FrutaPanel({ nombre }) {
  const [filtroEspecie, setFiltroEspecie] = useState("Todos");
  const [filtroPago, setFiltroPago] = useState("Todos");

  // Filtrar por nombre exacto del proveedor
  const misEntregas = fruta.filter(e => e.ProveedorT === nombre);

  // Log para verificar coincidencia
  console.log("PROVEEDOR LOGUEADO:", nombre);
  console.log("ENTREGAS ENCONTRADAS:", misEntregas);

  const filtradas = misEntregas.filter(e => {
    return (
      (filtroEspecie === "Todos" || e.Especie === filtroEspecie) &&
      (filtroPago === "Todos" || (filtroPago === "Pagado" ? e.pagado : !e.pagado))
    );
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Mis Entregas de Fruta</h2>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <select value={filtroEspecie} onChange={e => setFiltroEspecie(e.target.value)}>
          <option value="Todos">Todas las especies</option>
          <option value="pera">Pera</option>
          <option value="manza">Manzana</option>
        </select>

        <select value={filtroPago} onChange={e => setFiltroPago(e.target.value)}>
          <option value="Todos">Todos los estados</option>
          <option value="Pagado">Pagado</option>
          <option value="Pendiente">Pendiente</option>
        </select>
      </div>

      <table border="1" cellPadding="8">
        <thead style={{ backgroundColor: "#eee" }}>
          <tr>
            <th>Nro Jugos</th>
            <th>Fecha</th>
            <th>Remito</th>
            <th>Origen</th>
            <th>Especie</th>
            <th>Variedad</th>
            <th>Kilos</th>
            <th>Bins</th>
            <th>Certificado</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filtradas.map((e, i) => (
            <tr key={i}>
              <td>{e["Nro Jugos"]}</td>
              <td>{e.Fecha}</td>
              <td>{e.Remito}</td>
              <td>{e.Origen}</td>
              <td>{e.Especie}</td>
              <td>{e.NomVariedad}</td>
              <td style={{ textAlign: "right" }}>{e.KgsD}</td>
              <td style={{ textAlign: "right" }}>{e.CantBins}</td>
              <td>{e.Certificado}</td>
              <td style={{ textAlign: "center" }}>{e.pagado ? "Pagado" : "Pendiente"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
