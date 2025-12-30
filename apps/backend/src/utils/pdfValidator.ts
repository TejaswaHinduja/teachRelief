// @ts-ignore - pdf-parse types are incorrect in v2
const pdfParse = require("pdf-parse");

const MAX_PAGE_COUNT = 10; 
const MAX_FILE_SIZE_MB = 10; 

export async function validatePdf(pdfUrl: string): Promise<{ valid: boolean; error?: string; pageCount?: number }> {
    try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            return { valid: false, error: "Failed to fetch PDF" };
        }
        // Check file size from headers
        const contentLength = response.headers.get("content-length");
        if (contentLength) {
            const sizeInMB = parseInt(contentLength) / (1024 * 1024);
            if (sizeInMB > MAX_FILE_SIZE_MB) {
                return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB` };
            }
        }

        // Parse PDF to get page count
        /*const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const pdfData = await pdfParse(buffer);
        const pageCount = pdfData.numpages;

        if (pageCount > MAX_PAGE_COUNT) {
            return {
                valid: false,
                error: `Too many pages (${pageCount}). Maximum is ${MAX_PAGE_COUNT} pages`,
                pageCount
            };
        }*/

        return { valid: true};
    } catch (err) {
        console.error("PDF validation error:", err);
        return { valid: false, error: "Failed to validate PDF" };
    }
}
