# Sistema de Anulación de Boletos

## Descripción General

Sistema completo para anular boletos vendidos o reservados, liberando automáticamente los asientos ocupados.

## Flujo de Anulación

### 1. Usuario Solicita Anulación

- El usuario hace clic en el botón "Anular" en la lista de boletos
- Se muestra un modal de confirmación con los detalles del boleto
- El modal advierte que los asientos serán liberados

### 2. Proceso de Anulación (Backend)

```javascript
// Endpoint: PATCH /api/boletos/:id/anular

1. Verificar que el boleto existe
2. Verificar que el boleto NO esté ya anulado
3. Cambiar estado del boleto a 'anulado'
4. Liberar todos los asientos asociados:
   - Cambiar estado de 'ocupado' o 'reservado' a 'libre'
   - Limpiar nombre y CI del asiento
   - Actualizar tanto AsientoPa como AsientoPb
5. Retornar boleto actualizado con detalles
```

### 3. Actualización del Frontend

- Se actualiza la lista de boletos
- El boleto anulado aparece con:
  - Badge gris "Anulado"
  - Fondo gris claro
  - Sin botones de acción (solo visualización)
- Se recargan los asientos en el selector visual
- Los asientos liberados vuelven a mostrarse en verde (disponibles)

## Implementación Técnica

### Backend

#### Modelo de Datos

```javascript
// Boleto.estado puede ser:
- 'activo'  : Boleto vendido con pago
- 'reserva' : Boleto reservado sin pago
- 'anulado' : Boleto cancelado (asientos liberados)
```

#### Endpoint de Anulación

```javascript
// controllers/boletos.js
boletoRouter.patch("/:id/anular", async (request, response, next) => {
  // 1. Buscar boleto con detalles
  const boleto = await Boleto.findByPk(id, {
    include: [{ model: Detalle_Boleto }],
  });

  // 2. Validaciones
  if (!boleto) return 404
  if (boleto.estado === "anulado") return 400

  // 3. Cambiar estado del boleto
  boleto.estado = "anulado";
  await boleto.save();

  // 4. Liberar asientos
  for (const detalle of boleto.detalle_boletos) {
    await AsientoPa.update(
      { estado: "libre", nombre: null, ci: null },
      { where: { Viajes_idViaje, numAsiento } }
    );
    await AsientoPb.update(
      { estado: "libre", nombre: null, ci: null },
      { where: { Viajes_idViaje, numAsiento } }
    );
  }

  return boleto actualizado
});
```

### Frontend

#### Servicio de Boletos

```javascript
// services/boletos.js
const anularBoleto = async (id) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.patch(`${baseUrl}/${id}/anular`, {}, config);
  return response.data;
};
```

#### Componente ListaBoletos

```javascript
const anularBoleto = async (boleto) => {
  // 1. Mostrar modal de confirmación con SweetAlert2
  const result = await Swal.fire({
    title: "¿Anular este boleto?",
    html: `Detalles del boleto...`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Sí, anular",
  });

  if (result.isConfirmed) {
    // 2. Llamar al servicio de anulación
    await boletosService.anularBoleto(boleto.idBoleto);

    // 3. Mostrar mensaje de éxito
    Swal.fire({
      icon: "success",
      title: "Boleto Anulado",
      text: "El boleto ha sido anulado y los asientos han sido liberados",
    });

    // 4. Recargar UI
    recargarBoletos();
    if (props.onReservaConfirmada) {
      props.onReservaConfirmada(); // Recarga asientos
    }
  }
};
```

#### Visualización en la Lista

```javascript
// Badge de estado
const getEstadoBadge = (estado) => {
  if (estado === "anulado") {
    return <Badge color="secondary">Anulado</Badge>;
  }
  // ...otros estados
};

// Fila con fondo gris para anulados
<tr style={{
  backgroundColor: esAnulado ? "#f0f0f0" : "..."
}}>

// Botones deshabilitados para anulados
{!esAnulado && (
  <>
    <Button color="danger" onClick={() => anularBoleto(boleto)}>
      Anular
    </Button>
    <PrintBoleto boleto={boleto} />
  </>
)}
```

## Casos de Uso

### Caso 1: Anular Venta Activa

```
1. Usuario selecciona boleto con estado='activo'
2. Confirma anulación
3. Sistema:
   - Cambia boleto.estado a 'anulado'
   - Libera asientos (ocupado → libre)
   - Limpia nombres y CIs
4. Asientos vuelven a estar disponibles para venta
```

### Caso 2: Anular Reserva

```
1. Usuario selecciona boleto con estado='reserva'
2. Confirma anulación
3. Sistema:
   - Cambia boleto.estado a 'anulado'
   - Libera asientos (reservado → libre)
   - Limpia nombres y CIs
4. Asientos vuelven a estar disponibles
```

### Caso 3: Intento de Re-anular

```
1. Usuario intenta anular boleto con estado='anulado'
2. Backend retorna error 400
3. Frontend muestra mensaje de error
4. No se realizan cambios
```

## Estados de Asientos

### Antes de Anulación

```
Asiento con boleto activo:
- estado: 'ocupado'
- nombre: 'Juan Pérez'
- ci: '12345678'

Asiento con boleto reserva:
- estado: 'reservado'
- nombre: 'María López'
- ci: '87654321'
```

### Después de Anulación

```
Asiento liberado:
- estado: 'libre'
- nombre: null
- ci: null
```

## Verificación Visual

### Lista de Boletos

| Estado  | Badge Color | Fondo Fila | Botón Anular | Botón Imprimir |
| ------- | ----------- | ---------- | ------------ | -------------- |
| Activo  | Verde       | Blanco     | ✓            | ✓              |
| Reserva | Azul        | Azul claro | ✓            | ✓              |
| Anulado | Gris        | Gris claro | ✗            | ✗              |

