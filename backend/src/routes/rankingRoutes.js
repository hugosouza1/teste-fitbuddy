const express = require("express");
const router = express.Router();
const rankingController = require("../controllers/rankingController");

// Ranking pessoal dentro do grupo
router.get(
  "/group/:groupId/personal/:email",
  rankingController.getGroupPersonalRanking
);

// Ranking completo do grupo
router.get(
  "/group/:groupId/list",
  rankingController.getGroupRankingList
);

module.exports = router;