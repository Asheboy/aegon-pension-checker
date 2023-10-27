const puppeteer = require("puppeteer");
const { spawn } = require("child_process");

const email = process.env.EMAIL;
const password = process.env.PASSWORD;
const wirepusherId = process.env.WIREPUSHER_ID;

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.goto(
      "https://extranet.secure.aegon.co.uk/login/showLoginPgAction.do?method=showLoginPage&loginStyle=PH"
    );
    await page.type("#inputUserId", email);
    await page.type("#inputPassword", password);
    await Promise.all([page.click(".btn-primary"), page.waitForNavigation()]);

    await new Promise((r) => setTimeout(r, 3000));

    await Promise.all([
      page.click("td > a"),
      page.waitForNavigation({ timeout: 120000 }),
    ]);

    let value = await page.$eval(".leftJustifyStyle", (i) => i.innerText);
    console.log("value", value);
    spawn("notify-send", [value]);
    await fetch(
      `https://wirepusher.com/send?id=${wirepusherId}&title=Pension&message=${value}&type=pension`
    );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
