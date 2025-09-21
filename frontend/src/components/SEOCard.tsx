import { motion } from "framer-motion";

const SEOCard = ({ seo }: { seo: any }) => {
  if (!seo) return null;

  // Convert audits into clean array with value + explanation
  const items = Object.entries(seo.audits || {}).map(([key, raw]) => {
    if (typeof raw === "object" && raw !== null) {
      return {
        label: key.replace(/([A-Z])/g, " $1"),
        value: raw.value ?? "N/A",
        explanation: raw.explanation ?? "",
      };
    }
    return {
      label: key.replace(/([A-Z])/g, " $1"),
      value: raw ?? "N/A",
      explanation: "",
    };
  });

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg w-full">
      <h3 className="text-2xl font-bold text-green-400 mb-6">
        🌐 SEO Report
      </h3>

      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="border-b border-gray-700 pb-3"
          >
            <div className="grid grid-cols-[200px_1fr] gap-4">
              <span className="font-semibold text-white capitalize">
                {item.label}:
              </span>
              <span className="text-gray-300">{item.value}</span>
            </div>
            {item.explanation && (
              <p className="text-sm text-gray-400 mt-1">{item.explanation}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SEOCard;
