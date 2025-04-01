
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
    
    // Create PDF - use US Letter size (8.5x11 inches)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter' // 8.5x11 inches
    });
    
    // Get PDF dimensions in inches
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate the ratio to fit content within the PDF page
    // Use margins to ensure content isn't right at the edge
    const margin = 0.75; // 0.75 inch margins
    const maxWidth = pdfWidth - (margin * 2);
    const maxHeight = pdfHeight - (margin * 2);
    
    // Calculate aspect ratio to maintain proportions
    const aspectRatio = canvas.width / canvas.height;
    
    // Determine dimensions that maintain aspect ratio but make the content
    // take up less space on the page (about 70% of available space)
    let imgWidth, imgHeight;
    
    if (aspectRatio > maxWidth / maxHeight) {
      // Width is the limiting factor
      imgWidth = maxWidth * 0.7; // Use 70% of available width
      imgHeight = imgWidth / aspectRatio;
    } else {
      // Height is the limiting factor
      imgHeight = maxHeight * 0.7; // Use 70% of available height
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

/**
 * Exports recipients data to a CSV file and triggers download
 * @param recipients The array of recipients with payout information
 * @param totalPayout The total payout amount
 * @param defaultFileName The default name for the CSV file
 */
export const exportToCsv = (
  recipients: Array<{id: string; name: string; value: number; type?: string; payout: number}>,
  totalPayout: number,
  defaultFileName: string
) => {
  try {
    // Ask user for file name
    const fileName = prompt("Enter a name for your CSV file", defaultFileName) || defaultFileName;
    
    // Create CSV header row
    const headers = ['Name', 'Type', 'Value', 'Payout ($)', 'Percentage (%)'];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    recipients.forEach(recipient => {
      const type = recipient.type || (recipient.value ? 'shares' : '$');
      const percentage = totalPayout > 0 
        ? ((recipient.payout / totalPayout) * 100).toFixed(2) 
        : '0';
      
      // Format the row data and handle special characters
      const row = [
        `"${recipient.name.replace(/"/g, '""')}"`, // Escape quotes in names
        `"${type}"`,
        recipient.value.toString(),
        recipient.payout.toFixed(2),
        percentage
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Add total row
    csvContent += `"Total",,,"${totalPayout.toFixed(2)}","100.00"\n`;
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    
    // Add to document, trigger download and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating CSV:', error);
  }
};
