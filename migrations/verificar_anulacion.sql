-- Script para verificar que la anulación funcionó correctamente

-- 1. Verificar estado del boleto
SELECT 
    idBoleto,
    nombre,
    ci,
    estado,
    total,
    fecha
FROM boletos 
WHERE idBoleto = 52;
-- Resultado esperado: estado = 'anulado'

-- 2. Verificar detalles del boleto
SELECT 
    idDetalle_Boleto,
    numAsiento,
    nombre,
    ci,
    Viajes_idViaje,
    Boletos_idBoleto
FROM detalle_boletos 
WHERE Boletos_idBoleto = 52;
-- Esto muestra qué asientos estaban asociados al boleto

-- 3. Verificar estado de asientos en planta alta (si aplica)
SELECT 
    apa.numAsiento,
    apa.estado,
    apa.nombre,
    apa.ci,
    apa.Viajes_idViaje
FROM asientos_pa apa
WHERE apa.numAsiento IN (
    SELECT numAsiento 
    FROM detalle_boletos 
    WHERE Boletos_idBoleto = 52
)
AND apa.Viajes_idViaje IN (
    SELECT Viajes_idViaje 
    FROM detalle_boletos 
    WHERE Boletos_idBoleto = 52
);
-- Resultado esperado: estado = 'libre', nombre = NULL, ci = NULL

-- 4. Verificar estado de asientos en planta baja (si aplica)
SELECT 
    apb.numAsiento,
    apb.estado,
    apb.nombre,
    apb.ci,
    apb.Viajes_idViaje
FROM asientos_pb apb
WHERE apb.numAsiento IN (
    SELECT numAsiento 
    FROM detalle_boletos 
    WHERE Boletos_idBoleto = 52
)
AND apb.Viajes_idViaje IN (
    SELECT Viajes_idViaje 
    FROM detalle_boletos 
    WHERE Boletos_idBoleto = 52
);
-- Resultado esperado: estado = 'libre', nombre = NULL, ci = NULL

-- 5. Verificar pago asociado (si existe)
SELECT 
    p.idPago,
    p.monto,
    p.metodo,
    p.fecha,
    p.Boletos_idBoleto
FROM pagos p
WHERE p.Boletos_idBoleto = 52;
-- Nota: El pago NO se elimina en la anulación (para auditoría)

-- 6. Verificar todos los boletos de un viaje específico (opcional)
-- SELECT 
--     b.idBoleto,
--     b.nombre,
--     b.estado,
--     db.numAsiento,
--     db.Viajes_idViaje
-- FROM boletos b
-- JOIN detalle_boletos db ON b.idBoleto = db.Boletos_idBoleto
-- WHERE db.Viajes_idViaje = [REEMPLAZAR_CON_ID_VIAJE]
-- ORDER BY b.estado, db.numAsiento;
