const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Puppeteer API Running on Koyeb");
});

app.get("/account-info", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath || '/usr/bin/google-chrome',
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto("https://www.hlgamingofficial.com", { waitUntil: "networkidle2" });

    console.log("Waiting for reCAPTCHA solve...");

    await page.waitForTimeout(30000); // Allow time for manual solve if testing locally

    const token = await page.evaluate(() => {
      return typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : null;
    });

    if (!token) {
      await browser.close();
      return res.status(400).json({ error: "reCAPTCHA token not found" });
    }

    console.log("Token:", token);

    const apiUrl = "https://client-hlgamingofficial.vercel.app/api/ff-hl-gaming-official-api-account-v2-latest/account";

    const data = {
      key: "FFwlx",
      region: "sg",
      uid: "12345678",
    };

    const headers = {
      "Accept": "*/*",
      "Content-Type": "application/json",
      "Origin": "https://www.hlgamingofficial.com",
      "Referer": "https://www.hlgamingofficial.com/",
      "x-recaptcha-token": token,
    };

    const apiResponse = await axios.post(apiUrl, data, { headers });

    await browser.close();

    return res.json({ apiResponse: apiResponse.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
