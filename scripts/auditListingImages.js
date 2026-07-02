if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const http = require("http");
const https = require("https");
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { TITLE_IMAGE_MAP, validImageUrl } = require("../utils/provenImages");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

function requestHead(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https:") ? https : http;
    const req = client.request(
      url,
      {
        method: "HEAD",
        timeout: 10000,
        headers: { "User-Agent": "WanderLust-image-audit/1.0" },
      },
      (res) => {
        resolve({
          status: res.statusCode,
          type: res.headers["content-type"] || "",
          length: Number(res.headers["content-length"] || 0),
        });
        res.resume();
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (err) => resolve({ error: err.code || err.message }));
    req.end();
  });
}

function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) return null;
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += 2 + length;
  }
  return null;
}

function requestDimensions(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https:") ? https : http;
    const chunks = [];
    let size = 0;
    const req = client.get(
      url,
      {
        timeout: 12000,
        headers: {
          "User-Agent": "WanderLust-image-audit/1.0",
          Range: "bytes=0-131071",
        },
      },
      (res) => {
        res.on("data", (chunk) => {
          chunks.push(chunk);
          size += chunk.length;
          const dimensions = jpegDimensions(Buffer.concat(chunks, size));
          if (dimensions || size > 131072) {
            req.destroy();
            resolve(dimensions);
          }
        });
        res.on("end", () => resolve(jpegDimensions(Buffer.concat(chunks, size))));
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (err) => {
      if (err.message === "socket hang up") return;
      resolve(null);
    });
  });
}

async function auditListingImages() {
  await mongoose.connect(MONGO_URL);
  const listings = await Listing.find({}).select("title category image images").sort({ title: 1 }).lean();
  const counts = new Map();
  listings.forEach((listing) => {
    const url = listing.image?.url || "";
    counts.set(url, (counts.get(url) || 0) + 1);
  });

  const results = [];
  for (const listing of listings) {
    const url = listing.image?.url || "";
    const head = validImageUrl(url) ? await requestHead(url) : { error: "invalid-url-shape" };
    const dimensions =
      head.status === 200 && String(head.type).includes("image/")
        ? await requestDimensions(url)
        : null;
    const expected = TITLE_IMAGE_MAP[listing.title]?.url;
    results.push({
      title: listing.title,
      category: listing.category,
      url,
      unique: counts.get(url) === 1,
      titleMatched: expected ? expected === url : true,
      status: head.status || null,
      type: head.type || null,
      bytes: head.length || 0,
      dimensions,
      ok:
        counts.get(url) === 1 &&
        (!expected || expected === url) &&
        head.status === 200 &&
        String(head.type).includes("image/") &&
        dimensions &&
        dimensions.width >= 600 &&
        dimensions.height >= 400,
    });
  }

  const failed = results.filter((item) => !item.ok);
  console.log(
    JSON.stringify(
      {
        totalListings: listings.length,
        failures: failed.length,
        duplicatePrimaryImages: [...counts.entries()].filter(([, count]) => count > 1).length,
        results,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
  if (failed.length) process.exit(1);
}

auditListingImages().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
