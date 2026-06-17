import { Router } from "express";
import { SanctuaryCheckInBody } from "@workspace/api-zod";

const router = Router();

const BREATHING_EXERCISES = [
  {
    name: "تنفس الهدوء",
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 6,
    description: "تنفس عميق يهدئ الجهاز العصبي ويخفض الضغط"
  },
  {
    name: "تنفس الصندوق",
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 4,
    description: "تقنية مستخدمة من قبل رجال الإطفاء والجيش للتحكم بالتوتر"
  },
  {
    name: "تنفس 4-7-8",
    inhaleSeconds: 4,
    holdSeconds: 7,
    exhaleSeconds: 8,
    description: "يساعد على النوم ويهدئ القلق الحاد"
  },
];

const HOTLINES = [
  { country: "السعودية", name: "خط دعم الصحة النفسية", number: "920033360", available: "24 ساعة" },
  { country: "مصر", name: "خط نجدة الطفل", number: "16000", available: "24 ساعة" },
  { country: "الإمارات", name: "خط الدعم النفسي", number: "800HOPE", available: "24 ساعة" },
  { country: "الكويت", name: "خط الصحة النفسية", number: "94005050", available: "24 ساعة" },
  { country: "الأردن", name: "خط دعم نفسي", number: "110", available: "24 ساعة" },
  { country: "تونس", name: "خط الطوارئ النفسية", number: "1800", available: null },
];

const AFFIRMATIONS = [
  "أنت لست وحدك — حتى في أعمق الظلام",
  "مشاعرك حقيقية وتستحق أن تُسمع",
  "هذه اللحظة صعبة، لكنها لن تدوم إلى الأبد",
  "وجودك في هذا العالم له معنى — حتى لو لم تشعر بذلك الآن",
  "أن تطلب المساعدة شجاعة، لا ضعف",
  "أنت أكثر قوة مما تتخيل",
  "لك مكان في هذا الكون، مهما قال الآخرون",
  "كل عاصفة تمر — وأنت قادر على الصمود حتى تمر",
];

const SUPPORT_MESSAGES: Record<number, { message: string; suggestion: string }> = {
  1: {
    message: "أسمعك. هذا الألم حقيقي ومشروع. أنت لست وحدك في هذا.",
    suggestion: "جرب تمرين التنفس الآن — بضع دقائق يمكن أن تغير الحالة كثيراً.",
  },
  2: {
    message: "شكراً لأنك هنا وتتحدث عن ما تشعر به. هذه خطوة مهمة.",
    suggestion: "خذ لحظة لتنفس ببطء. ثم تواصل مع خط الدعم إن احتجت.",
  },
  3: {
    message: "كل يوم له ثقله — وأنت تتحمله. هذا يستحق الاعتراف.",
    suggestion: "ربما يساعدك بُعد البساطة قليلاً — تأمل هادئ ربما.",
  },
  4: {
    message: "جيد أنك تتفاعل وتشارك. الاتصال بالعالم مهم.",
    suggestion: "استمر في التواصل مع الأطياف الأخرى — أنت لست بمفردك.",
  },
  5: {
    message: "يسعدني أن حالك أفضل. احمل هذا الشعور معك.",
    suggestion: "ربما تشارك شيئاً يُسعدك في بُعد الحكايات؟",
  },
};

router.get("/sanctuary/resources", (req, res) => {
  res.json({
    breathingExercises: BREATHING_EXERCISES,
    hotlines: HOTLINES,
    affirmations: AFFIRMATIONS,
  });
});

router.post("/sanctuary/check-in", (req, res) => {
  const parse = SanctuaryCheckInBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { mood } = parse.data;
  const clampedMood = Math.min(5, Math.max(1, mood));
  const response = SUPPORT_MESSAGES[clampedMood] ?? SUPPORT_MESSAGES[3];
  res.json({
    message: response.message,
    suggestion: response.suggestion,
    resourcesAvailable: clampedMood <= 2,
  });
});

export default router;