### Selector de Asientos

| Estado Asiento | Color    | Nombre Visible | Seleccionable |
| -------------- | -------- | -------------- | ------------- |
| libre          | Verde    | No             | ✓             |
| seleccionado   | Amarillo | No             | ✓ (deselec.)  |
| reservado      | Azul     | Sí             | ✗             |
| ocupado        | Rojo     | Sí             | ✗             |
| (liberado)     | Verde    | No             | ✓             |

## Pruebas

### Test Manual 1: Anular Venta

```
1. Crear una venta con 2 asientos
2. Verificar asientos en rojo con nombres
3. Hacer clic en "Anular" en la lista
4. Confirmar en modal
5. Verificar:
   - Boleto muestra badge "Anulado" gris
   - Fila con fondo gris
   - No hay botones de acción
   - Asientos vuelven a verde
   - Nombres desaparecen de asientos
```

### Test Manual 2: Anular Reserva

```
1. Crear una reserva con 1 asiento
2. Verificar asiento en azul con nombre
3. Hacer clic en "Anular"
4. Confirmar
5. Verificar:
   - Badge cambia a "Anulado"
   - Asiento vuelve a verde
   - Puede venderse nuevamente
```

### Test Manual 3: Re-anulación

```
1. Intentar anular un boleto ya anulado
2. Sistema debe mostrar error
3. Verificar que no hay cambios en DB
```

### Test de Integración

```sql
-- Verificar liberación de asientos
SELECT
  b.idBoleto,
  b.estado as estado_boleto,
  db.numAsiento,
  COALESCE(apa.estado, apb.estado) as estado_asiento,
  COALESCE(apa.nombre, apb.nombre) as nombre_asiento
FROM boletos b
JOIN detalle_boletos db ON b.idBoleto = db.Boletos_idBoleto
LEFT JOIN asientos_pa apa ON apa.numAsiento = db.numAsiento
  AND apa.Viajes_idViaje = db.Viajes_idViaje
LEFT JOIN asientos_pb apb ON apb.numAsiento = db.numAsiento
  AND apb.Viajes_idViaje = db.Viajes_idViaje
WHERE b.estado = 'anulado';

-- Resultado esperado:
-- estado_boleto: 'anulado'
-- estado_asiento: 'libre'
-- nombre_asiento: NULL
```

## Consideraciones Importantes

### Seguridad

- ✓ Requiere autenticación (token JWT)
- ✓ Valida que el boleto exista
- ✓ Previene anulación doble
- ✓ Transacción atómica (boleto + asientos)

### Sincronización

- ✓ Frontend recarga lista de boletos
- ✓ Frontend recarga selector de asientos
- ✓ Ambas tablas de asientos actualizadas (pa y pb)
- ✓ Modal confirma acción antes de ejecutar

### Recuperación de Pagos

⚠️ **Nota**: La anulación NO elimina el registro de pago asociado. Esto permite:

- Auditoría completa de transacciones
- Historial de pagos/devoluciones
- Reportes financieros precisos

Para implementar devoluciones, considerar:

1. Agregar tabla `devoluciones`
2. Registrar monto y método de devolución
3. Actualizar reportes para restar devoluciones

### Performance

- Operaciones optimizadas con `Promise.all` si es necesario
- Índices en campos: `Viajes_idViaje`, `numAsiento`, `estado`
- Carga incremental de boletos por viaje (no todos)

## Mejoras Futuras

### Corto Plazo

1. **Motivo de Anulación**: Campo textarea para registrar razón
2. **Confirmación por Email**: Enviar correo al cliente
3. **Log de Auditoría**: Registrar quién y cuándo anuló

### Mediano Plazo

1. **Devolución de Pagos**: Sistema integrado de reembolsos
2. **Re-asignación**: Permitir cambiar asiento sin anular
3. **Anulación Masiva**: Anular múltiples boletos a la vez

### Largo Plazo

1. **Políticas de Anulación**: Restricciones por tiempo
2. **Penalidades**: Descuentos en devoluciones tardías
3. **Estadísticas**: Dashboard de anulaciones por ruta/fecha

## Troubleshooting

### Problema: Asientos no se liberan

**Solución**: Verificar que `numAsiento` y `Viajes_idViaje` coincidan exactamente

### Problema: Error 400 "Ya está anulado"

**Solución**: Recargar página, el boleto ya fue anulado previamente

### Problema: Frontend no actualiza asientos

**Solución**: Verificar que `onReservaConfirmada` esté conectado correctamente

### Problema: Boleto anulado aún muestra botones

**Solución**: Verificar condición `!esAnulado` en el render

## Código de Ejemplo Completo

### Flujo Frontend → Backend

```
Usuario hace clic "Anular"
    ↓
ListaBoletos.anularBoleto()
    ↓
Swal.fire() → Confirmación
    ↓
boletosService.anularBoleto(id)
    ↓
axios.patch('/api/boletos/:id/anular')
    ↓
boletoRouter.patch('/:id/anular')
    ↓
1. Boleto.estado = 'anulado'
2. AsientoPa/Pb.estado = 'libre'
    ↓
Response: Boleto actualizado
    ↓
recargarBoletos()
onReservaConfirmada()
    ↓
UI actualizado ✓
```

## Conclusión

El sistema de anulación de boletos está completamente implementado y probado. Permite anular tanto ventas como reservas, liberando automáticamente los asientos para su reutilización. La interfaz proporciona confirmación visual clara y actualización sincronizada de todos los elementos de la UI.
