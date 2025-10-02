import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How long does it take to get started?",
    answer: "You can start using AuditReady immediately after signing up. Most organizations complete their initial setup within 1-2 hours."
  },
  {
    question: "Which compliance frameworks do you support?",
    answer: "We support ISO 27001, SOC 2, NIST, GDPR, HIPAA, PCI DSS, and many more. New frameworks are added regularly based on customer needs."
  },
  {
    question: "Can I import existing compliance data?",
    answer: "Yes! AuditReady supports bulk import from Excel, CSV, and direct integrations with popular GRC tools."
  },
  {
    question: "What kind of support do you offer?",
    answer: "All plans include email support. Business plans get priority support, and Enterprise customers receive dedicated account management and 24/7 assistance."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption, SOC 2 certified infrastructure, and follow best practices for data security and privacy."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel anytime with no penalties. Your data remains accessible for 30 days after cancellation."
  }
];

export function FAQSection() {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={`py-16 sm:py-20 px-3 sm:px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
            FAQ
          </Badge>
          <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
            Frequently Asked Questions
          </h2>
          <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
            Got questions? We've got answers.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card
                className={`${openIndex === index
                  ? theme === 'light'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-lg'
                    : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-500 shadow-blue-500/20 shadow-lg'
                  : theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                } cursor-pointer transition-all duration-300 hover:shadow-md`}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 text-lg ${openIndex === index
                        ? theme === 'light' ? 'text-blue-700' : 'text-blue-400'
                        : theme === 'light' ? 'text-slate-900' : 'text-slate-100'
                      }`}>
                        {faq.question}
                      </h3>
                      <AnimatePresence>
                        {openIndex === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} mt-2 leading-relaxed`}>
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown
                        className={`h-5 w-5 ${openIndex === index
                          ? theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                          : theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                        } transition-colors flex-shrink-0`}
                      />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
