# Filtro de Reportes: Solo Boletos Vendidos

## Descripción

Se han actualizado todos los endpoints de reportes y dashboard para que **solo cuenten boletos con estado 'activo'** (vendidos), excluyendo reservas y anulados.

## Cambios Realizados

### 1. Controllers/reportes.js

#### GET /api/reportes/viaje/:idviaje

**Antes:**

```javascript
const boletos = await Boleto.findAll({
  where: { idBoleto: uniqueBoletos },
  // ...
});
```

**Después:**

```javascript
const boletos = await Boleto.findAll({
  where: {
    idBoleto: uniqueBoletos,
    estado: "activo", // Solo boletos vendidos
  },
  // ...
});
```

#### POST /api/reportes/fechas

**Antes:**

```javascript
const boletos = await Boleto.findAll({
  where: {
    fecha: { [Op.between]: [startDate, endDate] },
  },
  // ...
});
```

**Después:**

```javascript
const boletos = await Boleto.findAll({
  where: {
    fecha: { [Op.between]: [startDate, endDate] },
    estado: "activo", // Solo boletos vendidos
  },
  // ...
});
```

#### POST /api/reportes/viajes

**Antes:**

```javascript
const reporteViajes = viajes.map((viaje) => {
  const boletos = viaje.detalle_boletos || [];
  const totalVentas = boletos.reduce((sum, det) => {
    return sum + Number(det.boleto?.total || 0);
  }, 0);
  // ...
});
```

**Después:**

```javascript
const reporteViajes = viajes.map((viaje) => {
  const boletos = viaje.detalle_boletos || [];
  // Filtrar solo boletos con estado 'activo' (vendidos)
  const boletosVendidos = boletos.filter(
    (det) => det.boleto?.estado === "activo"
  );
  const totalVentas = boletosVendidos.reduce((sum, det) => {
    return sum + Number(det.boleto?.total || 0);
  }, 0);
  // ...
});
```

#### POST /api/reportes/usuarios

**Antes:**

```javascript
const usuarios = await Usuarios.findAll({
  include: [
    {
      model: Boleto,
      where: whereClause,
      required: false,
    },
  ],
});

const reporteUsuarios = usuarios.map((usuario) => {
  const boletos = usuario.boletos || [];
  const totalVentas = boletos.reduce((sum, boleto) => {
    return sum + Number(boleto.total || 0);
  }, 0);
  // ...
});
```

**Después:**

```javascript
const usuarios = await Usuarios.findAll({
  include: [
    {
      model: Boleto,
      where: {
        ...whereClause,
        estado: "activo", // Solo boletos vendidos
      },
      required: false,
    },
  ],
});

const reporteUsuarios = usuarios.map((usuario) => {
  const boletos = usuario.boletos || [];
  // Filtrar solo boletos con estado 'activo' (vendidos)
  const boletosVendidos = boletos.filter(
    (boleto) => boleto.estado === "activo"
  );
  const totalVentas = boletosVendidos.reduce((sum, boleto) => {
    return sum + Number(boleto.total || 0);
  }, 0);
  // ...
});
```

### 2. Controllers/dashboard.js

#### GET /api/dashboard/ventasDia

**Actualizado:** Agregado `estado: 'activo'` al filtro WHERE

#### GET /api/dashboard/ventasSemana

**Actualizado:** Agregado `estado: 'activo'` al filtro WHERE

#### GET /api/dashboard/ventasMes

**Actualizado:** Agregado `estado: 'activo'` al filtro WHERE

#### GET /api/dashboard/estadisticas

**Actualizado:** Agregado `estado: 'activo'` al filtro WHERE para ruta más popular

## Estados de Boletos

| Estado  | Incluido en Reportes | Descripción               |
| ------- | -------------------- | ------------------------- |
| activo  | ✅ SÍ                | Boleto vendido con pago   |
| reserva | ❌ NO                | Boleto reservado sin pago |
| anulado | ❌ NO                | Boleto cancelado          |

## Impacto en Reportes

### Reportes de Ventas por Fecha

- **Solo muestra boletos vendidos** (estado = 'activo')
- **Excluye reservas** sin pago confirmado
- **Excluye anulados** para no afectar totales

### Reportes de Ventas por Viaje

- **Total recaudado:** Solo de boletos vendidos
- **Asientos vendidos:** Solo asientos con boletos activos
- **Cantidad de boletos:** Solo boletos confirmados

### Reportes de Ventas por Usuario

- **Total ventas por usuario:** Solo boletos vendidos
- **Cantidad de boletos:** Solo boletos confirmados
- **Excluye usuarios** sin ventas activas en el período

### Dashboard - Estadísticas

- **Ventas del día:** Solo boletos activos de hoy
- **Ventas de la semana:** Solo boletos activos últimos 7 días
- **Ventas del mes:** Solo boletos activos del mes actual
- **Ruta más popular:** Calculada solo con boletos vendidos

## Consultas SQL Equivalentes

### Reportes por Fecha

```sql
SELECT * FROM boletos
WHERE fecha BETWEEN '2025-01-01' AND '2025-01-31'
  AND estado = 'activo';
```

### Reportes por Viaje

