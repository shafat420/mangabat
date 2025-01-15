const axios = require("axios");
const cheerio = require("cheerio");

const baseUrl = "https://h.mangabat.com";
const ANILIST_API = "https://graphql.anilist.co";

// AniList GraphQL query for high quality images
const searchQuery = `
query ($search: String) {
  Media (search: $search, type: MANGA) {
    id
    title {
      romaji
      english
    }
    coverImage {
      extraLarge
      large
    }
    bannerImage
  }
}
`;

// Function to search AniList for high quality images
async function getAniListImages(title) {
  try {
    const { data } = await axios.post(ANILIST_API, {
      query: searchQuery,
      variables: { search: title }
    });

    const media = data?.data?.Media;
    if (!media) return null;

    return {
      id: media.id,
      poster: media.coverImage?.extraLarge || media.coverImage?.large || null,
      banner: media.bannerImage || null
    };
  } catch (error) {
    console.error("Error fetching AniList images:", error.message);
    return null;
  }
}

// Function to get AniList data directly
const getAniListData = async (title) => {
  try {
    const { data } = await axios.post(ANILIST_API, {
      query: searchQuery,
      variables: { search: title }
    });

    return data?.data?.Media || null;
  } catch (error) {
    console.error("Error fetching AniList data:", error.message);
    return null;
  }
};

function scrapeCommonData(document) {
  const $ = cheerio.load(document);
  const mangaData = [];

  const promises = $(".list-story-item").map(async (i, element) => {
    const id = $(element).find(".item-img").attr("href").split("/").pop() || "";
    const title = $(element).find(".item-title").text().trim() || "";
    const imageUrl = $(element).find(".item-img img").attr("src") || "";
    const rating = $(element).find(".item-rate").text().trim() || "";

    // Get high quality images from AniList
    const anilistImages = await getAniListImages(title);

    // Get all chapters
    const chapters = [];
    $(element).find(".item-chapter").each((_, chapterElement) => {
      const chapter = $(chapterElement);
      const chapterUrl = chapter.attr("href") || "";
      chapters.push({
        title: chapter.text().trim(),
        id: chapterUrl.split("-").pop() || "",
        path: chapterUrl.split("com").pop() || ""
      });
    });

    const author = $(element)?.find(".item-author")?.text()?.trim() || "";
    const releaseDate =
      $(element)
        .find(".item-time")
        .first()
        .text()
        .replace("Updated :", "")
        .trim() || "";
    const viewCount =
      $(element)
        .find(".item-time")
        .last()
        .text()
        .replace("View :", "")
        .trim() || "";

    return {
      id,
      title,
      imageUrl,
      anilistId: anilistImages?.id || null,
      anilistPoster: anilistImages?.poster || null, // Highest quality cover image
      anilistBanner: anilistImages?.banner || null, // Wide banner image if available
      rating,
      chapters,
      author,
      releaseDate,
      viewCount,
    };
  }).get();

  // Wait for all AniList requests to complete
  return Promise.all(promises);
}

const scrapeMangaSearch = async (query, page = 1) => {
  const formattedQuery = query.replace(/ /g, "_");
  const url = `${baseUrl}/search/manga/${formattedQuery}?page=${page}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const promises = $(".panel-list-story .list-story-item")
      .map(async (_, element) => {
        const title = $(element).find(".item-title").text().trim() || "N/A";
        const link = $(element).find(".item-title").attr("href") || "";
        const imageUrl = $(element).find(".item-img img").attr("src") || "";
        const rating = $(element).find(".item-rate").text().trim() || "N/A";
        const author = $(element).find(".item-author").text().trim() || "N/A";
        const updated =
          $(element)
            .find(".item-time")
            .first()
            .text()
            .trim()
            .split("Updated :")
            .pop()
            .trimStart() || "N/A";
        const views =
          $(element).find(".item-time").last().text().trim().split(":").pop() ||
          "N/A";

        // Get high quality images from AniList
        const anilistImages = await getAniListImages(title);

        return {
          id: link.split("/").pop(),
          title,
          link,
          image: imageUrl,
          anilistId: anilistImages?.id || null,
          anilistPoster: anilistImages?.poster || null, // Highest quality cover image
          anilistBanner: anilistImages?.banner || null, // Wide banner image
          rating,
          author,
          updated,
          views,
        };
      })
      .get();

    return Promise.all(promises);
  } catch (error) {
    console.error("Error scraping search data:", error.message);
    return [];
  }
};

const scrapeMangaDetails = async (mangaId) => {
  const url = `https://readmangabat.com/${mangaId}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let title = $(".story-info-right h1").text().trim() || "N/A";
    $(".panel-story-info-description > h3").remove();
    let description = $(".panel-story-info-description").text().trim();

    // Get high quality images from AniList
    const anilistImages = await getAniListImages(title);

    let altTitles = $(".variations-tableInfo h2")
      .text()
      .split(";")
      .map((title) => title.trim());

    let authors = $(
      ".variations-tableInfo > tbody > tr:nth-child(2) > .table-value > a"
    )
      .map((index, element) => $(element).text().trim())
      .get();

    let status = $(
      ".variations-tableInfo > tbody > tr:nth-child(3) > .table-value"
    )
      .text()
      .trim();

    let genres = $(
      ".variations-tableInfo > tbody > tr:nth-child(4) > .table-value > a"
    )
      .map((index, element) => $(element).text().trim())
      .get();

    let updated = $(".story-info-right-extent > p:nth-child(1) > .stre-value")
      .text()
      .trim();
    let views = $(".story-info-right-extent > p:nth-child(2) > .stre-value")
      .text()
      .trim();

    // Add cover image URL from meta tag
    let coverImage = $('meta[property="og:image"]').attr('content') || "";

    const chapterList = $(".panel-story-chapter-list .a-h")
      .map((_, element) => {
        const chapterTitle =
          $(element).find(".chapter-name").text().trim() || "N/A";
        const path =
          $(element).find(".chapter-name").attr("href").split("-").pop() || "";
        const updatedAt =
          $(element).find(".chapter-time").text().trim() || "N/A";

        return {
          id: path.split("/").pop(),
          title: chapterTitle,
          updated: updatedAt,
        };
      })
      .get();

    return {
      id: mangaId,
      title,
      altTitles,
      description,
      authors,
      status,
      genres,
      views,
      updated,
      coverImage,
      anilistId: anilistImages?.id || null,
      anilistPoster: anilistImages?.poster || null, // Highest quality cover image
      anilistBanner: anilistImages?.banner || null, // Wide banner image
      chapterList: chapterList.reverse(),
    };
  } catch (error) {
    console.error("Error scraping manga info:", error.message);
    return {};
  }
};

