import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useTheme } from "next-themes";

const testimonials = [
  {
    quote: "AuditReady transformed our compliance process. What used to take months now takes weeks.",
  },
  {
    quote: "The automated assessment feature alone saved us countless hours of manual work.",
  },
  {
    quote: "Finally, a compliance platform that understands the needs of modern security teams.",
  },
];

export default function TestimonialsSection() {
  const { theme } = useTheme();

  return (
    <section className="py-16 sm:py-20 px-3 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
            Customer Stories
          </Badge>
          <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
            Trusted by Security Leaders
          </h2>
          <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-2xl mx-auto`}>
            See how leading organizations are transforming their compliance processes with AuditReady.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`h-full ${theme === 'light' ? 'bg-white border-slate-200 shadow-md hover:shadow-xl' : 'bg-slate-800 border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10'} transition-all duration-300`}>
                <CardContent className="p-8">
                  <div className={`inline-flex p-3 rounded-full mb-6 ${theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/30'}`}>
                    <Quote className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                  </div>
                  <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-200'} text-lg leading-relaxed italic`}>
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
