-- Migration: Create table pagos
-- Fecha: 2025-11-06
USE testchaqueñodb;
CREATE TABLE IF NOT EXISTS `pagos` (
  `idPago` INT NOT NULL AUTO_INCREMENT,
  `monto` DECIMAL(10,2) NOT NULL,
  `metodo` VARCHAR(255) NOT NULL,
  `fecha` DATETIME NOT NULL,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'activo',
  `Boletos_idBoleto` INT NOT NULL,
  `Usuarios_idUsuario` INT NULL,
  PRIMARY KEY (`idPago`),
  INDEX `idx_pagos_boletos` (`Boletos_idBoleto`),
  INDEX `idx_pagos_usuarios` (`Usuarios_idUsuario`),
  CONSTRAINT `fk_pagos_boletos` FOREIGN KEY (`Boletos_idBoleto`) REFERENCES `boletos` (`idBoleto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pagos_usuarios` FOREIGN KEY (`Usuarios_idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
