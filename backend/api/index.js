export default function handler(req, res) {
  return res.status(200).json({
    message: "✅ Vercel is working",
    time: new Date().toISOString()
  });
}
