import puppeteer from 'puppeteer';  // Importing puppeteer for web scraping
import fs from 'fs';  // Importing fs (file system) module to work with the file system
import { format } from '@fast-csv/format';  // Importing format from fast-csv for CSV formatting

(async () => {
    const browser = await puppeteer.launch({ headless: false });  // Launching a new browser instance in non-headless mode
    const page = await browser.newPage();  // Opening a new page in the browser
    
    const allQuotes = [];  // Array to store all scraped quotes
    let currentPage = 1;  // Starting page number
    const maxPages = 10;  // Maximum number of pages to scrape
    
    try {
        while (currentPage <= maxPages) {
            const url = `https://quotes.toscrape.com/page/${currentPage}/`;  // Constructing the URL for the current page
            await page.goto(url, {
                waitUntil: "networkidle2",  // Wait until there are no more than 2 network connections for at least 500 ms
                timeout: 60000  // Set the timeout to 60 seconds
            });

            // Evaluate function to scrape quotes from the page
            const quotes = await page.evaluate(() => {
                const quoteElements = Array.from(document.querySelectorAll(".col-md-8 .quote"));  // Select all quote elements
                return quoteElements.map(quote => {
                    const Quote = quote.querySelector(".text")?.textContent.trim();  // Extract quote text
                    const Author = quote.querySelector(".author")?.textContent.trim();  // Extract author name
                    const tagElements = Array.from(quote.querySelectorAll(".tags a.tag"));  // Select all tag elements
                    const tags = tagElements.map(tag => tag.textContent.trim());  // Extract tag text
                    return { Quote, Author, tags };  // Return an object containing the quote, author, and tags
                });
            });

            allQuotes.push(...quotes);  // Add scraped quotes to the allQuotes array
            console.log(`Page ${currentPage} scraped successfully.`);  // Log success message

            currentPage++;  // Increment page number
        }
    } catch (error) {
        console.error(`Error occurred while scraping: ${error.message}`);  // Log error message if an error occurs
    } finally {
        await browser.close();  // Close the browser
        console.log(`Scraping complete. Total quotes scraped: ${allQuotes.length}`);  // Log total number of scraped quotes
        
        // Export to CSV
        const csvStream = format({ headers: true });  // Create a CSV stream with headers
        const writableStream = fs.createWriteStream('quotes.csv');  // Create a writable stream for the CSV file

        writableStream.on('finish', () => {
            console.log('CSV file has been written successfully.');  // Log success message when the CSV file is written
        });

        csvStream.pipe(writableStream);  // Pipe the CSV stream to the writable stream
        allQuotes.forEach(quote => {
            csvStream.write(quote);  // Write each quote to the CSV file
        });
        csvStream.end();  // End the CSV stream

        console.log(allQuotes);  // Log all scraped quotes
    }
})();
