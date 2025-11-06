#!/usr/bin/env node
/*
  Script ligero para aplicar migrations SQL usando la conexión Sequelize del proyecto.
  Usage:
    node scripts/apply-migrations.js        # muestra el SQL (dry-run)
    node scripts/apply-migrations.js --apply   # ejecuta la SQL contra la DB
*/
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const apply = argv.includes("--apply");

const migrationPath = path.join(
  __dirname,
  "..",
  "migrations",
  "20251106-create-pagos.sql"
);

if (!fs.existsSync(migrationPath)) {
  console.error("Archivo de migración no encontrado:", migrationPath);
  process.exit(1);
}

const sql = fs.readFileSync(migrationPath, { encoding: "utf8" });

console.log("--- Migration file:", migrationPath);
console.log("--- Preview (first 400 chars) ---\n");
console.log(sql.slice(0, 400));
console.log("\n--- End preview ---\n");

if (!apply) {
  console.log("Modo dry-run. Para aplicar la migración ejecútalo con --apply");
  console.log("Ejemplo: node scripts/apply-migrations.js --apply");
  process.exit(0);
}

// Si llegamos aquí, queremos aplicar la migración.
console.log("Aplicando migración...");

// Importar sequelize desde utils/db
const { sequelize } = require("../utils/db");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a la base de datos. Ejecutando SQL...");
    // Ejecutar como una query única. Si el SQL contiene múltiples statements separados por ;
    // mysql2/sequelize por defecto no permite múltiples statements a menos que se habilite.
    // Para evitar problemas, dividimos por ";\n" y ejecutamos por separado ignorando líneas vacías.
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      console.log("Ejecutando statement (preview):", stmt.slice(0, 120));
      await sequelize.query(stmt);
    }
    console.log("Migración aplicada correctamente.");
    process.exit(0);
  } catch (err) {
    console.error("Error aplicando migración:", err.message || err);
    process.exit(1);
  }
})();
