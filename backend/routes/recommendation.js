const express = require("express");
const { getRecommendations } = require("../controllers/recommendationController");
const { getRecommendationContext } = require("../recommendationContext");

const router = express.Router();
const { fetchuser } = getRecommendationContext();

router.get("/recommendations", fetchuser, getRecommendations);

module.exports = router;
