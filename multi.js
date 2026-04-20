const rowsContainer = document.getElementById("rowsContainer");
const addRowBtn = document.getElementById("addRowBtn");
const calculateAllBtn = document.getElementById("calculateAllBtn");
const clearRowsBtn = document.getElementById("clearRowsBtn");

const typeOptions = [
  { value: "int", label: "Int32" },
  { value: "float", label: "Float32" },
  { value: "binary", label: "Binary" },
  { value: "hex", label: "Hex" },
  { value: "octet", label: "Octet" }
];

function cleanBinary(str) {
  return str.replace(/[^01]/g, "").slice(0, 32);
}

function cleanHex(str) {
  return str.replace(/^0x/i, "").replace(/\s+/g, "").toUpperCase();
}

function cleanOctet(str) {
  return str.replace(/[^0-7]/g, "");
}

function formatBinaryPlain(str) {
  const groups = str.match(/.{1,4}/g) || [];
  const top = groups.slice(0, 4).join(" ");
  const bottom = groups.slice(4, 8).join(" ");
  return `${top}\n${bottom}`;
}

function formatOctet(str) {
  return str.match(/.{1,3}/g)?.join(" ") || str;
}

function intToBinary(value) {
  return (value >>> 0).toString(2).padStart(32, "0");
}

function floatToBinary(value) {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value);
  return view.getUint32(0).toString(2).padStart(32, "0");
}

function binaryToInt(binary) {
  const unsigned = parseInt(binary, 2);
  return unsigned > 2147483647 ? unsigned - 4294967296 : unsigned;
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

function binaryToOctet(binary) {
  return parseInt(binary, 2).toString(8).padStart(11, "0");
}

function octetToBinary(octet) {
  return parseInt(octet, 8).toString(2).padStart(32, "0");
}

function sourceToBinary(type, rawValue) {
  if (type === "int") {
    const value = Number(rawValue.trim());
    if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) {
      throw new Error("Invalid Int32");
    }
    return intToBinary(value);
  }

  if (type === "float") {
    const value = Number(rawValue.trim());
    if (Number.isNaN(value)) {
      throw new Error("Invalid Float32");
    }
    return floatToBinary(value);
  }

  if (type === "binary") {
    const value = cleanBinary(rawValue);
    if (!/^[01]{32}$/.test(value)) {
      throw new Error("Binary must be exactly 32 bits");
    }
    return value;
  }

  if (type === "hex") {
    const value = cleanHex(rawValue);
    if (!/^[0-9A-F]{8}$/.test(value)) {
      throw new Error("Hex must be exactly 8 digits");
    }
    return hexToBinary(value);
  }

  if (type === "octet") {
    const value = cleanOctet(rawValue);
    if (!/^[0-7]{1,11}$/.test(value)) {
      throw new Error("Octet must use digits 0-7");
    }

    const parsed = parseInt(value, 8);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 0xFFFFFFFF) {
      throw new Error("Octet out of 32-bit range");
    }

    return octetToBinary(value);
  }

  throw new Error("Unsupported source type");
}

