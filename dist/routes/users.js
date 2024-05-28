"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { postSignup } = require("../controllers/signup");
const { postSignin } = require("../controllers/signin");
const router = express.Router();
router.post("/signin", postSignin);
router.post("/signup", postSignup);
exports.default = router;
//# sourceMappingURL=users.js.map