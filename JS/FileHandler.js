function initializeDragAndDrop(dotNetHelper) {
    const dropArea = document.getElementById("drop-area");

    dropArea.addEventListener("dragover", (event) => {
        event.preventDefault(); // Prevent default browser behavior
    });

    dropArea.addEventListener("drop", async (event) => {
        event.preventDefault(); // Prevent default browser behavior

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const content = await readFileContent(file);
            dotNetHelper.invokeMethodAsync("SetFileContent", content);
        }
    });
}

async function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function downloadFile(fileName, content) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
