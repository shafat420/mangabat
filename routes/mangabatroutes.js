const express = require("express");
const {
  getMangaChapterImages,
  getMangaSearch,
  getMangaDetails,
  getLatestMangas,
  getPopularMangas,
  getNewestMangas,
  getCompletedMangas,
  getPopularThisMonth,
} = require("../controllers/mangaBatController");

const router = express.Router();

router.get("/read/:mangaId?/:chapterId?", getMangaChapterImages);
router.get("/details/:id", getMangaDetails);
router.get("/search/:query?/:page?", getMangaSearch);
router.get("/latest/:page?", getLatestMangas);
router.get("/popular/:page?", getPopularMangas);
router.get("/newest/:page?", getNewestMangas);
router.get("/completed/:page?", getCompletedMangas);
router.get("/popular-this-month", getPopularThisMonth);

module.exports = router;