```sql
SELECT
  v.idViaje,
  v.origen,
  v.destino,
  COUNT(DISTINCT b.idBoleto) as cantidadBoletos,
  COUNT(db.idDetalle_Boleto) as asientosVendidos,
  SUM(b.total) as totalVentas
FROM viajes v
JOIN detalle_boletos db ON v.idViaje = db.Viajes_idViaje
JOIN boletos b ON db.Boletos_idBoleto = b.idBoleto
WHERE b.estado = 'activo'
GROUP BY v.idViaje;
```

### Reportes por Usuario

```sql
SELECT
  u.idUsuario,
  u.nombre,
  u.apellido,
  COUNT(b.idBoleto) as cantidadBoletos,
  SUM(b.total) as totalVentas
FROM usuarios u
LEFT JOIN boletos b ON u.idUsuario = b.Usuarios_idUsuario
WHERE b.estado = 'activo'
  OR b.idBoleto IS NULL
GROUP BY u.idUsuario;
```

## Validación y Pruebas

### Test Manual 1: Reporte con Solo Ventas

```
1. Crear 2 ventas (estado='activo') con total 100 Bs cada una
2. Crear 1 reserva (estado='reserva') con total 50 Bs
3. Generar reporte del día
4. Verificar que total sea 200 Bs (no 250 Bs)
```

### Test Manual 2: Reporte con Boleto Anulado

```
1. Crear 3 ventas con total 100 Bs cada una
2. Anular 1 boleto
3. Generar reporte del día
4. Verificar que total sea 200 Bs (2 boletos)
```

### Test Manual 3: Dashboard Ventas del Mes

```
1. Crear 5 ventas en el mes actual
2. Crear 2 reservas en el mes actual
3. Verificar dashboard muestre 5 boletos (no 7)
```

### Test SQL Directo

```sql
-- Verificar que reportes solo cuenten activos
SELECT
  estado,
  COUNT(*) as cantidad,
  SUM(total) as total
FROM boletos
WHERE fecha >= CURDATE()
GROUP BY estado;

-- Resultado esperado en reportes: solo fila con estado='activo'
```

## Casos de Uso

### Caso 1: Cliente reserva y luego confirma

```
1. Cliente reserva asiento → estado='reserva'
   - NO aparece en reportes
2. Cliente paga y confirma → estado='activo'
   - SÍ aparece en reportes
```

### Caso 2: Cliente compra y luego anula

```
1. Cliente compra boleto → estado='activo'
   - SÍ aparece en reportes
2. Se anula el boleto → estado='anulado'
   - NO aparece en reportes (se excluye retroactivamente)
```

### Caso 3: Reporte mensual mixto

```
Mes de Enero:
- 50 ventas (activo) = 5,000 Bs
- 10 reservas (reserva) = 1,000 Bs
- 5 anulados (anulado) = 500 Bs

Reporte mostrará:
- Total: 5,000 Bs
- Boletos: 50
- (No incluye reservas ni anulados)
```

## Beneficios

### 1. Reportes Precisos

- Los totales reflejan **ingresos reales** (solo ventas pagadas)
- No inflan estadísticas con reservas pendientes
- No incluyen boletos anulados

### 2. Contabilidad Correcta

- Auditoría simple: reporte = ingresos reales
- Evita discrepancias entre reportes y caja
- Facilita conciliación bancaria

### 3. Análisis de Desempeño

- Ventas por usuario: solo ventas confirmadas
- Rutas populares: basado en ventas reales
- Proyecciones: datos más confiables

### 4. Toma de Decisiones

- Dashboard muestra datos de ventas reales
- Identifica usuarios más efectivos (ventas vs reservas)
- Rutas con mejor conversión (ventas confirmadas)

## Consideraciones

### Reportes de Reservas

Si se necesita un reporte de reservas pendientes, crear endpoint separado:

```javascript
// POST /api/reportes/reservas
const reservas = await Boleto.findAll({
  where: {
    fecha: { [Op.between]: [startDate, endDate] },
    estado: "reserva",
  },
});
```

### Reportes de Anulaciones

Si se necesita un reporte de anulaciones, crear endpoint separado:

```javascript
// POST /api/reportes/anulaciones
const anulados = await Boleto.findAll({
  where: {
    fecha: { [Op.between]: [startDate, endDate] },
    estado: "anulado",
  },
});
```

### Reporte Completo (Todos los Estados)

Para análisis detallado, crear endpoint que incluya todos:

```javascript
// POST /api/reportes/completo
const boletos = await Boleto.findAll({
  where: {
    fecha: { [Op.between]: [startDate, endDate] },
  },
});

// Agrupar por estado en frontend
const porEstado = {
  activo: boletos.filter((b) => b.estado === "activo"),
  reserva: boletos.filter((b) => b.estado === "reserva"),
  anulado: boletos.filter((b) => b.estado === "anulado"),
};
```

## Troubleshooting

### Problema: Totales no coinciden con expectativas

**Solución:** Verificar que no haya reservas o anulados en el período

### Problema: Dashboard muestra 0 ventas pero hay boletos

**Solución:** Verificar que los boletos tengan estado='activo'

### Problema: Usuario aparece sin ventas en reporte

**Solución:** Usuario solo tiene reservas o anulados (no ventas activas)

## Conclusión

Todos los reportes y estadísticas del dashboard ahora **solo cuentan boletos vendidos** (estado = 'activo'), proporcionando datos precisos y confiables para:

- Reportes financieros
- Análisis de desempeño
- Toma de decisiones
- Auditoría y contabilidad

Las reservas y anulaciones se excluyen automáticamente, asegurando que los reportes reflejen los **ingresos reales** del sistema.
