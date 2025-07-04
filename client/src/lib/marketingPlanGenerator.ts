import { jsPDF } from 'jspdf';
import { MarketingPlan, User } from '@shared/schema';
import { format } from 'date-fns';

interface GenerateMarketingPlanOptions {
  plan: MarketingPlan;
  client: User;
}

export const generateMarketingPlanPDF = ({ plan, client }: GenerateMarketingPlanOptions): Blob => {
  // Initialize PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set document properties
  doc.setProperties({
    title: `Marketing Plan - ${plan.title}`,
    author: 'BareCloudz Marketing',
    creator: 'BareCloudz Marketing Platform'
  });

  // Check if this is Favilla's Pizza plan
  if (plan.title && plan.title.includes("Favilla") && plan.title.includes("Pizza")) {
    return generateFavillasPizzaPlan(doc, plan);
  } else {
    return generateStandardPlan(doc, plan, client);
  }
};

function generateFavillasPizzaPlan(doc: jsPDF, plan: MarketingPlan): Blob {
  // Header
  doc.setFontSize(24);
  doc.setTextColor(53, 198, 119); // #35c677 green
  doc.text("MARKETING PLAN", 20, 30);
  
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.setFontSize(16);
  doc.text("Favilla's New York Pizza: Full-Scale Marketing Plan", 20, 40);
  
  // Core objectives
  doc.setFontSize(14);
  doc.setTextColor(53, 198, 119); // #35c677 green
  doc.text("Core Objectives", 20, 55);
  
  doc.setFontSize(11);
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.text("• Increase brand visibility in the local area", 25, 65);
  doc.text("• Boost sales via catering orders and dine-in/takeout", 25, 72);
  doc.text("• Build email/SMS list for long-term marketing", 25, 79);
  doc.text("• Drive traffic to the website via SEO and QR codes", 25, 86);
  doc.text("• Establish local partnerships for ongoing exposure", 25, 93);
  
  // Marketing strategy sections
  doc.setFontSize(14);
  doc.setTextColor(53, 198, 119); // #35c677 green
  doc.text("Marketing Strategies", 20, 108);
  
  // Strategy 1
  doc.setFontSize(13);
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.text("1. Menu Imaging", 22, 118);
  
  doc.setFontSize(11);
  doc.text("• Professional photo shoot of all menu items", 25, 125);
  doc.text("• Images for website, social media, and printed materials", 25, 132);
  doc.text("• Organize by category for easy asset use", 25, 139);
  
  // Strategy 2
  doc.setFontSize(13);
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.text("2. Catering Setup", 22, 149);
  
  doc.setFontSize(11);
  doc.text("• Create catering menu with package options", 25, 156);
  doc.text("• Add online catering request form on website", 25, 163);
  doc.text("• Promote for office lunches, events, and parties", 25, 170);
  doc.text("• Offer first-time order discounts", 25, 177);
  
  // Add a new page
  doc.addPage();
  
  // Strategy 3
  doc.setFontSize(13);
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.text("3. Catering Giveaway Contest", 22, 20);
  
  doc.setFontSize(11);
  doc.text("• Pizza party giveaway for 20 people", 25, 27);
  doc.text("• Promote via social media and email", 25, 34);
  doc.text("• Entry methods include email signup and social engagement", 25, 41);
  doc.text("• Draw winner live on social media", 25, 48);
  
  // Strategy 4
  doc.setFontSize(13);
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.text("4. Digital Marketing", 22, 58);
  
  doc.setFontSize(11);
  doc.text("Social Media Marketing:", 25, 65);
  doc.text("• Instagram, Facebook, TikTok content", 27, 72);
  doc.text("• Behind-the-scenes food prep and customer testimonials", 27, 79);
  
  doc.text("Paid Advertising:", 25, 89);
  doc.text("• Target local users within 5-10 miles", 27, 96);
  doc.text("• Video clips, promos, and retargeting campaigns", 27, 103);
  
  doc.text("Email Marketing:", 25, 113);
  doc.text("• Weekly emails with specials and loyalty rewards", 27, 120);
  
  doc.text("SEO Optimization:", 25, 130);
  doc.text("• Local search keywords and Google My Business", 27, 137);
  
  // Add a third page
  doc.addPage();
  
  // Strategy 5
  doc.setFontSize(13);
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.text("5. Physical Marketing", 22, 20);
  
  doc.setFontSize(11);
  doc.text("Plaza Signage:", 25, 27);
  doc.text("• Improve visibility with effective signage", 27, 34);
  doc.text("• Include NY-Style Pizza branding and QR codes", 27, 41);
  
  doc.text("Paper Menus:", 25, 51);
  doc.text("• Professional full-color menu printing", 27, 58);
  doc.text("• Include catering packages and social handles", 27, 65);
  doc.text("• Add loyalty program punch card", 27, 72);
  
  // Strategy 6
  doc.setFontSize(13);
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.text("6. Local Partnerships", 22, 82);
  
  doc.setFontSize(11);
  doc.text("• Partner with local businesses for cross-promotion", 25, 89);
  doc.text("• Provide samples in exchange for menu display", 25, 96);
  doc.text("• Create business drop-off kits with promotional materials", 25, 103);
  
  // Launch timeline
  doc.setFontSize(13);
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.text("Launch Timeline", 22, 113);
  
  doc.setFontSize(10);
  doc.text("Week 1: Photo shoot, catering menu finalized", 25, 120);
  doc.text("Week 2: Launch contest, run initial social ads", 25, 127);
  doc.text("Week 3: Print materials, begin business partnerships", 25, 134);
  doc.text("Week 4: Website updates, catering form implementation", 25, 141);
  doc.text("Week 5+: Ongoing campaign management and optimization", 25, 148);
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`BareCloudz Marketing Agency - Confidential - Page ${i} of ${pageCount}`, 20, 285);
  }
  
  return doc.output('blob');
}

