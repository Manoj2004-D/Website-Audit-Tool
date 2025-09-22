import { motion } from "framer-motion";

const SecurityCard = ({ security }: { security: any }) => {
  if (!security) return null;

  const items = [
    { label: "URL", value: security.url },
    { label: "HTTPS Enabled", value: security.https ? "✅ Yes" : "❌ No" },
    { label: "Reachable", value: security.reachable ? "✅ Yes" : "❌ No" },
    { label: "Missing Headers", value: security.missingHeaders?.join(", ") || "None" },
    { label: "Detected Headers", value: security.detectedHeaders?.join(", ") || "None" },
  ];

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg w-full">
      <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
        🔒 Security Report
      </h3>

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="grid grid-cols-[200px_1fr] gap-4 border-b border-gray-700 pb-2"
          >
            <span className="font-semibold text-white">{item.label}:</span>
            <span className="text-gray-300 break-words">{item.value}</span>
          </motion.div>
        ))}
      </div>

      {/* ✅ AI Suggestions */}
      {security.aiSuggestion && (
        <div className="mt-6 bg-purple-900/30 border border-purple-500/40 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-purple-300 mb-2">🤖 AI Suggestions</h4>
          <p className="text-gray-300 whitespace-pre-line">
            {security.aiSuggestion.replace(/\*\*(.*?)\*\*/g, "$1")}
          </p>
        </div>
      )}
    </div>
  );
};

export default SecurityCard;
