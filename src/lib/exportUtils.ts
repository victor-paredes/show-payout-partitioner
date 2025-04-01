import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getRecipientColor } from "./colorUtils";

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
    const headers = ['Name', 'Type', 'Value', 'Payout ($)', 'Percentage (%)', 'Color'];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    recipients.forEach(recipient => {
      const type = recipient.type || (recipient.value ? 'shares' : '$');
      const percentage = totalPayout > 0 
        ? ((recipient.payout / totalPayout) * 100).toFixed(2) 
        : '0';
      const color = getRecipientColor(recipient.id);
      
      // Format the row data and handle special characters
      const row = [
        `"${recipient.name.replace(/"/g, '""')}"`, // Escape quotes in names
        `"${type}"`,
        recipient.value.toString(),
        recipient.payout.toFixed(2),
        percentage,
        `"${color}"`
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Add total row
    csvContent += `"Total",,,"${totalPayout.toFixed(2)}","100.00",\n`;
    
    // Add a special marker row with the total payout for import purposes
    csvContent += `"__TOTAL_PAYOUT__",,"${totalPayout.toFixed(2)}",,\n`;
    
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

/**
 * Imports recipients data from a CSV string
 * @param csvString The CSV content as a string
 * @returns An array of recipient objects and the total payout if available
 */
export const importFromCsv = async (
  csvString: string
): Promise<{
  importedData: Array<{id: string; name: string; value: number; type?: string; payout: number; color?: string}>;
  importedTotalPayout?: number;
}> => {
  try {
    // Split the CSV into rows
    const rows = csvString
      .split('\n')
      .map(row => row.trim())
      .filter(row => row); // Remove empty rows
      
    if (rows.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row");
    }
    
    // Parse the header row to identify column indices
    const headers = parseCSVRow(rows[0]);
    
    const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
    const typeIndex = headers.findIndex(h => h.toLowerCase() === 'type');
    const valueIndex = headers.findIndex(h => h.toLowerCase() === 'value');
    const colorIndex = headers.findIndex(h => h.toLowerCase() === 'color');
    
    if (nameIndex === -1) {
      throw new Error("CSV must contain a 'Name' column");
    }
    
    // Look for total payout marker
    let importedTotalPayout: number | undefined = undefined;
    for (let i = 1; i < rows.length; i++) {
      const rowData = parseCSVRow(rows[i]);
      if (rowData[nameIndex] === '__TOTAL_PAYOUT__' && rowData.length > 2) {
        const payoutValue = parseFloat(rowData[2]);
        if (!isNaN(payoutValue)) {
          importedTotalPayout = payoutValue;
        }
        break;
      }
    }
    
    // Generate a timestamp-based prefix for IDs to ensure they're different from previous imports
    const idPrefix = Date.now().toString(36);
    
    // Process data rows (skip header, total and marker rows)
    const recipients = [];
    for (let i = 1; i < rows.length; i++) {
      const rowData = parseCSVRow(rows[i]);
      
      // Skip if this appears to be a total row or the marker row
      if (rowData[nameIndex]?.toLowerCase() === 'total' || 
          rowData[nameIndex] === '__TOTAL_PAYOUT__') continue;
      
      if (rowData.length >= Math.max(nameIndex, typeIndex, valueIndex) + 1) {
        const name = rowData[nameIndex] || 'Unnamed Recipient';
        
        // Determine recipient type and value
        const type = typeIndex !== -1 ? rowData[typeIndex] : 'shares';
        let value = valueIndex !== -1 && rowData[valueIndex] ? parseFloat(rowData[valueIndex]) : 1;
        
        // Get color if available
        const color = colorIndex !== -1 && rowData[colorIndex] ? rowData[colorIndex] : undefined;
        
        // Validate value
        if (isNaN(value)) value = 1;
        
        let id;
        if (color) {
          // Generate a unique ID that will produce the desired color
          // Add a unique prefix based on current timestamp to ensure uniqueness even for same colors
          id = generateIdForColor(color, idPrefix + '-' + i);
        } else {
          // Generate a completely unique ID
          id = idPrefix + '-' + i.toString();
        }
        
        // Create the recipient
        recipients.push({
          id,
          name,
          value,
          type: type as ("shares" | "$" | "%"),
          payout: 0, // Payout will be calculated later
          isFixedAmount: type === "$",
          color
        });
      }
    }
    
    return { importedData: recipients, importedTotalPayout };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
};

/**
 * Generates an ID that, when used with getRecipientColor, will produce the desired color
 * @param targetColor The color we want to generate
 * @param seed A seed to make the generation more deterministic
 * @returns An ID string that will produce the target color
 */
function generateIdForColor(targetColor: string, seed: string): string {
  // Import the COLORS array from colorUtils
  const { COLORS } = require('./colorUtils');
  
  // Find the index of the target color in the COLORS array
  const colorIndex = COLORS.indexOf(targetColor);
  
  if (colorIndex === -1) {
    // If the color isn't in our standard palette, just return a random ID
    return seed + Math.random().toString(36).substr(2, 6);
  }
  
  // Create a deterministic ID that will hash to the desired color index
  // Include the seed in the ID to ensure uniqueness across different import operations
  let id = seed;
  
  // Calculate the current hash
  let currentHash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let currentIndex = currentHash % COLORS.length;
  
  // Calculate how many to add to get to our target
  let toAdd = (colorIndex - currentIndex + COLORS.length) % COLORS.length;
  
  // Add a character with the right charCode to get us to the target index
  if (toAdd > 0) {
    id += String.fromCharCode(toAdd);
  }
  
  return id;
}

/**
 * Parse a CSV row handling quoted values
 * @param row The CSV row as a string
 * @returns Array of cell values
 */
function parseCSVRow(row: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      // Handle double quotes inside quoted strings
      if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}
