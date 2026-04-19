const sourceSelect = document.getElementById("sourceSelect");
const intInput = document.getElementById("intInput");
const floatInput = document.getElementById("floatInput");
const binaryInput = document.getElementById("binaryInput");
const hexInput = document.getElementById("hexInput");

const calculateBtn = document.getElementById("calculateBtn");
const clearButton = document.getElementById("clearAll");

const outInt = document.getElementById("outInt");
const outFloat = document.getElementById("outFloat");
const outBinary = document.getElementById("outBinary");
const outHex = document.getElementById("outHex");

const bitDisplay = document.getElementById("bitDisplay");
const signValue = document.getElementById("signValue");
const exponentValue = document.getElementById("exponentValue");
const mantissaValue = document.getElementById("mantissaValue");
const exponentDecimal = document.getElementById("exponentDecimal");
const unbiasedExponent = document.getElementById("unbiasedExponent");
const floatClass = document.getElementById("floatClass");

const copyBinaryBtn = document.getElementById("copyBinary");
const copyBinarySpacedBtn = document.getElementById("copyBinarySpaced");
const copyHexBtn = document.getElementById("copyHex");
const copyIntBtn = document.getElementById("copyInt");

let isUpdating = false;

function cleanBinary(str) {
  return str.replace(/[^01]/g, "").slice(0, 32);
}

function cleanHex(str) {
  return str.replace(/^0x/i, "").replace(/\s+/g, "").toUpperCase();
}

function formatBinary(str) {
  return str.match(/.{1,4}/g)?.join(" ") || str;
}

function formatHex(str) {
  return "0x" + str.toUpperCase();
}

function intToBinary(value) {
  return (value >>> 0).toString(2).padStart(32, "0");
}

function binaryToInt(binary) {
  const unsigned = parseInt(binary, 2);
  return unsigned > 2147483647 ? unsigned - 4294967296 : unsigned;
}

function floatToBinary(value) {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value);
  return view.getUint32(0).toString(2).padStart(32, "0");
}

function binaryToFloat(binary) {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, parseInt(binary, 2));
  return view.getFloat32(0);
}

function binaryToHex(binary) {
  return parseInt(binary, 2).toString(16).toUpperCase().padStart(8, "0");
}

function hexToBinary(hex) {
  return parseInt(hex, 16).toString(2).padStart(32, "0");
}

function classifyFloat(binary) {
  const sign = binary.slice(0, 1);
  const exponent = binary.slice(1, 9);
  const mantissa = binary.slice(9);

  const exponentInt = parseInt(exponent, 2);
  const mantissaAllZero = /^0+$/.test(mantissa);

  if (exponentInt === 255) {
    if (mantissaAllZero) {
      return sign === "1" ? "-Infinity" : "+Infinity";
    }
    return "NaN";
  }

  if (exponentInt === 0) {
    if (mantissaAllZero) {
      return sign === "1" ? "-0" : "+0";
    }
    return "Subnormal";
  }

  return "Normal";
}

function updateBitBreakdown(binary) {
  const sign = binary.slice(0, 1);
  const exponent = binary.slice(1, 9);
  const mantissa = binary.slice(9);
  const exponentInt = parseInt(exponent, 2);
  const classification = classifyFloat(binary);

  bitDisplay.innerHTML = `
    <span class="bit sign-bit">${sign}</span>
    <span class="bit exponent-bit">${exponent.slice(0, 4)}</span>
    <span class="bit exponent-bit">${exponent.slice(4)}</span>
    <span class="bit mantissa-bit">${mantissa.slice(0, 4)}</span>
    <span class="bit mantissa-bit">${mantissa.slice(4, 8)}</span>
    <span class="bit mantissa-bit">${mantissa.slice(8, 12)}</span>
    <span class="bit mantissa-bit">${mantissa.slice(12, 16)}</span>
    <span class="bit mantissa-bit">${mantissa.slice(16, 20)}</span>
    <span class="bit mantissa-bit">${mantissa.slice(20)}</span>
  `;

  signValue.textContent = sign;
  exponentValue.textContent = exponent;
  mantissaValue.textContent = mantissa;
  exponentDecimal.textContent = exponentInt;

  if (exponentInt === 0) {
    unbiasedExponent.textContent = classification === "Subnormal" ? "-126 (subnormal)" : "—";
  } else if (exponentInt === 255) {
    unbiasedExponent.textContent = "—";
  } else {
    unbiasedExponent.textContent = exponentInt - 127;
  }

  floatClass.textContent = classification;
}

function clearBreakdown() {
  bitDisplay.innerHTML = `<span class="bits-empty">—</span>`;
  signValue.textContent = "—";
  exponentValue.textContent = "—";
  mantissaValue.textContent = "—";
  exponentDecimal.textContent = "—";
  unbiasedExponent.textContent = "—";
  floatClass.textContent = "—";
}

function updateAll(binary) {
  isUpdating = true;

  const intVal = binaryToInt(binary);
  const floatVal = binaryToFloat(binary);
  const hexVal = binaryToHex(binary);

  intInput.value = intVal;
  floatInput.value = Number.isNaN(floatVal) ? "NaN" : String(floatVal);
  binaryInput.value = formatBinary(binary);
  hexInput.value = hexVal;

  outInt.textContent = intVal;
  outFloat.textContent = Number.isNaN(floatVal) ? "NaN" : String(floatVal);
  outBinary.textContent = formatBinary(binary);
  outHex.textContent = formatHex(hexVal);

  updateBitBreakdown(binary);

  isUpdating = false;
}

