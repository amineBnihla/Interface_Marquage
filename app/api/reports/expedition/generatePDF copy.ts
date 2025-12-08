import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generatePDF(
  rows: any[], 
  dateStart: string | null, 
  dateEnd: string | null
): Promise<Uint8Array> {
  
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

  // Page settings - LANDSCAPE A4
  const PAGE_WIDTH = 841.89;  // A4 Landscape width
  const PAGE_HEIGHT = 595.28; // A4 Landscape height
  const MARGIN = 20;
  const ROW_HEIGHT = 14;
  const HEADER_BOX_HEIGHT = 80;
  const TABLE_HEADER_HEIGHT = 30;

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let yPosition = PAGE_HEIGHT - HEADER_BOX_HEIGHT - MARGIN;
  let currentPageNumber = 1;

  // Helper: Draw text safely
  const drawText = (
    text: string, 
    x: number, 
    y: number, 
    options: any = {}
  ): void => {
    try {
      const safeText = String(text || "").substring(0, 150);
      page.drawText(safeText, {
        x,
        y,
        size: options.size || 7,
        font: options.font || helveticaFont,
        color: options.color || rgb(0, 0, 0),
        maxWidth: options.maxWidth
      });
    } catch (err) {
      console.warn("Error drawing text:", err);
    }
  };

  // Draw header box (top section)
  const drawHeaderBox = (): void => {
    const headerY = PAGE_HEIGHT - MARGIN;
    
    // Outer border
    page.drawRectangle({
      x: MARGIN,
      y: headerY - HEADER_BOX_HEIGHT,
      width: PAGE_WIDTH - (MARGIN * 2),
      height: HEADER_BOX_HEIGHT,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1.5
    });

    // Left section (empty space for logo)
    page.drawLine({
      start: { x: 250, y: headerY },
      end: { x: 250, y: headerY - HEADER_BOX_HEIGHT },
      thickness: 1.5,
      color: rgb(0, 0, 0)
    });

    // Right info section border
    page.drawLine({
      start: { x: PAGE_WIDTH - 280, y: headerY },
      end: { x: PAGE_WIDTH - 280, y: headerY - HEADER_BOX_HEIGHT },
      thickness: 1.5,
      color: rgb(0, 0, 0)
    });

    // Main title
    drawText("LISTE DES PALETTES PAR VERSEMENT", PAGE_WIDTH / 2 - 140, headerY - 45, {
      size: 18,
      font: helveticaBold
    });

    // Right section - Reference
    const rightX = PAGE_WIDTH - 260;
    drawText("Réf:", rightX, headerY - 20, {
      size: 9,
      font: helveticaBold
    });
    drawText("LISTE DES PALETTES PAR VERSEMENT", rightX + 30, headerY - 20, {
      size: 8
    });

    // Horizontal line in right section
    page.drawLine({
      start: { x: PAGE_WIDTH - 280, y: headerY - 28 },
      end: { x: PAGE_WIDTH - MARGIN, y: headerY - 28 },
      thickness: 1,
      color: rgb(0, 0, 0)
    });

    // Date/Time
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    drawText("Édite le:", rightX, headerY - 45, {
      size: 9,
      font: helveticaBold
    });
    drawText(currentDate, rightX + 50, headerY - 45, {
      size: 9
    });
    drawText(currentTime, rightX + 120, headerY - 45, {
      size: 9
    });

    // Horizontal line
    page.drawLine({
      start: { x: PAGE_WIDTH - 280, y: headerY - 53 },
      end: { x: PAGE_WIDTH - MARGIN, y: headerY - 53 },
      thickness: 1,
      color: rgb(0, 0, 0)
    });

    // Page number
    drawText(`Page    ${currentPageNumber}/75`, rightX, headerY - 70, {
      size: 9
    });
  };

  // Table column configuration - matching original exactly
  const columns = [
    { header: "N°Vers", width: 35, key: "numver" },
    { header: "Ref Pro", width: 40, key: "refpro" },
    { header: "N°Pal", width: 35, key: "numpal" },
    { header: "Date", width: 55, key: "dTeDep" },
    { header: "ColPal", width: 40, key: "colpal" },
    { header: "Ligne", width: 35, key: "ligne" },
    { header: "Emballage", width: 55, key: "emballage" },
    { header: "N°Lot", width: 35, key: "numlot" },
    { header: "Marque", width: 55, key: "marque" },
    { header: "Cal.", width: 35, key: "calibr" },
    { header: "NbrF", width: 35, key: "nbrfru" },
    { header: "Cat", width: 35, key: "nomcat" },
    { header: "Colis", width: 40, key: "colis" },
    { header: "Export\nCom.", width: 40, key: "pdsbru" },
    { header: "P. Brut", width: 45, key: "pdsChoosen" },
    { header: "BDQ", width: 35, key: "bdq" },
    { header: "Dossier", width: 45, key: "dossier" },
    { header: "DteDep.", width: 50, key: "dtedep" },
    { header: "Transport", width: 55, key: "transport" },
    { header: "Client", width: 65, key: "nomCl" },
    { header: "N°TO", width: 35, key: "numpo" }
  ];

  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const startX = MARGIN + 10;

  // Draw table header
  const drawTableHeader = (): void => {
    const headerStartY = yPosition;

    // Header background
    page.drawRectangle({
      x: startX - 5,
      y: headerStartY - 22,
      width: tableWidth + 10,
      height: 24,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    });

    // Draw column headers
    let xPos = startX;
    columns.forEach((col, index) => {
      // Vertical separator lines
      if (index > 0) {
        page.drawLine({
          start: { x: xPos - 2, y: headerStartY + 2 },
          end: { x: xPos - 2, y: headerStartY - 22 },
          thickness: 0.5,
          color: rgb(0.5, 0.5, 0.5)
        });
      }

      // Header text
      const lines = col.header.split('\n');
      if (lines.length > 1) {
        drawText(lines[0], xPos + 2, headerStartY - 8, {
          size: 7,
          font: helveticaBold
        });
        drawText(lines[1], xPos + 2, headerStartY - 16, {
          size: 7,
          font: helveticaBold
        });
      } else {
        drawText(col.header, xPos + 2, headerStartY - 12, {
          size: 7,
          font: helveticaBold
        });
      }

      xPos += col.width;
    });

    yPosition -= 28;
  };

  // Helper: Check if new page needed
  const checkNewPage = (requiredSpace: number): boolean => {
    if (yPosition < MARGIN + requiredSpace + 30) {
      // Add page number at bottom of current page
      drawText(
        `Page ${currentPageNumber}`, 
        PAGE_WIDTH / 2 - 20, 
        MARGIN - 10, 
        { size: 8 }
      );
      
      // Create new page
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentPageNumber++;
      yPosition = PAGE_HEIGHT - HEADER_BOX_HEIGHT - MARGIN;
      
      // Draw header box on new page
      drawHeaderBox();
      yPosition -= 10;
      
      // Redraw table header
      drawTableHeader();
      return true;
    }
    return false;
  };

  // Draw initial header box
  drawHeaderBox();
  yPosition -= 10;

  // Draw initial table header
  drawTableHeader();

  // Process rows
  let rowCount = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Check for new page
    checkNewPage(ROW_HEIGHT);

    // Alternate row background (very light)
    if (rowCount % 2 === 1) {
      page.drawRectangle({
        x: startX - 5,
        y: yPosition - 10,
        width: tableWidth + 10,
        height: ROW_HEIGHT,
        color: rgb(0.98, 0.98, 0.98)
      });
    }

    // Draw row data
    let xPos = startX;
    columns.forEach((col, colIndex) => {
      let value = row[col.key];
      let displayValue = "";

      // Format value based on type
      if (value !== null && value !== undefined) {
        if (col.key === "pdsChoosen") {
          displayValue = Number(value || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        } else if (col.key === "datepal") {
          if (value instanceof Date) {
            displayValue = value.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } else {
            // Try to parse string date
            const dateStr = String(value);
            if (dateStr.includes('/') || dateStr.includes('-')) {
              displayValue = dateStr.substring(0, 10);
            } else {
              displayValue = dateStr;
            }
          }
        } else if (col.key === "dtedep") {
          const dateStr = String(value);
          if (dateStr.length >= 8) {
            displayValue = dateStr.substring(0, 8);
          } else {
            displayValue = dateStr;
          }
        } else {
          displayValue = String(value);
        }
      }

      // Truncate if too long
      const maxChars = Math.floor(col.width / 4.5);
      if (displayValue.length > maxChars) {
        displayValue = displayValue.substring(0, maxChars - 1);
      }

      // Draw vertical separator
      if (colIndex > 0) {
        page.drawLine({
          start: { x: xPos - 2, y: yPosition + 2 },
          end: { x: xPos - 2, y: yPosition - 10 },
          thickness: 0.3,
          color: rgb(0.8, 0.8, 0.8)
        });
      }

      // Draw text
      drawText(displayValue, xPos + 2, yPosition - 7, {
        size: 6.5,
        font: courierFont
      });

      xPos += col.width;
    });

    // Draw horizontal line after row
    page.drawLine({
      start: { x: startX - 5, y: yPosition - 11 },
      end: { x: startX + tableWidth + 5, y: yPosition - 11 },
      thickness: 0.2,
      color: rgb(0.85, 0.85, 0.85)
    });

    yPosition -= ROW_HEIGHT;
    rowCount++;

    // Log progress
    if (i > 0 && i % 50 === 0) {
      console.log(`Processed ${i}/${rows.length} rows`);
    }
  }

  // Draw final table border
  page.drawRectangle({
    x: startX - 5,
    y: yPosition,
    width: tableWidth + 10,
    height: 0,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1.5
  });

  // Add final page number
  drawText(
    `Page ${currentPageNumber}`, 
    PAGE_WIDTH / 2 - 20, 
    MARGIN - 10, 
    { size: 8 }
  );

  // Calculate totals
  const totalPoids = rows.reduce((sum, row) => {
    const val = Number(row.pdsChoosen);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalColis = rows.reduce((sum, row) => {
    const val = Number(row.colis);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Add summary page
  page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  currentPageNumber++;
  yPosition = PAGE_HEIGHT - HEADER_BOX_HEIGHT - MARGIN;
  
  drawHeaderBox();
  yPosition -= 40;

  // Summary box
  page.drawRectangle({
    x: MARGIN + 20,
    y: yPosition - 100,
    width: 400,
    height: 120,
    color: rgb(0.97, 0.97, 1),
    borderColor: rgb(0, 0, 0),
    borderWidth: 1.5
  });

  drawText("RÉCAPITULATIF", MARGIN + 30, yPosition - 20, {
    size: 14,
    font: helveticaBold
  });

  drawText(`Nombre total de palettes: ${rows.length}`, MARGIN + 30, yPosition - 45, {
    size: 10,
    font: helveticaBold
  });

  drawText(
    `Poids brut total: ${totalPoids.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Kg`, 
    MARGIN + 30, 
    yPosition - 65, 
    {
      size: 10,
      font: helveticaBold
    }
  );

  drawText(`Nombre total de colis: ${totalColis}`, MARGIN + 30, yPosition - 85, {
    size: 10
  });

  drawText(
    `Période: ${dateStart || 'N/A'} au ${dateEnd || 'N/A'}`, 
    MARGIN + 30, 
    yPosition - 105, 
    {
      size: 9,
      color: rgb(0.3, 0.3, 0.3)
    }
  );

  console.log(`PDF generated with ${currentPageNumber} pages`);

  // Generate and return PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}