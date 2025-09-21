import { motion } from "framer-motion";

const AccessibilityCard = ({ accessibility }: { accessibility: any[] }) => {
  if (!accessibility || !accessibility.length) return null;

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg w-full">
      <h3 className="text-2xl font-bold text-blue-400 mb-6">♿ Accessibility Report</h3>

      <div className="space-y-4">
        {accessibility.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="grid grid-cols-[200px_1fr] gap-4 border-b border-gray-700 pb-2"
          >
            <span className="font-semibold text-white">{item.id || "Issue"}:</span>
            <span className="text-gray-300 break-words">
              {item.description} ({item.impact || "info"}) → {item.help}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AccessibilityCard;
