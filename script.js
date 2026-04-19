function cleanBinary(str) {
  return str.replace(/\s+/g, "");
}

function formatBinary(str) {
  return str.match(/.{1,4}/g)?.join(" ") || str;
}

function intFromDecimal() {
  const value = Number(document.getElementById("intDecimal").value);

  if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) {
    alert("Enter a valid 32-bit signed integer.");
    return;
  }

  const binary = (value >>> 0).toString(2).padStart(32, "0");

  document.getElementById("intOutDecimal").textContent = value;
  document.getElementById("intOutBinary").textContent = formatBinary(binary);
  document.getElementById("intBinary").value = binary;
}

function intFromBinary() {
  const binary = cleanBinary(document.getElementById("intBinary").value);

  if (!/^[01]{32}$/.test(binary)) {
    alert("Enter exactly 32 bits.");
    return;
  }

  const unsigned = parseInt(binary, 2);
  const signed = unsigned > 2147483647 ? unsigned - 4294967296 : unsigned;

  document.getElementById("intOutDecimal").textContent = signed;
  document.getElementById("intOutBinary").textContent = formatBinary(binary);
  document.getElementById("intDecimal").value = signed;
}

function floatFromDecimal() {
  const value = Number(document.getElementById("floatDecimal").value);

  if (Number.isNaN(value)) {
    alert("Enter a valid decimal number.");
    return;
  }

  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);

  view.setFloat32(0, value);
  const bits = view.getUint32(0).toString(2).padStart(32, "0");

  document.getElementById("floatOutDecimal").textContent = view.getFloat32(0);
  document.getElementById("floatOutBinary").textContent = formatBinary(bits);
  document.getElementById("floatBinary").value = bits;
}

function floatFromBinary() {
  const binary = cleanBinary(document.getElementById("floatBinary").value);

  if (!/^[01]{32}$/.test(binary)) {
    alert("Enter exactly 32 bits.");
    return;
  }

  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);

  view.setUint32(0, parseInt(binary, 2));

  document.getElementById("floatOutDecimal").textContent = view.getFloat32(0);
  document.getElementById("floatOutBinary").textContent = formatBinary(binary);
  document.getElementById("floatDecimal").value = view.getFloat32(0);
}

function clearInt() {
  document.getElementById("intDecimal").value = "";
  document.getElementById("intBinary").value = "";
  document.getElementById("intOutDecimal").textContent = "—";
  document.getElementById("intOutBinary").textContent = "—";
}

function clearFloat() {
  document.getElementById("floatDecimal").value = "";
  document.getElementById("floatBinary").value = "";
  document.getElementById("floatOutDecimal").textContent = "—";
  document.getElementById("floatOutBinary").textContent = "—";
}

document.getElementById("intDecToBin").addEventListener("click", intFromDecimal);
document.getElementById("intBinToDec").addEventListener("click", intFromBinary);
document.getElementById("intClear").addEventListener("click", clearInt);

document.getElementById("floatDecToBin").addEventListener("click", floatFromDecimal);
document.getElementById("floatBinToDec").addEventListener("click", floatFromBinary);
document.getElementById("floatClear").addEventListener("click", clearFloat);