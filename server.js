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
  res.send("Servidor funcionando. Endpoints: /upload-proveedores, /upload-profru, /profru (requiere login)");
});

// =================== SUBIR proveedores.xlsx ===================
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

// =================== SUBIR ProFru.xlsx ===================
app.post('/upload-profru', upload.single('file'), (req, res) => {
  try {
    console.log("🔁 Recibiendo archivo ProFru...");
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

// =================== GET /profru (Autenticado + Filtrado) ===================
app.get('/profru', (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Basic ")) {
      res.set('WWW-Authenticate', 'Basic realm="Acceso a Entregas"');
      return res.status(401).send("Autenticación requerida");
    }

    const base64 = auth.split(" ")[1];
    const [usuarioCui, password] = Buffer.from(base64, 'base64').toString().split(":");

    const proveedoresPath = path.join(__dirname, 'proveedores.json');
    if (!fs.existsSync(proveedoresPath)) {
      return res.status(500).send({ error: "No existe proveedores.json" });
    }

    const proveedores = JSON.parse(fs.readFileSync(proveedoresPath, 'utf8'));

    const autorizado = proveedores.find(p =>
      String(p.cui).replace(/\D/g, '') === usuarioCui.replace(/\D/g, '') &&
      p.password === password
    );

    if (!autorizado) {
      res.set('WWW-Authenticate', 'Basic realm="Acceso a Entregas"');
      return res.status(401).send("Usuario o contraseña inválidos");
    }

    const profruPath = path.join(__dirname, 'profru.json');
    if (!fs.existsSync(profruPath)) {
      return res.status(404).send({ error: "profru.json no existe" });
    }

    const data = JSON.parse(fs.readFileSync(profruPath, 'utf8'));

    const entregasDelProveedor = data.filter(entry =>
      entry.ProveedorT?.toLowerCase() === autorizado.nombre.toLowerCase()
    );

    res.json(entregasDelProveedor);

  } catch (error) {
    console.error("❌ Error en /profru:", error.message);
    res.status(500).send({ error: error.message });
  }
});

// =================== START SERVER ===================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
