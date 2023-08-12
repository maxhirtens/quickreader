"use strict";

/** Get articles route. */

const express = require("express");
const { BadRequestError } = require("../expressError");
const router = new express.Router();
const BASE_URL = "https://api.nytimes.com/svc/topstories/v2/";
const News = require("../models/news");
const axios = require("axios");
const { extract } = require("../helpers/extract");

// GET request to news source, retrieving cached or live articles.
router.get("/:section", async (req, res, next) => {
  try {
    const section = req.params.section;
    const date = new Date().toJSON();
    let articles;

    // check if news section data is already stored in local DB.
    const dbRes = (await News.get(date)) || (await News.create(date));
    const dbArticles = dbRes.data;
    const dbSectionData = dbArticles[section];

    // then extract it's data or start new API search.
    if (dbSectionData !== null) {
      console.log("obtained news from DB:" + section);
      articles = dbSectionData;
    } else {
      // query news API.
      console.log("querying API");
      articles = await axios.get(
        `${BASE_URL}${section}.json?api-key=${process.env.NYT_API_KEY}`
      );
      articles = articles.data;
      let selects = articles.results;

      // extract just text contents.
      articles = extract(selects);

      // send to local DB
      await News.update({
        date: date,
        section: section,
        content: articles,
      });
    }

    // return the result
    return res.status(200).json({
      success: true,
      message: articles,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