const scrapeChapterImages = async (mangaId, chapterId) => {
  const url = `https://readmangabat.com/${mangaId}-chap-${chapterId}`;

  try {
    const { data } = await axios.get(url, { headers: { Referer: baseUrl } });
    const $ = cheerio.load(data);

    const title = $(".panel-chapter-info-top h1")
      .text()
      .toLowerCase()
      .split("chapter")[0]
      .trim()
      .toUpperCase();

    const currentChapter = `Chapter${$(".panel-chapter-info-top h1")
      .text()
      .toLowerCase()
      .split("chapter")[1]
      .toUpperCase()}`;

    const chapterList = [];
    const chapterSet = new Set();

    $(".navi-change-chapter:nth-child(1)")
      .find("option")
      .each((_, option) => {
        const chapterId = $(option).attr("data-c");
        const chapterName = $(option).text().trim();
        const isCurrent = $(option).attr("selected") !== undefined;

        if (!chapterSet.has(chapterId)) {
          chapterSet.add(chapterId);
          chapterList.push({
            id: chapterId,
            title: chapterName,
            isCurrent: isCurrent,
          });
        }
      });

    const nextChapterLink =
      $(".navi-change-chapter-btn-next").attr("href") || "";
    const prevChapterLink =
      $(".navi-change-chapter-btn-prev").attr("href") || "";

    const images = $(".container-chapter-reader img")
      .map((_, img) => {
        const imgUrl = $(img).attr("src") || "";
        return {
          title: $(img).attr("title") || "",
          image: imgUrl,
          page: _,
        };
      })
      .get();

    return {
      message: "Use Referrer on every image to get access of the images",
      referrer: baseUrl + "/",
      results: {
        id: mangaId,
        title,
        currentChapter,
        nextChapterId: nextChapterLink.split("-").pop(),
        prevChapterId: prevChapterLink.split("-").pop(),
        chapterList,
        images,
        totalImages: images.length,
      },
    };
  } catch (error) {
    console.error("Error loading chapter images:", error.message);
    return {};
  }
};

const scrapeLatestMangas = async (page = 1) => {
  const url = "https://h.mangabat.com/manga-list-all/" + page;
  const { data } = await axios.get(url);
  return await scrapeCommonData(data);
};

const scrapePopularMangas = async (page = 1) => {
  const url = "https://h.mangabat.com/manga-list-all/" + page + "?type=topview";
  const { data } = await axios.get(url);
  return await scrapeCommonData(data);
};

const scrapeNewestMangas = async (page = 1) => {
  const url = "https://h.mangabat.com/manga-list-all/" + page + "?type=newest";
  const { data } = await axios.get(url);
  return await scrapeCommonData(data);
};

const scrapeCompletedMangas = async (page = 1) => {
  const url =
    "https://h.mangabat.com/advanced_search?s=all&sts=completed&orby=topview&page=" +
    page;
  const { data } = await axios.get(url);
  return await scrapeCommonData(data);
};

const scrapePopularThisMonth = async () => {
  const url = baseUrl + "/mangabat";
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    const promises = $("#owl-slider .item").map(async (_, element) => {
      const title = $(element).find(".slide-caption h3 a").text().trim();
      const link = $(element).find(".slide-caption h3 a").attr("href") || "";
      const imageUrl = $(element).find("img").attr("src") || "";
      const latestChapter = {
        title: $(element).find(".slide-caption > a:last-child").text().trim(),
        path: $(element).find(".slide-caption > a:last-child").attr("href")?.split("com").pop() || ""
      };

      // Get high quality images from AniList
      const anilistImages = await getAniListImages(title);

      return {
        id: link.split("/").pop(),
        title,
        link,
        imageUrl,
        anilistId: anilistImages?.id || null,
        anilistPoster: anilistImages?.poster || null,
        anilistBanner: anilistImages?.banner || null,
        latestChapter
      };
    }).get();

    return Promise.all(promises);
  } catch (error) {
    console.error("Error scraping popular this month:", error.message);
    return [];
  }
};

module.exports = {
  scrapeChapterImages,
  scrapeMangaSearch,
  scrapeMangaDetails,
  scrapeLatestMangas,
  scrapeCompletedMangas,
  scrapeNewestMangas,
  scrapePopularMangas,
  scrapePopularThisMonth,
  getAniListData,
  baseUrl,
};