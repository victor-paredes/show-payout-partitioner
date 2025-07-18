import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getRecipientColor, COLORS } from "./colorUtils";

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
 * @param groups An array of groups with color and expanded status
 */
export const exportToCsv = (
  recipients: Array<{id: string; name: string; value: number; type?: string; payout: number; color?: string; groupId?: string}>,
  totalPayout: number,
  defaultFileName: string,
  groups?: Array<{id: string; name: string; color: string; expanded: boolean}>
) => {
  try {
    // Ask user for file name
    const fileName = prompt("Enter a name for your CSV file", defaultFileName) || defaultFileName;
    
    // Create CSV header row for recipients
    const headers = ['Name', 'Type', 'Value', 'Payout ($)', 'Percentage (%)', 'Color', 'GroupID'];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    recipients.forEach(recipient => {
      const type = recipient.type || (recipient.value ? 'shares' : '$');
      const percentage = totalPayout > 0 
        ? ((recipient.payout / totalPayout) * 100).toFixed(2) 
        : '0';
      
      // Use the recipient's custom color if available, otherwise use the generated color
      const color = recipient.color || getRecipientColor(recipient.id);
      
      // Format the row data and handle special characters
      const row = [
        `"${recipient.name.replace(/"/g, '""')}"`, // Escape quotes in names
        `"${type}"`,
        recipient.value.toString(),
        recipient.payout.toFixed(2),
        percentage,
        `"${color}"`,
        `"${recipient.groupId || ''}"`
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Add total row
    csvContent += `"Total",,,"${totalPayout.toFixed(2)}","100.00",\n`;
    
    // Add a special marker row with the total payout for import purposes
    csvContent += `"__TOTAL_PAYOUT__",,"${totalPayout.toFixed(2)}",,\n`;
    
    // Add group information if available
    if (groups && groups.length > 0) {
      // Add a separator
      csvContent += '\n';
      
      // Add group header row
      const groupHeaders = ['__GROUP_DATA__', 'ID', 'Name', 'Color', 'Expanded'];
      csvContent += groupHeaders.join(',') + '\n';
      
      // Add group data
      groups.forEach(group => {
        const groupRow = [
          '"__GROUP_DATA__"',
          `"${group.id}"`,
          `"${group.name.replace(/"/g, '""')}"`,
          `"${group.color}"`,
          group.expanded ? 'true' : 'false'
        ];
        
        csvContent += groupRow.join(',') + '\n';
      });
    }
    
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
 * Validates if the content appears to be a valid CSV file
 * @param content The CSV string content to validate
 * @returns boolean indicating if content appears to be valid CSV
 */
function validateCsvContent(content: string): boolean {
  // Check if the content is too large (e.g., over 1MB)
  if (content.length > 1024 * 1024) {
    throw new Error("CSV file is too large. Maximum size is 1MB.");
  }
  
  // Basic structure check - should have at least header row and one data row
  const rows = content.split('\n');
  if (rows.length < 2) {
    return false;
  }
  
  // Header row should have several columns
  const headerCells = parseCSVRow(rows[0]);
  if (headerCells.length < 3) {
    return false;
  }
  
  // Check for required column headers
  const headerNames = headerCells.map(h => h.toLowerCase());
  if (!headerNames.includes('name')) {
    return false;
  }
  
  return true;
}

/**
 * Sanitizes a string to prevent XSS attacks
 * @param input The string to sanitize
 * @returns Sanitized string
 */
function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Basic sanitization - replace HTML special chars
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/**
 * Imports recipients data from a CSV string with enhanced security
 * @param csvString The CSV content as a string
 * @returns An array of recipient objects and the total payout if available
 */
export const importFromCsv = async (
  csvString: string
): Promise<{
  importedData: Array<{id: string; name: string; value: number; type?: string; payout: number; color?: string; groupId?: string}>;
  importedGroups?: Array<{id: string; name: string; color: string; expanded: boolean}>;
  importedTotalPayout?: number;
}> => {
  try {
    // Validate basic CSV structure
    if (!validateCsvContent(csvString)) {
      throw new Error("Invalid CSV format. Please check your file.");
    }
    
    // Split the CSV into rows
    const rows = csvString
      .split('\n')
      .map(row => row.trim())
      .filter(row => row); // Remove empty rows
      
    if (rows.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row");
    }
    
    // Parse the header row to identify column indices for recipients
    const headers = parseCSVRow(rows[0]);
    
    const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
    const typeIndex = headers.findIndex(h => h.toLowerCase() === 'type');
    const valueIndex = headers.findIndex(h => h.toLowerCase() === 'value');
    const colorIndex = headers.findIndex(h => h.toLowerCase() === 'color');
    const groupIdIndex = headers.findIndex(h => h.toLowerCase() === 'groupid');
    
    if (nameIndex === -1) {
      throw new Error("CSV must contain a 'Name' column");
    }
    
    // Log column indices for debugging
    console.log("Column indices:", { 
      nameIndex, 
      typeIndex, 
      valueIndex, 
      colorIndex,
      groupIdIndex
    });
    
    // Look for total payout marker
    let importedTotalPayout: number | undefined = undefined;
    for (let i = 1; i < rows.length; i++) {
      const rowData = parseCSVRow(rows[i]);
      if (rowData[nameIndex] === '__TOTAL_PAYOUT__' && rowData.length > 2) {
        const payoutValue = parseFloat(rowData[2]);
        if (!isNaN(payoutValue) && payoutValue >= 0 && payoutValue <= 1000000000) {
          importedTotalPayout = payoutValue;
        }
        break;
      }
    }
    
    // Generate a timestamp-based prefix for IDs to ensure they're different from previous imports
    const idPrefix = Date.now().toString(36);
    
    // Process data rows (skip header, total and marker rows)
    const recipients = [];
    const groups: Array<{id: string; name: string; color: string; expanded: boolean}> = [];
    let colorsImported = 0;
    let rowCount = 0;
    const MAX_ROWS = 1000; // Limit number of rows to prevent DoS
    let inGroupSection = false;
    
    for (let i = 1; i < rows.length && rowCount < MAX_ROWS; i++) {
      const rowData = parseCSVRow(rows[i]);
      
      // Check if we've entered the group data section
      if (rowData[0] === '__GROUP_DATA__') {
        inGroupSection = true;
        
        // If this is the header row for groups, continue to the next row
        if (rowData[1] === 'ID') continue;
        
        // Process group data
        if (rowData.length >= 5) {
          const groupId = rowData[1].replace(/^["']|["']$/g, '').trim();
          const groupName = sanitizeString(rowData[2].replace(/^["']|["']$/g, '').trim() || 'Unnamed Group');
          const groupColor = rowData[3].replace(/^["']|["']$/g, '').trim();
          const isExpanded = rowData[4].toLowerCase() === 'true';
          
          groups.push({
            id: groupId,
            name: groupName,
            color: groupColor,
            expanded: isExpanded
          });
        }
        
        continue;
      }
      
      // Skip if we're in the group section or if this appears to be a total row or the marker row
      if (inGroupSection || 
          rowData[nameIndex]?.toLowerCase() === 'total' || 
          rowData[nameIndex] === '__TOTAL_PAYOUT__') continue;
      
      if (rowData.length >= Math.max(nameIndex, typeIndex, valueIndex) + 1) {
        // Sanitize the name - prevent XSS
        const name = sanitizeString(rowData[nameIndex] || 'Unnamed Recipient');
        
        // Determine recipient type and value
        const type = typeIndex !== -1 ? rowData[typeIndex] : 'shares';
        
        // Safely parse the value with limits to prevent memory/calculation issues
        let value = 1;
        if (valueIndex !== -1 && rowData[valueIndex]) {
          const parsedValue = parseFloat(rowData[valueIndex]);
          if (!isNaN(parsedValue)) {
            // Cap values to reasonable ranges to prevent overflow issues
            if (type === '$') {
              // For dollar values, cap at a billion
              value = Math.min(Math.max(parsedValue, 0), 1000000000);
            } else if (type === '%') {
              // For percentages, cap at 100%
              value = Math.min(Math.max(parsedValue, 0), 100);
            } else {
              // For shares, cap at a million
              value = Math.min(Math.max(parsedValue, 0), 1000000);
            }
          }
        }
        
        // Get color if available - improved color extraction with validation
        let color = undefined;
        if (colorIndex !== -1 && colorIndex < rowData.length) {
          // Clean up the color value
          const rawColor = rowData[colorIndex];
          if (rawColor && rawColor.trim() !== '') {
            color = rawColor.replace(/^["']|["']$/g, '').trim();
            
            // Validate it's a proper color format (hex code or named color)
            if (!/^#[0-9A-F]{6}$/i.test(color) && !COLORS.includes(color)) {
              console.warn(`Invalid color format: ${color}, using generated color instead`);
              color = undefined;
            } else {
              colorsImported++;
            }
          }
        }
        
        // Get groupId if available
        let groupId = undefined;
        if (groupIdIndex !== -1 && groupIdIndex < rowData.length) {
          const rawGroupId = rowData[groupIdIndex];
          if (rawGroupId && rawGroupId.trim() !== '') {
            groupId = rawGroupId.replace(/^["']|["']$/g, '').trim();
            if (groupId === '') {
              groupId = undefined;
            }
          }
        }
        
        // Create the recipient object with explicit color property
        const recipient = {
          id: `${idPrefix}-${i}`,
          name,
          value,
          type: type as ("shares" | "$" | "%"),
          payout: 0, // Payout will be calculated later
          isFixedAmount: type === "$",
          // Only set color if it's valid
          ...(color ? { color } : {}),
          // Add groupId if it exists
          ...(groupId ? { groupId } : {})
        };
        
        recipients.push(recipient);
        rowCount++;
      }
    }
    
    // If we reached our limit, log a warning
    if (rowCount >= MAX_ROWS) {
      console.warn(`CSV import reached the maximum limit of ${MAX_ROWS} rows. Some data may have been truncated.`);
    }
    
    console.log(`Import summary: ${colorsImported} of ${recipients.length} recipients have custom colors`);
    console.log(`Imported ${groups.length} groups`);
    
    return { 
      importedData: recipients, 
      importedGroups: groups.length > 0 ? groups : undefined,
      importedTotalPayout 
    };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
};

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
