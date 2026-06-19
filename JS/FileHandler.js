// Unified drag & drop helper supporting multiple independent drop zones.
// Signature (dotNetRef, elementId?, methodName?, debugMethodName?) so existing calls still work.
(function () {
    function log(...args) { console.log("[DragDrop]", ...args); }
    function preventAll(e) { e.preventDefault(); e.stopPropagation(); }

    async function sendDebug(dotNetRef, debugMethodName, message) {
        if (!debugMethodName) {
            return;
        }

        try {
            await dotNetRef.invokeMethodAsync(debugMethodName, message);
        } catch (err) {
            console.warn("[DragDrop] Debug callback failed", err);
        }
    }

    // Global safety net: prevent browser from navigating to file if user misses target
    ["dragenter", "dragover", "dragleave", "drop"].forEach(evt => {
        window.addEventListener(evt, preventAll, false);
        document.addEventListener(evt, preventAll, false);
    });

    window.initializeDragAndDrop = function (dotNetRef, elementId = "drop-area", methodName = "SetFileContent", debugMethodName = null) {
        const area = document.getElementById(elementId);
        if (!area) {
            log("Element not found", elementId);
            void sendDebug(dotNetRef, debugMethodName, `Element not found: ${elementId}`);
            return;
        }

        log("Init on", elementId, "->", methodName);
        void sendDebug(dotNetRef, debugMethodName, `Initialized on ${elementId} -> ${methodName}`);

        const onDragEnter = () => {
            area.classList.add("drag-over");
            void sendDebug(dotNetRef, debugMethodName, "Drag enter detected.");
        };

        const onDragLeave = () => {
            area.classList.remove("drag-over");
        };

        area.addEventListener("dragenter", onDragEnter, false);
        area.addEventListener("dragleave", onDragLeave, false);
        area.addEventListener("dragover", preventAll, false);
        area.addEventListener("drop", async (e) => {
            preventAll(e);
            onDragLeave();
            await sendDebug(dotNetRef, debugMethodName, "Drop event received.");

            const files = e.dataTransfer?.files;
            if (!files || files.length === 0) {
                log("No files on drop", elementId);
                await sendDebug(dotNetRef, debugMethodName, "No files found in drop payload.");
                return;
            }

            const file = files[0];
            log("Dropped", file.name, file.size + "B", "on", elementId);
            await sendDebug(dotNetRef, debugMethodName, `File dropped: ${file.name} (${file.size} bytes)`);

            try {
                await sendDebug(dotNetRef, debugMethodName, "Reading file content...");
                const content = await readFileContent(file);
                await sendDebug(dotNetRef, debugMethodName, `File read complete. Content length: ${content?.length ?? 0}`);

                await sendDebug(dotNetRef, debugMethodName, `Invoking .NET method: ${methodName}`);
                await dotNetRef.invokeMethodAsync(methodName, content);
                log("invokeMethodAsync OK", methodName);
                await sendDebug(dotNetRef, debugMethodName, `Invoke successful: ${methodName}`);
            } catch (err) {
                console.error("[DragDrop] Error", err);
                await sendDebug(dotNetRef, debugMethodName, `Drop processing failed: ${err?.message ?? err}`);
            }
        }, false);
    };

    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
})();

// Legacy download helper kept (unchanged public API)
function downloadFile(fileName, content) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
}
