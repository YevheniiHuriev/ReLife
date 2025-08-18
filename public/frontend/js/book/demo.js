/*
const loader = document.querySelector(".load");
const bodyPage = document.querySelector(".body-page");
loader.style.display="block";
function loaderOff() {
    loader.style.display="none";
    bodyPage.style.display="block";
}

document.addEventListener("DOMContentLoaded", async () => {
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
    const zoomLevelInput = document.getElementById("zoomLevel");

    let pdfDoc = null;
    let currentPage = 1;
    let totalPages = 0;

    const globalSettings = {
        fontSize: 16,
        textColor: "#d9d9d9",
        zoom: 900,
    };

    fontSizeInput.value = globalSettings.fontSize;
    textColorInput.value = globalSettings.color;
    zoomLevelInput.value = globalSettings.zoom;

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

    async function fetchDemoContent() {
        try {
            const response = await fetch(`/api/books/${bookId}`);
            if (!response.ok) {
                console.log("Book not found");
                return;
            }
            const book = await response.json();
            const demoPath = book.data.demo;

            const loadingTask = pdfjsLib.getDocument(`/${demoPath}`);
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

            prevPageButton.disabled = pageNum === 1;
            nextPageButton.disabled = pageNum === totalPages;
            pageNumberInput.value = pageNum;

            // Плавний скрол до верху сторінки
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

    fontSizeInput.addEventListener("input", () => {
        updateTextStyles();
    });

    textColorInput.addEventListener("input", () => {
        updateTextStyles();
    });

    zoomLevelInput.addEventListener("input", () => {
        updateZoomLevel();
    });

    fetchDemoContent();

});
*/

const loader = document.querySelector(".load");
const bodyPage = document.querySelector(".body-page");
loader.style.display="block";
function loaderOff() {
    loader.style.display="none";
    bodyPage.style.display="block";
}

document.addEventListener("DOMContentLoaded", async () => {
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

    let pdfDoc = null;
    let currentPage = 1;
    let totalPages = 0;

    const globalSettings = {
        fontSize: 16,
        textColor: "#d9d9d9",
        pageColor: "#1b1d1f",
        zoom: 900,
    };

    fontSizeInput.value = globalSettings.fontSize;
    textColorInput.value = globalSettings.textColor;
    pageColorInput.value = globalSettings.pageColor;
    zoomLevelInput.value = globalSettings.zoom;

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

    async function fetchDemoContent() {
        try {
            const response = await fetch(`/api/books/${bookId}`);
            if (!response.ok) {
                console.log("Book not found");
                return;
            }
            const book = await response.json();
            const demoPath = book.data.demo;

            const loadingTask = pdfjsLib.getDocument(`/${demoPath}`);
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

            prevPageButton.disabled = pageNum === 1;
            nextPageButton.disabled = pageNum === totalPages;
            pageNumberInput.value = pageNum;

            // Плавний скрол до верху сторінки
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

    fontSizeInput.addEventListener("input", () => {
        updateTextStyles();
    });

    textColorInput.addEventListener("input", () => {
        updateTextStyles();
    });

    pageColorInput.addEventListener("input", () => {
        updatePageStyles();
    });

    zoomLevelInput.addEventListener("input", () => {
        updateZoomLevel();
    });

    fetchDemoContent();

});
