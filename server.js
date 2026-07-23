import express from "express";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.BIBLE_API_KEY;

app.get("/", (req, res) => {
  res.send("Bible app is running");
});

app.get("/verse", async (req, res) => {
  try {
    const reference = req.query.reference || "John 3:16";
    const bibleId = req.query.bibleId || "de4e12af7f28f599-02";

    const searchUrl = `https://rest.api.bible/v1/bibles/${bibleId}/search?query=${encodeURIComponent(reference)}`;

    const response = await fetch(searchUrl, {
      headers: {
        "api-key": apiKey
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