function binaryToTarget(type, binary) {
  if (type === "int") {
    return String(binaryToInt(binary));
  }

  if (type === "float") {
    const value = binaryToFloat(binary);
    return Number.isNaN(value) ? "NaN" : String(value);
  }

  if (type === "binary") {
    return formatBinaryPlain(binary);
  }

  if (type === "hex") {
    return binaryToHex(binary);
  }

  if (type === "octet") {
    return formatOctet(binaryToOctet(binary));
  }

  return "";
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatColoredBinary(text, type) {
  if (type !== "binary") {
    return `<div class="single-line-result">${escapeHtml(text)}</div>`;
  }

  const clean = text.replace(/\s+/g, "").replace(/\n/g, "");
  const groups = clean.match(/.{1,4}/g) || [];

  const top = groups.slice(0, 4);
  const bottom = groups.slice(4, 8);

  function renderGroup(group) {
    return `<span class="bit-group">${
      group
        .split("")
        .map((c) =>
          c === "1"
            ? '<span class="bit1">1</span>'
            : '<span class="bit0">0</span>'
        )
        .join("")
    }</span>`;
  }

  const topRow = `<div class="bit-row">${top.map(renderGroup).join("")}</div>`;
  const bottomRow = `<div class="bit-row">${bottom.map(renderGroup).join("")}</div>`;

  return `${topRow}${bottomRow}`;
}

function createSelect(className) {
  const select = document.createElement("select");
  select.className = className;

  typeOptions.forEach((option) => {
    const el = document.createElement("option");
    el.value = option.value;
    el.textContent = option.label;
    select.appendChild(el);
  });

  return select;
}

function labelWrap(labelText, element) {
  const wrapper = document.createElement("div");
  wrapper.className = "batch-field";

  const label = document.createElement("label");
  label.textContent = labelText;

  wrapper.appendChild(label);
  wrapper.appendChild(element);
  return wrapper;
}

function createRow() {
  const row = document.createElement("div");
  row.className = "batch-row";

  const fromSelect = createSelect("batch-select from-select");
  const toSelect = createSelect("batch-select to-select");
  toSelect.value = "binary";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "batch-input";
  input.placeholder = "Enter value";

  const output = document.createElement("div");
  output.className = "batch-output";
  output.innerHTML = '<span class="result-placeholder">Result</span>';

  // DELETE BUTTON
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-row-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";

  deleteBtn.addEventListener("click", () => {
    row.remove();
    if (!rowsContainer.children.length) addRow();
  });

  // COPY BUTTON
  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-row-btn";
  copyBtn.type = "button";
  copyBtn.textContent = "Copy";

  copyBtn.addEventListener("click", () => {
    copyResult(output, toSelect.value, copyBtn);
  });

  // ACTIONS WRAPPER
  const actions = document.createElement("div");
  actions.className = "batch-actions";
  actions.appendChild(deleteBtn);
  actions.appendChild(copyBtn);

  row.appendChild(labelWrap("From", fromSelect));
  row.appendChild(labelWrap("To", toSelect));
  row.appendChild(labelWrap("Value", input));
  row.appendChild(labelWrap("Result", output));
  row.appendChild(actions);

  rowsContainer.appendChild(row);
}

function copyResult(outputEl, type, btn) {
  let text = "";

  if (type === "binary") {
    const groups = outputEl.querySelectorAll(".bit-group");

    // join groups WITHOUT spaces
    text = Array.from(groups)
      .map(g => g.textContent)
      .join("");
  } else {
    text = outputEl.textContent.trim();
  }

  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = original), 1200);
  });
}

function addRow() {
  createRow();
}

function calculateRow(row) {
  const fromType = row.querySelector(".from-select").value;
  const toType = row.querySelector(".to-select").value;
  const input = row.querySelector(".batch-input");
  const output = row.querySelector(".batch-output");

  const rawValue = input.value;

  output.classList.remove("error-output", "binary-result");

  if (!rawValue.trim()) {
    output.innerHTML = '<span class="result-placeholder">Result</span>';
    return;
  }

  try {
    const binary = sourceToBinary(fromType, rawValue);
    const result = binaryToTarget(toType, binary);
    output.innerHTML = formatColoredBinary(result, toType);

    if (toType === "binary") {
      output.classList.add("binary-result");
    }
  } catch (error) {
    output.textContent = error.message;
    output.classList.add("error-output");
  }
}

function calculateAll() {
  const rows = rowsContainer.querySelectorAll(".batch-row");
  rows.forEach(calculateRow);
}

function clearAllRows() {
  rowsContainer.innerHTML = "";
  addRow();
}

addRowBtn.addEventListener("click", addRow);
calculateAllBtn.addEventListener("click", calculateAll);
clearRowsBtn.addEventListener("click", clearAllRows);

addRow();