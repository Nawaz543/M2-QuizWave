const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const router = express.Router();

const pollSessions = require("../store/pollSessions");

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

// ========================================
// POLL SESSION STORAGE
// ========================================

// const pollSessions = new Map();

// ========================================
// GET VALID OPTIONS
// ========================================

const getValidOptions = (optionType) => {

  switch (optionType) {

    case "ABCD":
      return ["A", "B", "C", "D"];

    case "abcd":
      return ["a", "b", "c", "d"];

    case "ROMAN":
      return ["I", "II", "III", "IV"];

    case "NUMBER":
      return ["1", "2", "3", "4"];

    case "ANY":
      return [
        "A", "B", "C", "D",
        "a", "b", "c", "d",
        "I", "II", "III", "IV",
        "1", "2", "3", "4"
      ];

    default:
      return [];
  }
};


// ========================================
// EXTRACT OPTION
// ========================================

const extractOption = (message, optionType) => {

  if (!message) {
    return null;
  }

  // Remove extra spaces
  const text = message.trim();

  if (!text) {
    return null;
  }


  // ========================================
  // ANY
  // ========================================

  if (optionType === "Any") {

    

    // Exact A B C D
    if (["A", "B", "C", "D"].includes(text)) {
      console.log("Exact match found:", text);
      return text;
    }

    if (["a", "b", "c", "d"].includes(text)) {
      console.log("Exact match found:", text);
      return text;
    }


    // Roman
    const romanMatch =
      text.match(/^(I|II|III|IV)[\s.)\-:]*$/);

    if (romanMatch) {
      console.log("Roman match found:", romanMatch[1]);
      return romanMatch[1];
    }
 
    // Number
    const numberMatch =
      text.match(/^([1-4])[\s.)\-:]*$/);

    if (numberMatch) {
      console.log("Number match found:", numberMatch[1]);
      return numberMatch[1];
    }


    // a / b / c / d already handled
    // because we convert to uppercase

    return null;
  }


  // ========================================
  // ABCD
  // ========================================

  if (optionType === "ABCD") {

    const upperText = text.toUpperCase();

    const match =
      upperText.match(/^([ABCD])[\s.)\-:]*$/);

    if (match) {
      return match[1];
    }

    return null;
  }


  // ========================================
  // abcd
  // ========================================

  if (optionType === "abcd") {

    const match =
      text.match(/^([abcd])[\s.)\-:]*$/);

    if (match) {
      return match[1];
    }

    return null;
  }


  // ========================================
  // ROMAN
  // ========================================

  if (optionType === "ROMAN") {

    const upperText = text.toUpperCase();

    const match =
      upperText.match(/^(I|II|III|IV)[\s.)\-:]*$/);

    if (match) {
      return match[1];
    }

    return null;
  }



  // ========================================
  // NUMBER
  // ========================================

  if (optionType === "NUMBER") {

    const match =
      text.match(/^([1-4])[\s.)\-:]*$/);

    if (match) {
      return match[1];
    }

    return null;
  }


  return null;
};

// ========================================
// START POLL
// ========================================

router.post("/poll/start", async (req, res) => {

  try {

    const {
      videoId,
      pollConfig
    } = req.body;


    // Check video ID
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required"
      });
    }


    // Check poll config
    if (!pollConfig) {
      return res.status(400).json({
        success: false,
        message: "Poll configuration is required"
      });
    }


    const {
      pollTime,
      optionType,
      questionNumber = 1
    } = pollConfig;


    // Check poll time
    if (!pollTime || Number(pollTime) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll time"
      });
    }


    // Check option type
    if (!optionType) {
      return res.status(400).json({
        success: false,
        message: "Option type is required"
      });
    }


    // ========================================
    // Get Live Chat ID
    // ========================================

    const videoResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "liveStreamingDetails",
          id: videoId,
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );


    if (videoResponse.data.items.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Video not found"
      });

    }


    const liveDetails =
      videoResponse.data.items[0].liveStreamingDetails;


    if (!liveDetails?.activeLiveChatId) {

      return res.status(400).json({
        success: false,
        message: "Live chat is not available"
      });

    }


    const activeLiveChatId =
      liveDetails.activeLiveChatId;


    // ========================================
    // Create Poll ID
    // ========================================

    const pollId = crypto.randomUUID();


    // ========================================
    // Poll Timing
    // ========================================

    const startTime = Date.now();

    const endTime =
      startTime + Number(pollTime) * 1000;


    // ========================================
    // Create Poll Session
    // ========================================

    const session = {

      pollId,

      videoId,

      activeLiveChatId,

      questionNumber,

      pollTime: Number(pollTime),

      optionType,

      startTime,

      endTime,

      isRunning: true,

      nextPageToken: null,

      responses: [],

      processedMessageIds: new Set(),

      answeredUsers: new Set()

    };


    // Save session
    pollSessions.set(pollId, session);


    console.log(
      `Poll started: ${pollId}`
    );

