// Create PDF Document
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";    
export async function  generatePDF(rows: any[], dateStart: string | null, dateEnd: string | null): Promise<Uint8Array> {

const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Page settings
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN = 40;
    const ROW_HEIGHT = 20;
    const HEADER_HEIGHT = 70;

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let yPosition = PAGE_HEIGHT - HEADER_HEIGHT;

    // Helper: Check if new page needed
    const checkNewPage = (requiredSpace: number): boolean => {
      if (yPosition < MARGIN + requiredSpace) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        yPosition = PAGE_HEIGHT - HEADER_HEIGHT;
        
        // Redraw table header on new page
        drawTableHeader();
        return true;
      }
      return false;
    };

    // Helper: Draw text safely
    const drawText = (
      text: string, 
      x: number, 
      y: number, 
      options: any = {}
    ): void => {
      try {
        const safeText = String(text || "").substring(0, 100); // Limit length
        page.drawText(safeText, {
          x,
          y,
          size: options.size || 10,
          font: options.bold ? helveticaBold : helveticaFont,
          color: options.color || rgb(0, 0, 0),
          maxWidth: options.maxWidth
        });
      } catch (err) {
        console.warn("Error drawing text:", err);
      }
    };

    // Table column configuration
    const columns = [
      { header: "N°Vers", width: 60, key: "numver", align: "left" },
      { header: "Prod.", width: 60, key: "refpro", align: "left" },
      { header: "N°Pal", width: 55, key: "numpal", align: "left" },
      { header: "Date", width: 70, key: "datepal", align: "left" },
      { header: "Marque", width: 80, key: "marque", align: "left" },
      { header: "Client", width: 90, key: "client", align: "left" },
      { header: "Poids", width: 60, key: "pdsChoosen", align: "right" },
      { header: "Colis", width: 50, key: "nbcolis", align: "right" }
    ];

    const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const startX = (PAGE_WIDTH - tableWidth) / 2;

    // Draw table header function
    const drawTableHeader = (): void => {
      // Header background
      page.drawRectangle({
        x: startX - 5,
        y: yPosition - 15,
        width: tableWidth + 10,
        height: 20,
        color: rgb(0.2, 0.4, 0.8),
      });

      // Column headers
      let xPos = startX;
      columns.forEach((col) => {
        drawText(col.header, xPos + 2, yPosition+10, {
          size: 9,
          bold: true,
          color: rgb(1, 1, 1)
        });
        xPos += col.width;
      });

      yPosition -= 25;

      // Header border line
      page.drawLine({
        start: { x: startX - 5, y: yPosition + 10 },
        end: { x: startX + tableWidth + 5, y: yPosition + 10 },
        thickness: 2,
        color: rgb(0.2, 0.4, 0.8)
      });
    };

    // Document title
    drawText("Rapport Palettes par Versement", PAGE_WIDTH / 2 - 120, yPosition, {
      size: 16,
      bold: true,
      color: rgb(0.2, 0.4, 0.8)
    });

    yPosition -= 25;
    drawText(
      `Période: ${dateStart || 'N/A'} → ${dateEnd || 'N/A'}`, 
      MARGIN, 
      yPosition, 
      { size: 11 }
    );

    yPosition -= 30;

    // Draw initial table header
    drawTableHeader();

    // Process rows in batches for better performance
    const BATCH_SIZE = 50;
    let rowCount = 0;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Check for new page
      checkNewPage(ROW_HEIGHT + 10);

      // Alternate row background
      if (rowCount % 2 === 0) {
        page.drawRectangle({
          x: startX - 5,
          y: yPosition - 5,
          width: tableWidth + 10,
          height: ROW_HEIGHT,
          color: rgb(0.97, 0.97, 0.97)
        });
      }

      // Draw row data
      let xPos = startX;
      columns.forEach((col) => {
        let value = row[col.key];
        let displayValue = "";

        // Format value based on type
        if (value !== null && value !== undefined) {
          if (col.key === "pdsChoosen") {
            displayValue = Number(value || 0).toFixed(2);
          } else if (col.key === "datepal" && value instanceof Date) {
            displayValue = value.toLocaleDateString('fr-FR');
          } else {
            displayValue = String(value);
          }
        }

        // Truncate long text
        const maxChars = Math.floor(col.width / 6);
        if (displayValue.length > maxChars) {
          displayValue = displayValue.substring(0, maxChars - 2) + "..";
        }

        // Align text
        const textX = col.align === "right" 
          ? xPos + col.width - 35
          : xPos + 2;

        drawText(displayValue, textX, yPosition, { size: 8 });
        xPos += col.width;
      });

      yPosition -= ROW_HEIGHT;
      rowCount++;

      // Light separator every 5 rows
      if (rowCount % 5 === 0) {
        page.drawLine({
          start: { x: startX - 5, y: yPosition + 10 },
          end: { x: startX + tableWidth + 5, y: yPosition + 10 },
          thickness: 0.5,
          color: rgb(0.85, 0.85, 0.85)
        });
      }

      // Log progress for large datasets
      if (i > 0 && i % BATCH_SIZE === 0) {
        console.log(`Processed ${i}/${rows.length} rows`);
      }
    }

    // Final table border
    yPosition -= 10;
    page.drawLine({
      start: { x: startX - 5, y: yPosition + 10 },
      end: { x: startX + tableWidth + 5, y: yPosition + 10 },
      thickness: 2,
      color: rgb(0.2, 0.4, 0.8)
    });

    // Calculate totals safely
    const totalPoids = rows.reduce((sum, row) => {
      const val = Number(row.pdsChoosen);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const totalColis = rows.reduce((sum, row) => {
      const val = Number(row.nbcolis);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    // Totals section
    checkNewPage(80);
    yPosition -= 30;

    // Totals box
    page.drawRectangle({
      x: MARGIN,
      y: yPosition - 15,
      width: 350,
      height: 60,
      color: rgb(0.95, 0.97, 1),
      borderColor: rgb(0.2, 0.4, 0.8),
      borderWidth: 1.5
    });

    drawText("TOTAUX", MARGIN + 10, yPosition + 30, {
      size: 12,
      bold: true,
      color: rgb(0.2, 0.4, 0.8)
    });

    drawText(`Poids total: ${totalPoids.toFixed(2)} Kg`, MARGIN + 10, yPosition + 10, {
      size: 10,
      bold: true
    });

    drawText(`Nombre total de palettes: ${rows.length}`, MARGIN + 10, yPosition - 8, {
      size: 10
    });

    drawText(`Nombre total de colis: ${totalColis}`, MARGIN + 10, yPosition - 26, {
      size: 10
    });

    // Add page numbers to all pages
    const pages = pdfDoc.getPages();
    const pageCount = pages.length;
    pages.forEach((pg, index) => {
      pg.drawText(`Page ${index + 1} / ${pageCount}`, {
        x: PAGE_WIDTH - 100,
        y: 20,
        size: 8,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5)
      });

      // Add generation date
      pg.drawText(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, {
        x: MARGIN,
        y: 20,
        size: 8,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5)
      });
    });

    console.log(`PDF generated with ${pageCount} pages`);

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}