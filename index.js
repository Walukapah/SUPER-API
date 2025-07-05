const express = require("express");
const puppeteer = require("puppeteer");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("HL Gaming Puppeteer API Running!");
});

app.get("/account-info", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.hlgamingofficial.com", { waitUntil: "networkidle2" });

    console.log("🛑 Please solve the reCAPTCHA manually in the opened browser...");

    await page.waitForTimeout(30000); // 30 seconds to solve reCAPTCHA manually

    const token = await page.evaluate(() => {
      if (typeof grecaptcha !== "undefined") {
        return grecaptcha.getResponse();
      }
      return null;
    });

    if (!token) {
      await browser.close();
      return res.status(400).json({ error: "reCAPTCHA token not found!" });
    }

    console.log("✅ reCAPTCHA Token Collected:", token);

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

    const response = await axios.post(apiUrl, data, { headers });

    await browser.close();
    return res.json({ apiResponse: response.data });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
