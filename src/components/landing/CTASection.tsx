import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

export function CTASection() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <section className={`py-24 px-3 sm:px-4 ${theme === 'light' ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : 'bg-gradient-to-r from-blue-700 to-indigo-800'}`}>
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Compliance Process?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join leading organizations worldwide who trust AuditReady for their compliance management needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/onboarding")}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-2 border-white/20 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/contact")}
            >
              <Phone className="mr-2 h-5 w-5" />
              Talk to Sales
            </Button>
          </div>
          <p className="text-sm text-white/70 mt-6">
            No credit card required • 14-day free trial • Setup in minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
}
