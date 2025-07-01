const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

// =================== RAÍZ ===================
app.get("/", (req, res) => {
  res.send("Servidor funcionando. Endpoints: /upload-proveedores, /upload-profru, /profru");
});

// =================== PROVEEDORES ===================
app.post('/upload-proveedores', upload.single('file'), (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const proveedores = data.map(row => ({
      cui: String(row.cui || row.CUIT || row.Cuil || "").trim(),
      nombre: String(row.nombre || row.Nombre || "").trim(),
      password: String(row.password || row.clave || "abc123").trim()
    }));

    fs.writeFileSync(path.join(__dirname, 'proveedores.json'), JSON.stringify(proveedores, null, 2), 'utf8');

    console.log("✅ proveedores.json actualizado con", proveedores.length, "registros.");
    res.status(200).send({ message: "Archivo proveedores.json actualizado correctamente." });
  } catch (error) {
    console.error("❌ Error al procesar proveedores:", error.message);
    res.status(500).send({ error: error.message });
  }
});

// =================== FRUTA (ProFru.xlsx) ===================
app.post('/upload-profru', upload.single('file'), (req, res) => {
  try {
    console.log("🔁 Recibiendo archivo profru...");
    console.log("📦 Archivo recibido:", req.file?.originalname || "No llegó nada");

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log("📊 Filas leídas del Excel:", data.length);

    const entregas = data.map(row => ({
      "Nro Jugos": String(row["Nro Jugos"] || "").trim(),
      "Fecha": String(row.Fecha || "").split(" ")[0],
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

    console.log("✅ profru.json actualizado con", entregas.length, "registros.");
    res.status(200).send({ message: "Archivo profru.json actualizado correctamente." });
  } catch (error) {
    console.error("❌ Error al procesar ProFru:", error.message);
    res.status(500).send({ error: error.message });
  }
});

// =================== VER profru.json ===================
app.get('/profru', (req, res) => {
  try {
    const jsonPath = path.join(__dirname, 'profru.json');
    if (!fs.existsSync(jsonPath)) {
      return res.status(404).send({ error: "El archivo profru.json no existe aún." });
    }
    const data = fs.readFileSync(jsonPath, 'utf8');
    res.type('application/json').send(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// =================== PORT DINÁMICO ===================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
