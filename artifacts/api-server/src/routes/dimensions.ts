import { Router } from "express";

const router = Router();

const DIMENSIONS = [
  { id: "echo", name: "Echo", nameAr: "الصدى", tagline: "حيث تجد أذناً تسمع بلا حكم", color: "#1E3A8A", activeSpecters: 0, icon: "echo" },
  { id: "galaxy", name: "Galaxy", nameAr: "المجرة", tagline: "مجرات من البشر تشاركك نفس الشعور", color: "#7C3AED", activeSpecters: 0, icon: "galaxy" },
  { id: "mirrors", name: "Mirrors", nameAr: "المرايا", tagline: "لحظات تعبر عنك دون كلمات", color: "#0F172A", activeSpecters: 0, icon: "mirrors" },
  { id: "music", name: "Musical Echoes", nameAr: "الأصداء الموسيقية", tagline: "الموسيقى التي تحمل ما لا تستطيع قوله", color: "#0D9488", activeSpecters: 0, icon: "music" },
  { id: "tales", name: "Tales", nameAr: "الحكايات", tagline: "قصص تعيش فيها وتهرب إليها", color: "#92400E", activeSpecters: 0, icon: "tales" },
  { id: "mystery", name: "Mystery", nameAr: "الغموض", tagline: "أسرار تُطلق في الفراغ وتُوهب للمجهول", color: "#1A0A2E", activeSpecters: 0, icon: "mystery" },
  { id: "freedom", name: "Freedom", nameAr: "الحرية", tagline: "فضاء بلا حدود لمن رفضهم المجتمع", color: "#D97706", activeSpecters: 0, icon: "freedom" },
  { id: "kindred", name: "Kindred Spectrums", nameAr: "الأطياف المتشابهة", tagline: "ابحث عمن يشبهك في هذا الكون", color: "#DB2777", activeSpecters: 0, icon: "kindred" },
  { id: "simplicity", name: "Simplicity", nameAr: "البساطة", tagline: "راحة بلا ضوضاء، سلام بلا كلمات", color: "#BFDBFE", activeSpecters: 0, icon: "simplicity" },
  { id: "complexity", name: "Complexity", nameAr: "التعقيد", tagline: "أفكار تتشابك في شبكات من النور", color: "#1E40AF", activeSpecters: 0, icon: "complexity" },
  { id: "expression", name: "Free Expression", nameAr: "التعبير الحر", tagline: "معرض كوني لكل إبداع حر", color: "#7C3AED", activeSpecters: 0, icon: "expression" },
  { id: "sanctuary", name: "Last Sanctuary", nameAr: "الملاذ الأخير", tagline: "دعم فوري حين تصل إلى الحافة", color: "#DDD6FE", activeSpecters: 0, icon: "sanctuary" },
];

router.get("/dimensions", (req, res) => {
  const dims = DIMENSIONS.map(d => ({
    ...d,
    activeSpecters: Math.floor(Math.random() * 80) + 5,
    description: null,
  }));
  res.json(dims);
});

router.get("/dimensions/:dimensionId/feed", (req, res) => {
  const { dimensionId } = req.params;
  const items = Array.from({ length: 8 }, (_, i) => ({
    id: `${dimensionId}-feed-${i}`,
    dimensionId,
    type: ["text", "pulse", "resonance"][i % 3],
    content: null,
    pulseCount: Math.floor(Math.random() * 50),
    createdAt: new Date(Date.now() - i * 600000).toISOString(),
  }));
  res.json({ items, nextCursor: null });
});

router.get("/stats/atrium", (req, res) => {
  const totalSpectersOnline = Math.floor(Math.random() * 300) + 120;
  const dimensionStats = DIMENSIONS.map(d => ({
    dimensionId: d.id,
    activeSpecters: Math.floor(Math.random() * 50) + 3,
    recentActivity: Math.floor(Math.random() * 20),
  }));
  res.json({
    totalSpectersOnline,
    activeDimensions: 12,
    dimensionStats,
  });
});

export default router;
