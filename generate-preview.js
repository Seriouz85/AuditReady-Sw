const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePreview() {
  console.log('Generating preview image...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to match OG image dimensions
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2 // Higher resolution
    });
    
    // Get the absolute path to the HTML file
    const htmlPath = path.join(__dirname, 'og-image.html');
    const fileUrl = `file://${htmlPath}`;
    
    // Load the HTML file
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    // Take a screenshot
    const screenshotPath = path.join(__dirname, '../dist/preview.png');
    await page.screenshot({
      path: screenshotPath,
      type: 'png',
      quality: 100
    });
    
    console.log(`Preview image generated at: ${screenshotPath}`);
    
  } catch (error) {
    console.error('Error generating preview:', error);
  } finally {
    await browser.close();
  }
}

generatePreview().catch(console.error); 