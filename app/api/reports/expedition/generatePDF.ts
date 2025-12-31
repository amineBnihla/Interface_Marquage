import { Weight } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface PaletteRow {
  numver: string | number;
  refpro: string | number;
  numpal: string | number;
  dTeDep: string;
  colpal: string | number;
  nomLign: string | number;
  nomEmb: string | number;
  numlot: string | number;
  nomMarq: string;
  calibr: string | number;
  nbrfru: string | number;
  nomcat: string;
  nbcolis: string | number;
  pdsbru: string | number;
  pdsChoosen: string | number;
  numbdq: string | number;
  numdos: string | number;
  dtepal: string;
  typtrs: string;
  nomCl: string;
  numpo: string | number;
}
export async function generatePDF(
  rows: PaletteRow[], 
  dateStart: string | null, 
  dateEnd: string | null
): Promise<Uint8Array> {
   // Calculate total pages needed
   
 
   const pdfDoc = await PDFDocument.create();
   const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
   const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
   const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
   
   // Page settings - LANDSCAPE A4
   const PAGE_WIDTH = 841.89;
   const PAGE_HEIGHT = 595.28;
   const MARGIN = 20;
   const ROW_HEIGHT = 12;
   const HEADER_BOX_HEIGHT = 70;
   
   const calculateTotalPages = (): number => {
     let pages = 1;
     let testYPosition = PAGE_HEIGHT - HEADER_BOX_HEIGHT - MARGIN - 15 - 22; // After header and table header
     
     for (let i = 0; i < rows.length; i++) {
       if (testYPosition < MARGIN + ROW_HEIGHT + 40) {
         pages++;
         testYPosition = PAGE_HEIGHT - HEADER_BOX_HEIGHT - MARGIN - 15 - 22;
       }
       testYPosition -= ROW_HEIGHT;
     }
     
     // Add 1 for totals row if needed
     if (testYPosition < MARGIN + ROW_HEIGHT + 45) {
       pages++;
     }
     
     // Add 1 for summary page
     pages++;
     
     return pages;
   };
    //  const totalPages = calculateTotalPages();
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let yPosition = PAGE_HEIGHT - HEADER_BOX_HEIGHT - MARGIN - 15;
  let currentPageNumber = 1;

  // Helper: Draw text safely
  const drawText = (
    text: string, 
    x: number, 
    y: number, 
    options: any = {}
  ): void => {
    try {
      const safeText = String(text || "").substring(0, 200);
      page.drawText(safeText, {
        x,
        y,
        size: options.size || 7,
        font: options.font || helveticaFont,
        color: options.color || rgb(0, 0, 0),
        maxWidth: options.maxWidth,
        lineHeight: options.lineHeight || options.size || 7
      });
    } catch (err) {
      console.warn("Error drawing text:", err);
    }
  };

  // Draw header box
  const drawHeaderBox = (): void => {
    const headerY = PAGE_HEIGHT - MARGIN;
    const boxWidth = PAGE_WIDTH - (MARGIN * 2);
    
    // Outer border
    page.drawRectangle({
      x: MARGIN,
      y: headerY - HEADER_BOX_HEIGHT,
      width: boxWidth,
      height: HEADER_BOX_HEIGHT,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1.5
    });

    // Left section (logo space) - vertical line
    page.drawLine({
      start: { x: MARGIN + 220, y: headerY },
      end: { x: MARGIN + 220, y: headerY - HEADER_BOX_HEIGHT },
      thickness: 1.5,
      color: rgb(0, 0, 0)
    });

    // Right info section - vertical line
    const rightSectionX = PAGE_WIDTH - 260;
    page.drawLine({
      start: { x: rightSectionX, y: headerY },
      end: { x: rightSectionX, y: headerY - HEADER_BOX_HEIGHT },
      thickness: 1.5,
      color: rgb(0, 0, 0)
    });

    // Main title - centered
    const title = "LISTE DES PALETTES PAR VERSEMENT";
    const titleWidth = title.length * 7.5;
    drawText(title, ((PAGE_WIDTH - titleWidth) / 2)-50, headerY - 40, {
      size: 16,
      font: helveticaBold
    });

    // Right section content
    const rightX = rightSectionX + 12;
    
    // Reference line
    drawText("Réf:", rightX, headerY - 15, {
      size: 8,
      font: helveticaBold
    });
    drawText("LISTE DES PALETTES PAR VERSEMENT", rightX + 25, headerY - 15, {
      size: 7
    });

    // Horizontal separator 1
    page.drawLine({
      start: { x: rightSectionX, y: headerY - 23 },
      end: { x: PAGE_WIDTH - MARGIN, y: headerY - 23 },
      thickness: 1,
      color: rgb(0, 0, 0)
    });

    // Date and time
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const currentTime = new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    drawText("Édite le:", rightX, headerY - 38, {
      size: 8,
      font: helveticaBold
    });
    drawText(currentDate, rightX + 45, headerY - 38, {
      size: 8
    });
    drawText(currentTime, rightX + 110, headerY - 38, {
      size: 8
    });

    // Horizontal separator 2
    page.drawLine({
      start: { x: rightSectionX, y: headerY - 46 },
      end: { x: PAGE_WIDTH - MARGIN, y: headerY - 46 },
      thickness: 1,
      color: rgb(0, 0, 0)
    });

    // Page number
    drawText(`Page`, rightX, headerY - 60, {
      size: 8
    });
    drawText(`${currentPageNumber}`, rightX + 35, headerY - 60, {
      size: 8
    });
  };

   // Table column configuration - exact match to image
  const columns = [
    { header: "N°Vers", width: 32, key: "numver", align: "center" },
    { header: "Ref Pro", width: 35, key: "refpro", align: "center" },
    { header: "N°Pal", width: 30, key: "numpal", align: "center" },
    { header: "Date", width: 50, key: "dtepal", align: "left" },
    { header: "ColPal", width: 35, key: "colpal", align: "center" },
    { header: "Ligne", width: 32, key: "nomLign", align: "center" },
    { header: "Emballage", width: 52, key: "nomEmb", align: "left" },
    { header: "N°Lot", width: 32, key: "numlot", align: "center" },
    { header: "Marque", width: 50, key: "nomMarq", align: "left" },
    { header: "Cal.", width: 28, key: "calibr", align: "center" },
    { header: "NbrF", width: 32, key: "nbrfru", align: "center" },
    { header: "Cat", width: 28, key: "nomcat", align: "center" },
    { header: "Colis", width: 32, key: "nbcolis", align: "center" },
    { header: "Export\nCom.", width: 35, key: "pdsbru", align: "center" },
    { header: "P. Brut", width: 40, key: "pdsChoosen", align: "right" },
    { header: "BDQ", width: 28, key: "numbdq", align: "center" },
    { header: "Dossier", width: 38, key: "numdos", align: "center" },
    { header: "DteDep.", width: 48, key: "dTeDep", align: "left" },
    { header: "Transport", width: 52, key: "typtrs", align: "left" },
    { header: "Client", width: 60, key: "nomCl", align: "left" },
    { header: "N°TO", width: 32, key: "numpo", align: "center" }
  ];

  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const startX = MARGIN;

  // Draw table header
  const drawTableHeader = (): void => {
    const headerStartY = yPosition;
    const headerHeight = 20;

    // Header background
    page.drawRectangle({
      x: startX,
      y: headerStartY - headerHeight,
      width: tableWidth,
      height: headerHeight,
      color: rgb(0.92, 0.92, 0.92),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    });

    // Draw column headers with vertical lines
    let xPos = startX;
    columns.forEach((col, index) => {
      // Vertical separator line
      if (index > 0) {
        page.drawLine({
          start: { x: xPos, y: headerStartY },
          end: { x: xPos, y: headerStartY - headerHeight },
          thickness: 0.5,
          color: rgb(0, 0, 0)
        });
      }

      // Header text
      const lines = col.header.split('\n');
      if (lines.length > 1) {
        // Multi-line header
        const text1Width = lines[0].length * 3.5;
        const text2Width = lines[1].length * 3.5;
        drawText(lines[0], xPos + (col.width - text1Width) / 2, headerStartY - 8, {
          size: 6.5,
          font: helveticaBold
        });
        drawText(lines[1], xPos + (col.width - text2Width) / 2, headerStartY - 15, {
          size: 6.5,
          font: helveticaBold
        });
      } else {
        // Single line header - center aligned
        const textWidth = col.header.length * 3.5;
        drawText(col.header, xPos + (col.width - textWidth) / 2, headerStartY - 12, {
          size: 6.5,
          font: helveticaBold
        });
      }

      xPos += col.width;
    });

    // Right border
    page.drawLine({
      start: { x: startX + tableWidth, y: headerStartY },
      end: { x: startX + tableWidth, y: headerStartY - headerHeight },
      thickness: 1,
      color: rgb(0, 0, 0)
    });

    yPosition -= headerHeight + 2;
  };

  // Helper: Check if new page needed
  const checkNewPage = (requiredSpace: number): boolean => {
    if (yPosition < MARGIN + requiredSpace + 40) {
      // Add page footer
      drawText(
        `Page ${currentPageNumber}`, 
        PAGE_WIDTH / 2 - 20, 
        MARGIN - 5, 
        { size: 8 }
      );
      
      // Create new page
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentPageNumber++;
      yPosition = PAGE_HEIGHT - HEADER_BOX_HEIGHT - MARGIN - 15;
      
      drawHeaderBox();
      yPosition -= 15;
      drawTableHeader();
      return true;
    }
    return false;
  };

  // Draw initial header and table header
  drawHeaderBox();
  yPosition -= 15;
  drawTableHeader();

  // Process rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    checkNewPage(ROW_HEIGHT);

    // Alternating row background
    // if (i % 2 === 1) {
    //   page.drawRectangle({
    //     x: startX,
    //     y: yPosition - ROW_HEIGHT,
    //     width: tableWidth,
    //     height: ROW_HEIGHT,
    //     color: rgb(0.97, 0.97, 0.97)
    //   });
    // }

    // Draw cell borders and data
    let xPos = startX;
    columns.forEach((col, colIndex) => {
      // Vertical separator
      if (colIndex > 0) {
        page.drawLine({
          start: { x: xPos, y: yPosition },
          end: { x: xPos, y: yPosition - ROW_HEIGHT },
          thickness: 0.1,
          color: rgb(0.7, 0.7, 0.7)
        });
      }

      // Format cell value
      let value = row[col.key as keyof PaletteRow];
      let displayValue = "";

      if (value !== null && value !== undefined) {
        if (col.key === "pdsChoosen") {
       
          displayValue = Number(value || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        } else if (col.key === "pdsbru") {
          displayValue = Number(value || 0).toFixed(2);
        } else if (col.key === "dTeDep") {
          displayValue = String(value);
          
        } else if (col.key === "dtepal") {
          displayValue = String(value);
          // displayValue = dateStr.length >= 8 ? dateStr.substring(0, 8) : dateStr;
        } else {
          displayValue = String(value);
        }
      }

      // Truncate if needed
      const maxChars = Math.floor(col.width / 3.8);
      if (displayValue.length > maxChars) {
        displayValue = displayValue.substring(0, maxChars);
      }

      // Text alignment
      let textX = xPos + 2;
      if (col.align === "center") {
        const textWidth = displayValue.length * 3.2;
        textX = xPos + (col.width - textWidth) / 2;
      } else if (col.align === "right") {
        const textWidth = displayValue.length * 3.2;
        textX = xPos + (col.width - textWidth) / 2;
      }

      drawText(displayValue, textX, yPosition - 8, {
        size: 7,
        font: courierFont
      });

      xPos += col.width;
    });

    // Right border
    page.drawLine({
      start: { x: startX + tableWidth, y: yPosition },
      end: { x: startX + tableWidth, y: yPosition - ROW_HEIGHT },
      thickness: 0.1,
      color: rgb(0.7, 0.7, 0.7)
    });

    // Horizontal line after row
    page.drawLine({
      start: { x: startX, y: yPosition - ROW_HEIGHT },
      end: { x: startX + tableWidth, y: yPosition - ROW_HEIGHT },
      thickness: 0.3,
      color: rgb(0.8, 0.8, 0.8)
    });

    yPosition -= ROW_HEIGHT;

    if (i > 0 && i % 50 === 0) {
      console.log(`Processed ${i}/${rows.length} rows`);
    }
  }

  // Calculate column totals
  const totalNumPal = rows.length;
  const totalNbrF = rows.reduce((sum, row) => {
    const val = Number(row.nbrfru);
    return sum + (isNaN(val) ? 0 : val);
  }, 0).toFixed(0);

  const totalColisSum = rows.reduce((sum, row) => {
    const val = Number(row.nbcolis);
    return sum + (isNaN(val) ? 0 : val);
  }, 0).toFixed(0);

  const totalExportCom = rows.reduce((sum, row) => {
    const val = Number(row.pdsbru);
    return sum + (isNaN(val) ? 0 : val);
  }, 0).toFixed(0);

  const totalPoidsBrut = rows.reduce((sum, row) => {
    const val = Number(row.pdsChoosen);
    return sum + (isNaN(val) ? 0 : val);
  }, 0).toFixed(0);

  // Check if we need a new page for totals row
  checkNewPage(ROW_HEIGHT + 5);

  // Draw totals row with thicker top border
  page.drawLine({
    start: { x: startX, y: yPosition },
    end: { x: startX + tableWidth, y: yPosition },
    thickness: 1.5,
    color: rgb(0, 0, 0)
  });

  // Totals row background
  page.drawRectangle({
    x: startX,
    y: yPosition - ROW_HEIGHT - 2,
    width: tableWidth,
    height: ROW_HEIGHT + 2,
    color: rgb(0.95, 0.95, 0.95)
  });
  console.log(totalPoidsBrut,totalColisSum,totalNbrF,totalExportCom)
  // Draw totals in respective columns
  let xPos = startX;
  columns.forEach((col, colIndex) => {
    // Vertical separator
    if (colIndex > 0) {
      page.drawLine({
        start: { x: xPos, y: yPosition },
        end: { x: xPos, y: yPosition - ROW_HEIGHT - 2 },
        thickness: 0.3,
        color: rgb(0.5, 0.5, 0.5)
      });
    }

    let totalValue = "";
    
    // Display totals only for specific columns
    if (col.key === "numpal") {
      totalValue = String(totalNumPal);
    } else if (col.key === "nbrfru") {
      totalValue = String(totalNbrF).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    } else if (col.key === "nbcolis") {
      totalValue = String(totalColisSum).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    } else if (col.key === "pdsbru") {
      totalValue = String(totalExportCom).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    } else if (col.key === "pdsChoosen") {
      totalValue = String(totalPoidsBrut).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    if (totalValue) {
      let textX = xPos;
      if (col.align === "center") {
        const textWidth = totalValue.length ;
        textX = xPos + (col.width - textWidth) / 2;
      } else if (col.align === "right") {
        const textWidth = totalValue.length;
        textX = xPos +  (col.width - textWidth) / 2;
      }

      drawText(totalValue, textX-7, yPosition - 9, {
        size: 6.5,
        font: helveticaBold
      });
    }

    xPos += col.width;
  });

  // Right border
  page.drawLine({
    start: { x: startX + tableWidth, y: yPosition },
    end: { x: startX + tableWidth, y: yPosition - ROW_HEIGHT - 2 },
    thickness: 0.3,
    color: rgb(0.5, 0.5, 0.5)
  });

  yPosition -= ROW_HEIGHT + 2;

  // Bottom table border
  page.drawLine({
    start: { x: startX, y: yPosition },
    end: { x: startX + tableWidth, y: yPosition },
    thickness: 1.5,
    color: rgb(0, 0, 0)
  });

  // Add final page number
  drawText(
    `Page ${currentPageNumber}`, 
    PAGE_WIDTH / 2 - 20, 
    MARGIN - 5, 
    { size: 8 }
  );

  // Calculate totals
  const totalPoids = rows.reduce((sum, row) => {
    const val = Number(row.pdsChoosen);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalColis = rows.reduce((sum, row) => {
    const val = Number(row.nbcolis);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Add summary page
  page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  currentPageNumber++;
  yPosition = PAGE_HEIGHT - HEADER_BOX_HEIGHT - MARGIN - 15;
  
  drawHeaderBox();
  yPosition -= 50;

  // // Summary box
  // page.drawRectangle({
  //   x: MARGIN + 30,
  //   y: yPosition - 110,
  //   width: 450,
  //   height: 130,
  //   color: rgb(0.95, 0.97, 1),
  //   borderColor: rgb(0, 0, 0),
  //   borderWidth: 1.5
  // });

  // drawText("RÉCAPITULATIF", MARGIN + 45, yPosition - 25, {
  //   size: 14,
  //   font: helveticaBold
  // });

  // drawText(`Nombre total de palettes: ${rows.length}`, MARGIN + 45, yPosition - 55, {
  //   size: 10,
  //   font: helveticaBold
  // });

  // drawText(
  //   `Poids brut total: ${totalPoids.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Kg`, 
  //   MARGIN + 45, 
  //   yPosition - 75, 
  //   {
  //     size: 10,
  //     font: helveticaBold
  //   }
  // );

  // drawText(`Nombre total de colis: ${totalColis}`, MARGIN + 45, yPosition - 95, {
  //   size: 9
  // });

  // if (dateStart || dateEnd) {
  //   drawText(
  //     `Période: ${dateStart || 'N/A'} au ${dateEnd || 'N/A'}`, 
  //     MARGIN + 45, 
  //     yPosition - 115, 
  //     {
  //       size: 8,
  //       color: rgb(0.4, 0.4, 0.4)
  //     }
  //   );
  // }

  console.log(`PDF generated with ${currentPageNumber} pages, ${rows.length} rows`);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const rightSectionX = PAGE_WIDTH - 260;
    const rightX = rightSectionX + 12;
    const headerY = PAGE_HEIGHT - MARGIN;
    page.drawText(`/${totalPages}`, {
        x: rightX + 45,
        y: headerY - 60,
        size: 8,
        font: helveticaFont,
    });
  }


  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}