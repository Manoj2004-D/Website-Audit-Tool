import { motion } from "framer-motion";

const AccessibilityCard = ({ accessibility }: { accessibility: any[] }) => {
  if (!accessibility) return null;

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg w-full">
      <h3 className="text-2xl font-bold text-yellow-400 mb-6">♿ Accessibility Report</h3>

      <div className="space-y-6">
        {accessibility.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="border-b border-gray-700 pb-3"
          >
            <div className="font-semibold text-white">{item.id}</div>
            <div className="text-gray-300">{item.description}</div>
            <div className="text-sm text-gray-400 mt-1">{item.help}</div>
            {item.helpUrl && (
              <a
                href={item.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-sm underline mt-1 inline-block"
              >
                Learn more
              </a>
            )}
          </motion.div>
        ))}
      </div>

      {/* ✅ AI Suggestions */}
      {Array.isArray(accessibility) &&
        accessibility.aiSuggestion && (
          <div className="mt-6 bg-yellow-900/30 border border-yellow-500/40 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-yellow-300 mb-2">🤖 AI Suggestions</h4>
            <p className="text-gray-300 whitespace-pre-line">
              {accessibility.aiSuggestion.replace(/\*\*(.*?)\*\*/g, "$1")}
            </p>
          </div>
        )}
    </div>
  );
};

export default AccessibilityCard;
