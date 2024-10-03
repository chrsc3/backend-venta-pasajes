function parseAsientos(asientosStr) {
  const asientosArray = asientosStr.split(",").map(Number);
  return asientosArray.map((asiento, index) => ({
    id: index,
    numAsiento: asiento,
  }));
}
function stringifyAsientos(asientos) {
  return asientos.map((asiento) => asiento.numAsiento).join(",");
}

module.exports = { parseAsientos, stringifyAsientos };
