
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Exports an HTML element to a PDF file and triggers download
 * @param element The HTML element to be exported
 * @param fileName The name of the PDF file
 */
export const exportToPdf = async (element: HTMLElement, fileName: string) => {
  try {
    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable cross-origin images
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Get dimensions
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    
    // Handle if content is longer than a page
    const pdfHeight = pdf.internal.pageSize.getHeight();
    if (imgHeight > pdfHeight) {
      let heightLeft = imgHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }
    
    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
