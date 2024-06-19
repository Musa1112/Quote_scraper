# Quote_scraper
This script scrapes quotes from quotes.toscrape.com using Puppeteer, and saves them into a CSV file using fast-csv.

# clone the repo below
# https://github.com/Musa1112/Quote_scraper,

Prerequisites
Node.js (version 14 or higher)
npm (Node Package Manager)


go to terminal and write the following to install the packages

1. npm init -y
2. npm i puppeteer
3. npm i @fast-csv/format

also go to the package.json file and add "type": "module",
for the code to work in E6 module (import).

# To run the scraper, execute the following command:
node scrape_quote.js
This will launch a browser, navigate through up to 10 pages of quotes, scrape them

# code explanation
```js
1. importing modules
2. import puppeteer from 'puppeteer';  // Importing puppeteer for web scraping
3. import fs from 'fs';  // Importing fs (file system) module to work with the file system
4. import { format } from '@fast-csv/format';  // Importing format from fast-csv for CSV formatting

```
The main function is an immediately invoked async function that handles the entire scraping process.
Main Function:

1. Launches a new Puppeteer browser instance in non-headless mode for debugging purposes.
2. Opens a new browser page.
3. Initializes an empty array to store scraped quotes.
4. Defines currentPage to track the current page number and maxPages to set the maximum number of pages to scrape.
5. Uses a try block to handle the scraping logic.
In the while loop:
6. Constructs the URL for the current page.
7. Navigates to the URL, waiting until there are no more than 2 network connections for at least 500 ms.
8. Uses the evaluate function to scrape quotes from the page:
9. Selects all quote elements.
10. Maps over the elements to extract the quote text, author name, and tags.
11. Returns an object containing the quote, author, and tags.
12. Adds the scraped quotes to the allQuotes array.
13. Logs a success message for the current page.
14. Increments the page number.
15. In the catch block, logs any errors that occur during the scraping process.
16. In the finally block:
17. Closes the browser.
18. Logs the total number of scraped quotes.
19. Creates a CSV stream with headers.
20. Creates a writable stream for the CSV file.
21. Logs a success message when the CSV file is written.
22. Pipes the CSV stream to the writable stream.
23. Writes each quote to the CSV file.
24. Ends the CSV stream.
25. Logs all scraped quotes.

```js
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

```