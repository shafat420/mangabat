const {
    scrapeChapterImages,
    scrapeMangaDetails,
    scrapeMangaSearch,
    scrapePopularMangas,
    scrapeLatestMangas,
    scrapeNewestMangas,
    scrapeCompletedMangas,
    scrapePopularThisMonth
  } = require("../scrappers/mangabat");
  
  const getMangaChapterImages = async (req, res) => {
    const chapterId = req.params.chapterId;
    const mangaId = req.params.mangaId;
    try {
      const data = await scrapeChapterImages(mangaId, chapterId);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        error: `Error fetching the manga details from MangaNato : ${err}`,
      });
    }
  };
  
  const getMangaDetails = async (req, res) => {
    const id = req.params.id;
    try {
      const data = await scrapeMangaDetails(id);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        error: `Error fetching the manga details from MangaNato : ${err}`,
      });
    }
  };
  
  const getMangaSearch = async (req, res) => {
    const query = req.params.query || "attack on titan";
    const page = req.params.page || 1;
    try {
      const data = await scrapeMangaSearch(query, page);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        error: `Error fetching the manga details from MangaNato : ${err}`,
      });
    }
  };
  
  const getPopularMangas = async (req, res) => {
    const page = req.params.page || 1;
    try {
      const data = await scrapePopularMangas(page);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        error: "Error fetching the manga details from MangaNato.",
      });
    }
  };
  
  const getLatestMangas = async (req, res) => {
    const page = req.params.page || 1;
    try {
      const data = await scrapeLatestMangas(page);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        error: "Error fetching the manga details from MangaNato.",
      });
    }
  };
  const getNewestMangas = async (req, res) => {
    const page = req.params.page || 1;
    try {
      const data = await scrapeNewestMangas(page);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        error: "Error fetching the manga details from MangaNato.",
      });
    }
  };
  const getCompletedMangas = async (req, res) => {
    const page = req.params.page || 1;
    try {
      const data = await scrapeCompletedMangas(page);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        error: "Error fetching the manga details from MangaNato.",
      });
    }
  };

  const getPopularThisMonth = async (req, res) => {
    try {
      const popularManga = await scrapePopularThisMonth();
      res.json(popularManga);
    } catch (error) {
      console.error('Error fetching popular manga:', error);
      res.status(500).json({ error: 'Failed to fetch popular manga' });
    }
  };
  
  module.exports = {
    getMangaChapterImages,
    getMangaDetails,
    getMangaSearch,
    getLatestMangas,
    getPopularMangas,
    getNewestMangas,
    getCompletedMangas,
    getPopularThisMonth
  };