function generateStandardPlan(doc: jsPDF, plan: MarketingPlan, client: User): Blob {
  // Company details
  const companyName = "BareCloudz Marketing Agency";
  const companyAddress = "123 Marketing St, Suite 100";
  const companyCity = "San Francisco, CA 94103";
  const companyEmail = "contact@barecloudz.com";
  const companyPhone = "(555) 123-4567";
  
  // Regular header
  doc.setFontSize(24);
  doc.setTextColor(53, 198, 119); // #35c677 green
  doc.text("MARKETING PLAN", 20, 30);
  
  // Company information
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(companyName, 20, 45);
  doc.text(companyAddress, 20, 50);
  doc.text(companyCity, 20, 55);
  doc.text(companyEmail, 20, 60);
  doc.text(companyPhone, 20, 65);
  
  // Plan details
  doc.setFontSize(12);
  doc.setTextColor(25, 25, 25); // #191919 dark
  doc.text(`Plan Title: ${plan.title}`, 130, 45);
  doc.text(`Created: ${format(new Date(plan.createdAt || new Date()), 'MMM dd, yyyy')}`, 130, 50);
  doc.text(`Status: ${plan.status || 'DRAFT'}`, 130, 55);
  doc.text(`Timeline: ${plan.timeline}`, 130, 60);
  
  // Client Info
  doc.setFontSize(14);
  doc.setTextColor(53, 198, 119); // #35c677 green
  doc.text("Prepared For:", 20, 80);
  
  doc.setFontSize(12);
  doc.setTextColor(25, 25, 25); // #191919 dark
  const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
  doc.text(clientName || client.email || '', 20, 85);
  doc.text(client.company || '', 20, 90);
  doc.text(client.email || '', 20, 95);
  
  // Plan overview
  doc.setFontSize(14);
  doc.setTextColor(53, 198, 119); // #35c677 green
  doc.text("Marketing Plan Overview", 20, 110);
  
  doc.setFontSize(12);
  doc.setTextColor(25, 25, 25); // #191919 dark
  let yPos = 120;
  
  doc.text(`Business Type: ${plan.businessType}`, 20, yPos);
  yPos += 7;
  doc.text(`Primary Goal: ${plan.goalsPrimary}`, 20, yPos);
  yPos += 7;
  doc.text(`Target Audience: ${plan.audience}`, 20, yPos);
  yPos += 7;
  doc.text(`Budget Range: ${plan.budget}`, 20, yPos);
  
  if (plan.competitors) {
    yPos += 7;
    doc.text(`Key Competitors: ${plan.competitors}`, 20, yPos);
  }
  
  // Marketing strategies
  yPos += 15;
  doc.setFontSize(14);
  doc.setTextColor(53, 198, 119); // #35c677 green
  doc.text("Marketing Strategies", 20, yPos);
  
  yPos += 10;
  
  const strategies = plan.strategies as any[] || [];
  
  if (strategies && strategies.length > 0) {
    strategies.forEach((strategy, index) => {
      // Strategy header
      doc.setFontSize(13);
      doc.setTextColor(25, 25, 25); // #191919 dark
      doc.text(`${index + 1}. ${strategy.title}`, 20, yPos);
      
      yPos += 7;
      doc.setFontSize(10);
      doc.text(`${strategy.description}`, 25, yPos, { maxWidth: 170 });
      
      // Calculate text height based on description length
      const descriptionLines = Math.ceil(strategy.description.length / 100);
      yPos += descriptionLines * 5 + 5;
      
      // Key tasks
      doc.setFontSize(11);
      doc.text('Key Tasks:', 25, yPos);
      yPos += 7;
      
      if (strategy.tasks && strategy.tasks.length > 0) {
        strategy.tasks.forEach((task: string) => {
          doc.setFontSize(10);
          doc.text(`• ${task}`, 30, yPos);
          yPos += 6;
        });
      }
      
      // Timeline
      yPos += 3;
      doc.setFontSize(11);
      doc.text(`Timeline: ${strategy.timeline}`, 25, yPos);
      yPos += 7;
      
      // Success metrics
      doc.text('Success Metrics:', 25, yPos);
      yPos += 7;
      
      if (strategy.metrics && strategy.metrics.length > 0) {
        strategy.metrics.forEach((metric: string) => {
          doc.setFontSize(10);
          doc.text(`• ${metric}`, 30, yPos);
          yPos += 6;
        });
      }
      
      // Add space between strategies
      yPos += 7;
      
      // Add new page if needed
      if (yPos > 260 && index < strategies.length - 1) {
        doc.addPage();
        yPos = 20;
      }
    });
  } else {
    doc.setFontSize(11);
    doc.text('No marketing strategies defined.', 25, yPos);
  }
  
  // Additional information
  if (plan.additionalInfo) {
    // Check if we need to add a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(53, 198, 119); // #35c677 green
    doc.text("Additional Information", 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(25, 25, 25); // #191919 dark
    
    // Properly handle text wrapping and pagination for notes
    const additionalInfoLines = doc.splitTextToSize(plan.additionalInfo, 170);
    const linesPerPage = 35; // Approximate number of lines that fit on a page
    
    // Check if we need multiple pages for the notes
    if (additionalInfoLines.length > linesPerPage) {
      let currentPage = 0;
      while (currentPage * linesPerPage < additionalInfoLines.length) {
        if (currentPage > 0) {
          doc.addPage();
          yPos = 20;
        }
        
        const startLine = currentPage * linesPerPage;
        const endLine = Math.min((currentPage + 1) * linesPerPage, additionalInfoLines.length);
        const pageLinesSubset = additionalInfoLines.slice(startLine, endLine);
        
        doc.text(pageLinesSubset, 20, yPos);
        currentPage++;
      }
    } else {
      doc.text(additionalInfoLines, 20, yPos);
    }
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy')}`, 20, 280);
  doc.text("© BareCloudz Marketing Agency", 100, 280, { align: 'center' });
  doc.text("Confidential", 190, 280, { align: 'right' });
  
  return doc.output('blob');
}

export const downloadMarketingPlan = (planBlob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(planBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareMarketingPlan = async (planId: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/marketing-plans/${planId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to share marketing plan');
    }
    
    return true;
  } catch (error) {
    console.error('Error sharing marketing plan:', error);
    return false;
  }
};