const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/video", async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      });
    }


    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,liveStreamingDetails",
          id: videoId,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );
// video exists check
    if (response.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const video = response.data.items[0];

    const liveDetails = video.liveStreamingDetails;

    if (!liveDetails) {
      return res.status(400).json({
        success: false,
        message: "This video is not a live stream",
      });
    }

    const activeLiveChatId = liveDetails.activeLiveChatId;

    if (!activeLiveChatId) {
      return res.status(400).json({
        success: false,
        message: "Live chat is not available",
      });
    }
  // Currently active live chat nahi hai
    if (!activeLiveChatId) {
      return res.status(400).json({
        success: false,
        message: "This stream is not currently live or live chat is unavailable",
      });
    }


    res.json({
      success: true,
      message: "Live stream verified",
      videoId,
      title: video.snippet.title,
      activeLiveChatId,
      actualStartTime: liveDetails.actualStartTime || null,
    });

  } catch (error) {
    console.error(
      "YouTube API Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch YouTube live data",
    });
  }
});

router.get("/chat", async (req, res) => {
  try {
    const { liveChatId } = req.query;

    if (!liveChatId) {
      return res.status(400).json({
        success: false,
        message: "Live Chat ID is required",
      });
    }

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/liveChat/messages",
      {
        params: {
          liveChatId,
          part: "snippet,authorDetails",
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    const messages = response.data.items.map((item) => ({
      messageId: item.id,
      userId: item.authorDetails.channelId,
      username: item.authorDetails.displayName,
      message: item.snippet.displayMessage,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json({
      success: true,
      nextPageToken: response.data.nextPageToken,
      pollingIntervalMillis: response.data.pollingIntervalMillis,
      messages,
    });

  } catch (error) {
    console.error(
      "Live Chat API Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch live chat messages",
    });
  }
});

module.exports = router;