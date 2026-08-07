import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  analyseResume,
  finishInterview,
  generateQuestions,
  getInterviewReport,
  getMyInterviews,
  submitAnswer,
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyseResume);
interviewRouter.post("/generate-questions", isAuth, generateQuestions);
interviewRouter.post("/submit-answer", isAuth, submitAnswer);
interviewRouter.post("/finish", isAuth, finishInterview);

interviewRouter.get("/report/:id", isAuth, getInterviewReport);
interviewRouter.get("/my-interviews", isAuth, getMyInterviews);

export default interviewRouter;
