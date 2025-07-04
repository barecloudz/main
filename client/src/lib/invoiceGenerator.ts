import { jsPDF } from 'jspdf';
import { Invoice, User } from '@shared/schema';
import { format } from 'date-fns';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface GenerateInvoiceOptions {
  invoice: Invoice;
  client: User;
}

export const generateInvoicePDF = ({ invoice, client }: GenerateInvoiceOptions): Blob => {
  const doc = new jsPDF();
  const items = invoice.items as InvoiceItem[];
  
  // Company details
  const companyLogo = "data:image/svg+xml;base64,..."; // Base64 encoded SVG logo
  const companyName = "BareCloudz Marketing Agency";
  const companyAddress = "123 Marketing St, Suite 100";
  const companyCity = "San Francisco, CA 94103";
  const companyEmail = "billing@barecloudz.com";
  const companyPhone = "(555) 123-4567";
  
  // Set up document
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // primary blue
  doc.text("INVOICE", 20, 30);
  
  // Logo
  //doc.addImage(companyLogo, 'PNG', 150, 15, 40, 20);
  
  // Company information
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(companyName, 20, 45);
  doc.text(companyAddress, 20, 50);
  doc.text(companyCity, 20, 55);
  doc.text(companyEmail, 20, 60);
  doc.text(companyPhone, 20, 65);
  
  // Invoice details
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 130, 45);
  doc.text(`Date: ${format(new Date(invoice.createdAt), 'MMM dd, yyyy')}`, 130, 50);
  doc.text(`Due Date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}`, 130, 55);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 130, 60);
  
  // Bill To
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text("Bill To:", 20, 80);
  
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
  doc.text(clientName || client.email || '', 20, 85);
  doc.text(client.company || '', 20, 90);
  doc.text(client.email || '', 20, 95);
  
  // Invoice items table
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(59, 130, 246);
  doc.rect(20, 110, 170, 10, 'F');
  
  // Table headers
  doc.text("Description", 25, 117);
  doc.text("Quantity", 100, 117);
  doc.text("Unit Price", 130, 117);
  doc.text("Amount", 170, 117);
  
  // Table content
  doc.setTextColor(50, 50, 50);
  let yPos = 130;
  
  items.forEach((item, index) => {
    doc.text(item.description, 25, yPos);
    doc.text(item.quantity.toString(), 100, yPos);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 130, yPos);
    doc.text(`$${item.amount.toFixed(2)}`, 170, yPos, { align: 'right' });
    
    if (index < items.length - 1) {
      yPos += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos - 5, 190, yPos - 5);
    }
    
    yPos += 10;
  });
  
  // Total
  yPos += 10;
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text("Total", 130, yPos);
  doc.text(`$${invoice.amount.toString()}`, 170, yPos, { align: 'right' });
  
  // Notes
  if (invoice.notes) {
    yPos += 20;
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Notes", 20, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(invoice.notes, 20, yPos, { maxWidth: 170 });
  }
  
  // Payment information
  yPos = Math.max(yPos + 30, 230);
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text("Payment Information", 20, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.text("Bank: National Bank", 20, yPos);
  
  yPos += 5;
  doc.text("Account Name: BareCloudz Marketing", 20, yPos);
  
  yPos += 5;
  doc.text("Account Number: XXXX-XXXX-XXXX-1234", 20, yPos);
  
  yPos += 5;
  doc.text("Routing Number: XXXXXX123", 20, yPos);
  
  // Thank you message
  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.text("Thank you for your business!", 20, yPos);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy')}`, 20, 280);
  doc.text("© BareCloudz Marketing Agency", 100, 280, { align: 'center' });
  doc.text("Page 1 of 1", 190, 280, { align: 'right' });
  
  return doc.output('blob');
};

export const downloadInvoice = (invoiceBlob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(invoiceBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
