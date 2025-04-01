
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Exports an HTML element to a PDF file and triggers download
 * @param element The HTML element to be exported
 * @param fileName The default name for the PDF file
 */
export const exportToPdf = async (element: HTMLElement, defaultFileName: string) => {
  try {
    // Ask user for file name
    const fileName = prompt("Enter a name for your PDF", defaultFileName) || defaultFileName;
    
    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable cross-origin images
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Get dimensions
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF - use the correct aspect ratio to ensure content fits properly
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate the ratio to fit content within the PDF page
    // Use margins to ensure content isn't right at the edge
    const margin = 10; // 10mm margin
    const maxWidth = pdfWidth - (margin * 2);
    const maxHeight = pdfHeight - (margin * 2);
    
    // Calculate aspect ratio to maintain proportions
    const aspectRatio = canvas.width / canvas.height;
    
    // Determine dimensions that maintain aspect ratio and fit within margins
    let imgWidth, imgHeight;
    
    if (aspectRatio > maxWidth / maxHeight) {
      // Width is the limiting factor
      imgWidth = maxWidth;
      imgHeight = imgWidth / aspectRatio;
    } else {
      // Height is the limiting factor
      imgHeight = maxHeight;
      imgWidth = imgHeight * aspectRatio;
    }
    
    // Center the image on the page
    const xPosition = margin + (maxWidth - imgWidth) / 2;
    const yPosition = margin + (maxHeight - imgHeight) / 2;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
    
    // Save the PDF with the custom name
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