collectChatMessages(pollId);
    // ========================================
    // Send Response
    // ========================================

    res.json({

      success: true,

      message: "Poll started",

      pollId,

      questionNumber,

      pollTime,

      optionType,

      startTime,

      endTime

    });


  } catch (error) {

    console.error(
      "Start Poll Error:",
      error.response?.data || error.message
    );


    res.status(500).json({

      success: false,

      message: "Failed to start poll"

    });

  }

});

// ========================================
// STOP POLL
// ========================================

router.post("/poll/:pollId/stop", (req, res) => {

  const { pollId } = req.params;

  const session = pollSessions.get(pollId);

  // Poll session nahi mila
  if (!session) {

    return res.status(404).json({
      success: false,
      message: "Poll session not found"
    });

  }

  // Backend polling stop
  session.isRunning = false;

  console.log(
    `Poll ${pollId} stopped manually`
  );

  return res.json({

    success: true,

    message: "Poll stopped successfully",

    pollId

  });

});

// ========================================
// COLLECT LIVE CHAT MESSAGES
// ========================================

const collectChatMessages = async (pollId) => {

  const session = pollSessions.get(pollId);
  

  // Poll exist nahi karta ya already stopped hai
  if (!session || !session.isRunning) {
    return;
  }


  // ========================================
  // Check Time
  // ========================================

  if (Date.now() >= session.endTime) {

    session.isRunning = false;

    console.log(
      `Poll ${pollId} time ended`
    );

    return;
  }


  try {

    // ========================================
    // Fetch YouTube Chat
    // ========================================

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/liveChat/messages",
      {
        params: {

          liveChatId:
            session.activeLiveChatId,

          part:
            "snippet,authorDetails",

          key:
            process.env.YOUTUBE_API_KEY,

          // Next page token
          ...(session.nextPageToken && {
            pageToken:
              session.nextPageToken
          })

        }
      }
    );


    // ========================================
    // Save Next Page Token
    // ========================================

    session.nextPageToken =
      response.data.nextPageToken;


    // ========================================
    // Get Messages
    // ========================================

    const messages =
      response.data.items || [];


    console.log(
      `Poll ${pollId}: ${messages.length} messages received`
    );


    // ========================================
    // Process Messages
    // ========================================

    for (const item of messages) {

  // ========================================
  // 1. Message duplicate check
  // ========================================

  if (session.processedMessageIds.has(item.id)) {
    continue;
  }

  session.processedMessageIds.add(item.id);


  // ========================================
  // 2. Student information
  // ========================================

  const userId =
    item.authorDetails?.channelId;

  const username =
    item.authorDetails?.displayName;

  const message =
    item.snippet?.displayMessage;

  const timestamp =
    item.snippet?.publishedAt;


  // Missing information
  if (!userId || !username || !message) {
    continue;
  }


  // ========================================
  // 3. Convert message to valid option
  // ========================================

  const answer =
    extractOption(
      message,
      session.optionType
    );


  // Invalid message
  if (!answer) {

    console.log(
      `Ignored: ${username} → ${message}`
    );

    continue;
  }


  // ========================================
  // 4. One answer per student
  // ========================================

  if (session.answeredUsers.has(userId)) {

    console.log(
      `Duplicate response ignored: ${username} → ${answer}`
    );

    continue;
  }


  // ========================================
  // 5. Mark student as answered
  // ========================================

  session.answeredUsers.add(userId);


  // ========================================
  // 6. Save valid response
  // ========================================

  const responseData = {

    messageId: item.id,

    userId,

    username,

    answer,

    message,

    timestamp

  };


  session.responses.push(responseData);


  // ========================================
  // 7. Console
  // ========================================

  console.log(
    `VALID RESPONSE: ${username} → ${answer}`
  );

}


    // ========================================
    // Check Time Again
    // ========================================

    if (Date.now() >= session.endTime) {

      session.isRunning = false;

      console.log(
        `Poll ${pollId} collection stopped`
      );

      return;
    }


    // ========================================
    // YouTube Polling Interval
    // ========================================

    const pollingInterval =
      response.data.pollingIntervalMillis || 2000;


    const remainingTime =
      session.endTime - Date.now();


    if (remainingTime <= 0) {

      session.isRunning = false;

      return;

    }


    // Next request
    const nextDelay =
      Math.min(
        pollingInterval,
        remainingTime
      );


    setTimeout(() => {

      collectChatMessages(pollId);

    }, nextDelay);


  } catch (error) {

    console.error(
      "Chat Collection Error:",
      error.response?.data || error.message
    );


    // Retry if poll is still running
    if (
      session.isRunning &&
      Date.now() < session.endTime
    ) {

      setTimeout(() => {

        collectChatMessages(pollId);

      }, 2000);

    }

  }

};

module.exports = router;
