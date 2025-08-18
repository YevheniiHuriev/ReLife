const loader = document.querySelector(".load");
const bodyPage = document.querySelector(".body-page");
loader.style.display="block";
function loaderOff() {
    loader.style.display="none";
    bodyPage.style.display="block";
}
document.addEventListener("DOMContentLoaded", async () => {
    const SESSION_KEY_PREFIX = "currentPage_";
    const GLOBAL_SETTINGS_KEY = "globalSettings";

    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("id");

    const back = document.getElementById("back");
    back.addEventListener("click", () => {
        window.location.href = `../../html/book/show.html?id=${bookId}`;
    });

    const demoContainer = document.querySelector(".demo-container");
    const textContainer = document.getElementById("textLayer");
    const prevPageButton = document.getElementById("prevPage");
    const nextPageButton = document.getElementById("nextPage");
    const pageNumberInput = document.getElementById("pageNumber");

    const fontSizeInput = document.getElementById("fontSize");
    const textColorInput = document.getElementById("textColor");
    const pageColorInput = document.getElementById("pageColor");
    const zoomLevelInput = document.getElementById("zoomLevel");
    const reset = document.getElementById("reset");

    let pdfDoc = null;
    let currentPage = loadCurrentPage(bookId);
    let totalPages = 0;

    const globalSettings = loadGlobalSettings();

    fontSizeInput.value = globalSettings.fontSize || 16;
    textColorInput.value = globalSettings.textColor || "#d9d9d9";
    pageColorInput.value = globalSettings.pageColor || "#1b1d1f";
    zoomLevelInput.value = globalSettings.zoom || 900;

    const updatePageStyles = () => {
        const paragraphs = textContainer.querySelectorAll("p");
        paragraphs.forEach((p) => {
            p.style.background = pageColorInput.value;
        });
        textContainer.style.background = pageColorInput.value;
    }

    const updateTextStyles = () => {
        const paragraphs = textContainer.querySelectorAll("p");
        paragraphs.forEach((p) => {
            p.style.fontSize = `${fontSizeInput.value}px`;
            p.style.color = textColorInput.value;
        });
    };

    const updateZoomLevel = () => {
        demoContainer.style.width = `${zoomLevelInput.value}px`;
    };

    reset.addEventListener("click", () => {
        localStorage.removeItem(GLOBAL_SETTINGS_KEY);
        fontSizeInput.value = 16;
        textColorInput.value = "#d9d9d9";
        pageColorInput.value = "#1b1d1f";
        zoomLevelInput.value = 900;

        updatePageStyles();
        updateTextStyles();
        updateZoomLevel();
    });

    async function fetchDemoContent() {
        try {
            const response = await fetch(`/api/books/${bookId}`);
            if (!response.ok) {
                console.log("Book not found");
                return;
            }
            const book = await response.json();
            const readPath = book.data.content;

            const loadingTask = pdfjsLib.getDocument(`/${readPath}`);
            pdfDoc = await loadingTask.promise;
            totalPages = pdfDoc.numPages;

            displayPage(currentPage);
            loaderOff();
        } catch (error) {
            console.error("Error loading demo content:", error);
            textContainer.textContent = "Content loading error.";
        }
    }

    async function displayPage(pageNum) {
        try {
            if (pageNum < 1 || pageNum > totalPages) return;

            const page = await pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();

            textContainer.innerHTML = "";
            let paragraphs = [];
            let currentParagraph = "";
            let previousY = null;

            textContent.items.forEach((item) => {
                const currentY = item.transform[5];
                const text = item.str.trim();

                if (!text) return;

                if (previousY !== null && Math.abs(currentY - previousY) > 20) {
                    if (currentParagraph) {
                        paragraphs.push(currentParagraph.trim());
                        currentParagraph = "";
                    }
                }
                currentParagraph += text + " ";
                previousY = currentY;
            });

            if (currentParagraph) paragraphs.push(currentParagraph.trim());

            paragraphs.forEach((paragraph) => {
                const p = document.createElement("p");
                p.textContent = paragraph;
                textContainer.appendChild(p);
            });

            updateTextStyles();
            updatePageStyles();
            updateZoomLevel();
            saveCurrentPage(bookId, pageNum);

            prevPageButton.disabled = pageNum === 1;
            nextPageButton.disabled = pageNum === totalPages;
            pageNumberInput.value = pageNum;

            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("Page display error:", error);
        }
    }

    prevPageButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });

    nextPageButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
        }
    });

    pageNumberInput.addEventListener("change", () => {
        const inputPage = parseInt(pageNumberInput.value, 10);
        if (isNaN(inputPage) || inputPage < 1 || inputPage > totalPages) {
            pageNumberInput.value = currentPage;
            return;
        }
        currentPage = inputPage;
        displayPage(currentPage);
    });

    function loadCurrentPage(bookId) {
        return parseInt(sessionStorage.getItem(`${SESSION_KEY_PREFIX}${bookId}`)) || 1;
    }

    function saveCurrentPage(bookId, pageNum) {
        sessionStorage.setItem(`${SESSION_KEY_PREFIX}${bookId}`, pageNum);
    }

    function loadGlobalSettings() {
        return JSON.parse(localStorage.getItem(GLOBAL_SETTINGS_KEY)) || {};
    }

    function saveGlobalSettings() {
        const settings = {
            fontSize: fontSizeInput.value,
            textColor: textColorInput.value,
            pageColor: pageColorInput.value,
            zoom: zoomLevelInput.value,
        };
        localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(settings));
    }

    fontSizeInput.addEventListener("input", () => {
        updateTextStyles();
        saveGlobalSettings();
    });

    pageColorInput.addEventListener("input", () => {
        updatePageStyles();
        saveGlobalSettings();
    });

    textColorInput.addEventListener("input", () => {
        updateTextStyles();
        saveGlobalSettings();
    });

    zoomLevelInput.addEventListener("input", () => {
        updateZoomLevel();
        saveGlobalSettings();
    });

    fetchDemoContent();
});
