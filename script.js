const fileInput = document.getElementById("fileInput");
const customFileUpload = document.querySelector(".custom-file-upload");
const upload = document.querySelector(".submit button");
const processing = document.querySelector(".processing");
const filesUploaded = document.querySelector(".filesUploaded");

const SUPABASE_URL = "https://tjyazmklqebvbeugawkv.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeWF6bWtscWVidmJldWdhd2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTYxNDUsImV4cCI6MjA2NjY5MjE0NX0.fH-cFD6Ygp6UxkcF10P2LjkJl2nrq3DOUIdyvWaKoWU";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "pdf-files";
const alertMsg = document.querySelector(".alert p");

window.onload = async () => {
  loadFile();
  try {
    const { data, error } = await supabase.storage.from("pdf-files").list();
    if (error) {
      alertMsg.innerHTML =
        "<strong>Error!</strong> Supabase not connected properly.";
    } else {
      alertMsg.innerHTML =
        "<strong>Success!</strong> Supabase connected and working!";
    }
  } catch (err) {
    alertMsg.innerHTML = "<strong>Error!</strong> Unexpected issue.";
  }
};

async function uploadFile() {
  processing.style.display = "flex";
  const file = fileInput.files[0];

  if (!file) {
    alertMsg.innerHTML = "❌ File not selected. Please try again.";
    processing.style.display = "none";
    return;
  }

  const fileName = Date.now() + "_" + file.name;

  // Optional delay for UI effect
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, file);

  if (error) {
    alertMsg.innerHTML = "❌ File Not Uploaded! Please try again.";

    customFileUpload.innerHTML = `
    <i class='fa-solid fa-file-pdf' id='pdficon'></i> Browse File
    <input type='file' accept='.pdf' id='fileInput' />
  `;
  } else {
    alertMsg.innerHTML = "✅ File Uploaded Successfully!";
    fileInput.value = "";
    fileInput.removeEventListener("change", handleFileChange);

    customFileUpload.innerHTML = `
    <i class='fa-solid fa-file-pdf' id='pdficon'></i> Browse File
    <input type='file' accept='.pdf' id='fileInput' />
  `;
    fileInput.addEventListener("change", handleFileChange);
    processing.style.display = "none";
    loadFile();
  }
}

async function loadFile() {
  filesUploaded.innerHTML = "";
  const { data, error } = await supabase.storage.from(BUCKET).list();

  if (error || !data.length) {
    filesUploaded.innerHTML = "<p>No files uploaded yet.</p>";
    return;
  }
  data.forEach((file) => {
    let listDiv = document.createElement("div");

    listDiv.style.width = "100%";
    listDiv.style.display = "flex";
    listDiv.style.alignItems = "center";
    listDiv.style.justifyContent = "space-between"; // Better spacing for text & buttons
    listDiv.style.padding = "12px 16px";
    listDiv.style.marginBottom = "10px";
    listDiv.style.border = "1px solid #ccc";
    listDiv.style.borderRadius = "8px";
    listDiv.style.backgroundColor = "#f9f9ff";
    listDiv.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.05)";
    listDiv.style.fontFamily = "Segoe UI, sans-serif";
    

    const files = file.name;
    listDiv.innerHTML = `
      <strong style="flex: 1; color: #333;">${files}</strong>
      <div style="display: flex; gap: 10px;">
        <button onclick="viewFile('${files}')" style="border: none; background: #e0e7ff; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
          <i class="fa-regular fa-eye" style="font-size: 18px; color: #4f46e5;"></i>
        </button>
        <button onclick="deleteFile('${files}')" style="border: none; background: #ffe0e0; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
          <i class="fa-solid fa-trash" style="font-size: 18px; color: #dc2626;"></i>
        </button>
      </div>
    `;
    
    filesUploaded.appendChild(listDiv);
  });
}

async function viewFile(fileName) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  if (data?.publicUrl) window.open(data.publicUrl, "_blank");
}

async function deleteFile(fileName) {
  const { error } = await supabase.storage.from(BUCKET).remove([fileName]);
  if (error) {
    alertMsg.innerHTML = "❌ Delete failed.";
  } else {
    alertMsg.innerHTML = "🗑️ File deleted.";
    loadFile();
  }
}

upload.addEventListener("click", () => {
  // setInterval(() => {
  //   processing.style.display = "flex";
  // }, 100);
  alertMsg.innerHTML = "File Uploading....";
  uploadFile();
});

function handleFileChange() {
  const file = fileInput.files[0];
  if (file) {
    customFileUpload.innerHTML = file.name;
  } else {
    customFileUpload.innerHTML = "No File Selected!";
  }
}
fileInput.addEventListener("change", handleFileChange);
