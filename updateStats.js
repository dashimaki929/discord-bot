const fs = require("fs");
const Puppeteer = require("puppeteer");

(async () => {
  const champions = {};
  console.log(">>>> Fetching start... >>>>");

  const browser = await Puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    timeout: 10000,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("http://na.op.gg/champion/statistics");

  const elements = await page.$$("div[data-champion-name]");
  for (let i = 0; i < elements.length; i++) {
    if (i % 10 === 9) {
      console.log(`\t${i + 1} / ${elements.length}`);
    }

    let element;
    element = await elements[i].$("a");
    if (!element) {
      element = await elements[i];
    }

    let engName;
    try {
      const hrefProp = await element.getProperty("href");
      const href = await hrefProp.jsonValue();
      engName = href.split("/")[4];
    } catch {
      const imgElem = await element.$('[class*="image"] > img');
      const srcProp = await imgElem.getProperty("src");
      const src = await srcProp.jsonValue();
      engName = src
        .match(/[^\/]*\.png/)
        .map((text) => text.split(".")[0].toLowerCase())[0];
    }

    const nameElem = await element.$('[class*="name"]');
    const nameProp = await nameElem.getProperty("textContent");
    const jpnName = await nameProp.jsonValue();

    champions[jpnName] = engName;

    const imageElem = await element.$('[class*="image"]');
    await imageElem.screenshot({
      path: `./images/lol/champions/${engName}.png`,
    });
  }
  console.log("<<<< Fetching finished <<<<");

  console.log(">>>> Writing start...  >>>>");
  fs.writeFileSync(
    "./config/lol-champions.json",
    JSON.stringify(champions, null, "\t")
  );
  console.log("<<<< Writing finished  >>>>");

  browser.close();
})();
