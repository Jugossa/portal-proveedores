const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// ✅ Función para convertir fecha de Excel a formato legible
function convertirFechaExcel(valor) {
  const baseDate = new Date(1899, 11, 30);
  const dias = parseInt(valor);
  if (isNaN(dias)) return valor;
  const fecha = new Date(baseDate.getTime() + dias * 86400000);
  return fecha.toLocaleDateString("es-AR", {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

// ==========================================
// Mostrar el formulario de login (index.html)
// ==========================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ==========================================
// Subida y procesamiento de proveedores.xlsx
// ==========================================
app.post('/upload-proveedores', upload.single('file'), (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const proveedores = data.map(row => ({
      cui: String(row.cui || row.CUIT || row.Cuil || "").trim(),
      nombre: String(row.nombre || row.Nombre || "").trim(),
      password: String(row.password || row.clave || "abc123").trim()
    }));

    fs.writeFileSync(path.join(__dirname, 'proveedores.json'), JSON.stringify(proveedores, null, 2), 'utf8');

    res.send({ message: "✅ proveedores.json actualizado." });
  } catch (error) {
    res.status(500).send({ error: "❌ Error procesando proveedores.xlsx" });
  }
});

// ==========================================
// Subida y procesamiento de ProFru.xlsx
// ==========================================
app.post('/upload-profru', upload.single('file'), (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const entregas = data.map(row => ({
      "Nro Jugos": String(row["Nro Jugos"] || "").trim(),
      "Fecha": convertirFechaExcel(row.Fecha),
      "Remito": String(row.Remito || "").trim(),
      "CantBins": Number(row.CantBins || 0),
      "ProveedorT": String(row.ProveedorT || "").trim(),
      "Origen": String(row.Origen || "").trim(),
      "Especie": String(row.Especie || "").trim(),
      "NomVariedad": String(row.NomVariedad || "").trim(),
      "KgsD": Number(row.KgsD || 0),
      "Certificado": String(row.Certificado || "").trim(),
      "pagado": String(row.pagado || "").toLowerCase().trim() === "si"
    }));

    fs.writeFileSync(path.join(__dirname, 'profru.json'), JSON.stringify(entregas, null, 2), 'utf8');

    res.send({ message: "✅ profru.json actualizado." });
  } catch (error) {
    res.status(500).send({ error: "❌ Error procesando ProFru.xlsx" });
  }
});

// ==========================================
// Login: verifica cui y password
// ==========================================
app.post("/login", (req, res) => {
  const { cui, password } = req.body;

  if (!cui || !password) {
    return res.status(400).send({ error: "Faltan datos de login" });
  }

  const proveedoresPath = path.join(__dirname, "proveedores.json");
  const profruPath = path.join(__dirname, "profru.json");

  if (!fs.existsSync(proveedoresPath) || !fs.existsSync(profruPath)) {
    return res.status(500).send({ error: "Faltan archivos de datos" });
  }

  const proveedores = JSON.parse(fs.readFileSync(proveedoresPath, "utf8"));
  const entregas = JSON.parse(fs.readFileSync(profruPath, "utf8"));

  const proveedor = proveedores.find(p =>
    p.cui.replace(/\D/g, '') === cui.replace(/\D/g, '') &&
    p.password === password
  );

  if (!proveedor) {
    return res.status(401).send({ error: "Usuario o contraseña inválidos" });
  }

  const entregasFiltradas = entregas.filter(e =>
    e.ProveedorT?.toLowerCase() === proveedor.nombre.toLowerCase()
  );

  res.send(entregasFiltradas);
});

// ==========================================
// Iniciar servidor
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor funcionando en http://localhost:${PORT}`);
});