function clearAll() {
  isUpdating = true;

  intInput.value = "";
  floatInput.value = "";
  binaryInput.value = "";
  hexInput.value = "";
  sourceSelect.value = "int";

  outInt.textContent = "—";
  outFloat.textContent = "—";
  outBinary.textContent = "—";
  outHex.textContent = "—";

  clearBreakdown();

  isUpdating = false;
}

function formatBinaryInputWithCursor(inputElement) {
  const originalValue = inputElement.value;
  const originalStart = inputElement.selectionStart ?? originalValue.length;
  const originalEnd = inputElement.selectionEnd ?? originalValue.length;

  const cleanAll = cleanBinary(originalValue);
  const cleanBeforeStart = cleanBinary(originalValue.slice(0, originalStart));
  const cleanBeforeEnd = cleanBinary(originalValue.slice(0, originalEnd));

  const formatted = formatBinary(cleanAll);
  const newStart = formatBinary(cleanBeforeStart).length;
  const newEnd = formatBinary(cleanBeforeEnd).length;

  inputElement.value = formatted;
  inputElement.setSelectionRange(newStart, newEnd);

  return cleanAll;
}

function getSelectedBinaryCount() {
  const start = binaryInput.selectionStart ?? 0;
  const end = binaryInput.selectionEnd ?? 0;
  const selectedText = binaryInput.value.slice(start, end);
  return (selectedText.match(/[01]/g) || []).length;
}

function handleBinaryBeforeInput(e) {
  if (isUpdating) return;

  if (
    e.inputType !== "insertText" &&
    e.inputType !== "insertFromPaste" &&
    e.inputType !== "insertCompositionText"
  ) {
    return;
  }

  const incoming = (e.data ?? "").replace(/[^01]/g, "");
  if (!incoming) return;

  const currentBits = cleanBinary(binaryInput.value).length;
  const selectedBits = getSelectedBinaryCount();
  const allowed = 32 - (currentBits - selectedBits);

  if (allowed <= 0) {
    e.preventDefault();
    return;
  }

  if (incoming.length > allowed) {
    e.preventDefault();

    const start = binaryInput.selectionStart ?? 0;
    const end = binaryInput.selectionEnd ?? 0;
    const trimmed = incoming.slice(0, allowed);

    const newValue =
      binaryInput.value.slice(0, start) +
      trimmed +
      binaryInput.value.slice(end);

    binaryInput.value = newValue;
    handleBinaryInput();
  }
}

function handleBinaryInput() {
  if (isUpdating) return;

  isUpdating = true;
  formatBinaryInputWithCursor(binaryInput);
  isUpdating = false;
}

function calculate() {
  const source = sourceSelect.value;

  if (source === "binary") {
    const binaryRaw = cleanBinary(binaryInput.value);

    if (!/^[01]{32}$/.test(binaryRaw)) {
      alert("Binary input must contain exactly 32 bits.");
      return;
    }

    updateAll(binaryRaw);
    return;
  }

  if (source === "hex") {
    const hexRaw = cleanHex(hexInput.value.trim());

    if (!/^[0-9A-F]{8}$/.test(hexRaw)) {
      alert("Hex input must contain exactly 8 hex digits.");
      return;
    }

    updateAll(hexToBinary(hexRaw));
    return;
  }

  if (source === "int") {
    const intRaw = intInput.value.trim();
    const intVal = Number(intRaw);

    if (!Number.isInteger(intVal) || intVal < -2147483648 || intVal > 2147483647) {
      alert("Enter a valid 32-bit signed integer.");
      return;
    }

    updateAll(intToBinary(intVal));
    return;
  }

  if (source === "float") {
    const floatRaw = floatInput.value.trim();
    const floatVal = Number(floatRaw);

    if (Number.isNaN(floatVal)) {
      alert("Enter a valid Float32 decimal value.");
      return;
    }

    updateAll(floatToBinary(floatVal));
  }
}

function flashButton(button, message = "Copied!") {
  const original = button.dataset.label || button.textContent;
  button.textContent = message;

  setTimeout(() => {
    button.textContent = original;
  }, 1000);
}

function copyText(text, button) {
  if (!text || text === "—") return;

  navigator.clipboard.writeText(text)
    .then(() => flashButton(button))
    .catch(() => alert("Copy failed"));
}

copyBinaryBtn.addEventListener("click", () => {
  copyText(cleanBinary(binaryInput.value), copyBinaryBtn);
});

copyBinarySpacedBtn.addEventListener("click", () => {
  copyText(binaryInput.value.trim(), copyBinarySpacedBtn);
});

copyHexBtn.addEventListener("click", () => {
  copyText(hexInput.value.trim() || outHex.textContent.replace(/^0x/i, ""), copyHexBtn);
});

copyIntBtn.addEventListener("click", () => {
  copyText(intInput.value.trim() || outInt.textContent, copyIntBtn);
});

binaryInput.addEventListener("beforeinput", handleBinaryBeforeInput);
binaryInput.addEventListener("input", handleBinaryInput);

calculateBtn.addEventListener("click", calculate);
clearButton.addEventListener("click", clearAll);

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    const active = document.activeElement;
    const isTextarea = active && active.tagName === "TEXTAREA";

    if (!isTextarea) {
      e.preventDefault();
      calculate();
    }
  }
});