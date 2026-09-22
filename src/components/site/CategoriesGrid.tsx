import { motion } from "framer-motion";
import { Link } from "@/lib/router";
import { categoryMeta, categories } from "@/data/events";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

const displayCategories = categories.filter((c) => c !== "All");

export function CategoriesGrid() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-14">
          <span className="text-eyebrow text-primary font-semibold">— Explore by Topic</span>
          <h2 className="mt-4 text-section-title">Find events in your domain</h2>
          <p className="mt-5 text-lead max-w-[50ch] mx-auto">
            From AI to College Festivals — whatever you're building or learning, there's an event for you.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {displayCategories.map((cat, i) => {
            const meta = categoryMeta[cat] ?? {
              icon: "🎯",
              description: "",
              color: "from-primary/10 to-primary/10 border-primary/10",
            };
            return (
              <ScrollReveal key={cat} delay={i * 0.03} direction="up">
                <motion.div
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to="/events"
                    search={{ category: cat } as Record<string, string>}
                    className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl border bg-gradient-to-br ${meta.color} transition-all duration-200 cursor-pointer text-center h-full justify-center shadow-sm hover:shadow-md`}
                  >
                    <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                      {meta.icon}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-foreground leading-tight">{cat}</div>
                      {meta.description && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {meta.description}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
