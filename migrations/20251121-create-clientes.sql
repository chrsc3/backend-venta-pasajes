-- Migración adaptada a MySQL (antes tenía sintaxis de SQL Server)
-- Si ya existe una tabla creada incorrectamente, ejecutar: DROP TABLE clientes;
CREATE TABLE IF NOT EXISTS clientes (
  idCliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  ci VARCHAR(50) NOT NULL,
  telefono VARCHAR(50),
  direccion VARCHAR(150),
  email VARCHAR(120),
  estado VARCHAR(20) NOT NULL DEFAULT 'activo'
);
