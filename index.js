require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParserMiddleware = express.urlencoded({ extended: true });
var dns = require('dns');
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let shortUrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: Number
});
let ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// solution
app.use(bodyParserMiddleware);
const REPLACE_REGEX = /^https?:\/\//i
let entryCounter = 1;
app.post("/api/shorturl", (req, res) => {
  dns.lookup(req.body.url.replace(REPLACE_REGEX, '').split("/")[0], (err, address, family) => {
    if (err) {
      res.json({
        error: "invalid url"
      })
    } else {
      res.json({
        original_url: req.body.url,
        short_url: entryCounter
      });
      let newEntry = new ShortUrl({
        originalUrl: req.body.url,
        shortUrl: entryCounter++
      });
      newEntry.save((err, data) => {
        if (err) return console.error(err);
      });
    }
  });
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  ShortUrl.findOne({ shortUrl: req.params.shorturl }, (err, data) => {
    if (err) return console.error(err);
    res.redirect(data.originalUrl);
  });
});