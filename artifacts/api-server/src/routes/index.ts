import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dimensionsRouter from "./dimensions";
import galaxiesRouter from "./galaxies";
import talesRouter from "./tales";
import reelsRouter from "./reels";
import secretsRouter from "./secrets";
import echoRouter from "./echo";
import sanctuaryRouter from "./sanctuary";
import commentsRouter from "./comments";
import pollsRouter from "./polls";
import moodsRouter from "./moods";
import bookmarksRouter from "./bookmarks";
import searchRouter from "./search";
import expressionsRouter from "./expressions";
import activityRouter from "./activity";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dimensionsRouter);
router.use(galaxiesRouter);
router.use(talesRouter);
router.use(reelsRouter);
router.use(secretsRouter);
router.use(echoRouter);
router.use(sanctuaryRouter);
router.use(commentsRouter);
router.use(pollsRouter);
router.use(moodsRouter);
router.use(bookmarksRouter);
router.use(searchRouter);
router.use(expressionsRouter);
router.use(activityRouter);

export default router;
