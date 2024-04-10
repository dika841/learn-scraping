import puppeteer from "puppeteer";
import { createObjectCsvWriter } from 'csv-writer'

const dataBookCsv = createObjectCsvWriter({
    path: './dataBooks.csv',
    header: [
        {id: 'booksName', title: 'Name'},
        {id: 'booksPrice', title: 'Price'},
        {id: 'valideUrl', title: 'Url'},
        {id: 'booksStarValue', title: 'Star Rating'},
        {id: 'validImageUrl', title: 'Image Url'},
    ]
})

const bot = {
  browser: null,
  page: null,
  init: async () => {
    bot.browser = await puppeteer.launch({ headless: true });
    bot.page = await bot.browser.newPage();
  },
  close: async () => {
    await bot.browser.close();
  },
  start: async () => {
    for (let i = 1; i < 50; i++) {
      const url = "https://books.toscrape.com/catalogue/page-" + i + ".html";
      await bot.page.goto(url, { waitUntil: "networkidle2" });
      await bot.scrape();
      bot.close
    }
  },
  scrape: async () => {
    const target = await bot.page.$$("li.col-xs-6.col-sm-4.col-md-3.col-lg-3");
    for (const item of target) {
      try {
        //books url
        const bookUrl = await item.$eval("div.image_container a", (el) =>
          el.getAttribute("href")
        );
        const valideUrl = `https://books.toscrape.com/catalogue/${bookUrl}`;
        //books name
        const booksName = await item.$eval("h3 a", (el) =>
          el.getAttribute("title")
        );
        //books price
        const booksPrice = await item.$eval(
          "p.price_color",
          (el) => el.textContent
        );
        //books star
        const booksStar = await item.$eval(
          "article.product_pod p.star-rating",
          (el) => el.getAttribute("class")
        );
        const booksStarValue = booksStar.split(" ")[1];
        const booksStarValueFix = bot.fixValue(booksStarValue);

        //books Image Url
        const bookImageUrl = await item.$eval("div.image_container img", (el) =>
          el.getAttribute("src")
        );
        const fixImageUrl = bookImageUrl.split("/");
        fixImageUrl.shift();
        const bookImageUrlFix = fixImageUrl.join("/");
        const validImageUrl = `https://books.toscrape.com/${bookImageUrlFix}`;

        console.log({
          name: booksName,
          price: booksPrice,
          url: valideUrl,
          starRating: booksStarValueFix,
          imageUrl: validImageUrl,
        });

        const data = [];
        data.push({
            booksName,
            booksPrice,
            valideUrl,
            booksStarValue:booksStarValueFix,
            validImageUrl
        })
        dataBookCsv
            .writeRecords(data)
            .then(() => console.log('The CSV file was written successfully'));
      } catch (error) {
        console.log(error);
      }
    }
  },

  fixValue: (val) => {
    let newVal = 0;
    switch (val) {
      case "One":
        newVal = 1;
        break;
      case "Two":
        newVal = 2;
        break;
      case "Three":
        newVal = 3;
        break;
      case "Four":
        newVal = 4;
        break;
      case "Five":
        newVal = 5;
        break;
      default:
        break;
    }
    return newVal;
  },
};

export default bot;
