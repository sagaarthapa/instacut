'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { 
  RocketLaunchIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const benefits = [
  {
    icon: RocketLaunchIcon,
    text: "Start processing in 30 seconds"
  },
  {
    icon: CreditCardIcon,
    text: "No credit card required"
  },
  {
    icon: ShieldCheckIcon,
    text: "Cancel anytime, no commitment"
  },
  {
    icon: SparklesIcon,
    text: "Access to all AI models"
  }
]

const comparison = [
  { feature: "Setup time", us: "30 seconds", competitor: "Hours of configuration" },
  { feature: "First month", us: "100% free", competitor: "$29+ mandatory" },
  { feature: "Processing speed", us: "2-5 seconds", competitor: "5-15 seconds" },
  { feature: "Hidden fees", us: "None ever", competitor: "Surprise charges" },
  { feature: "Model selection", us: "10+ transparent", competitor: "2-3 hidden" },
  { feature: "Support quality", us: "Expert human help", competitor: "Bot responses" }
]

const urgencyReasons = [
  "🔥 Limited time: 85% savings vs competitors",
  "⚡ Process 3x faster than Pixelcut.ai",
  "🚀 Join 10,000+ professionals already saving",
  "💰 Save $2,000+ per month on average",
  "🎯 Get better results with transparent AI",
  "🛡️ No long-term contracts or commitments"
]

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-10"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/20 to-transparent"></div>
      
      <div className="container-responsive relative z-10">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-6 py-3 mb-8 glass-dark rounded-full"
          >
            <RocketLaunchIcon className="w-5 h-5 text-primary-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">
              Ready to Outperform Pixelcut.ai?
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6">
            Stop Overpaying for
            <br />
            <span className="text-gradient">Inferior Results</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Join the smart professionals who've made the switch to superior AI image processing. 
            Get better results, save 85% on costs, and process images 3x faster.
          </p>

          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-12">
            <Button variant="gradient" size="xl" className="text-lg px-12 py-5 group">
              Start Free - Process 10 Images Now
              <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="ghost-dark" size="xl" className="text-lg px-12 py-5">
              See Live Demo
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center glass-dark rounded-xl p-4"
              >
                <benefit.icon className="w-6 h-6 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm font-medium">
                  {benefit.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Urgency section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-dark rounded-3xl p-8 md:p-12 mb-16"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
            Why Switch Right Now?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgencyReasons.map((reason, index) => (
              <motion.div
                key={reason}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center text-gray-300 bg-gray-800/50 rounded-lg p-4"
              >
                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="font-medium">{reason}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-dark rounded-3xl p-8 md:p-12 mb-16"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-8">
            Final Reality Check: Us vs. Expensive Alternatives
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                    Comparison
                  </th>
                  <th className="text-center py-4 px-6">
                    <div className="text-gradient font-bold text-lg">
                      AI Image Studio
                    </div>
                    <div className="text-sm text-green-400 font-medium">
                      Smart Choice
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-gray-400 font-semibold">
                    Pixelcut & Others
                    <div className="text-sm text-red-400 font-medium">
                      Overpriced
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, index) => (
                  <motion.tr
                    key={item.feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-white">
                      {item.feature}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-green-400 font-semibold">
                        ✅ {item.us}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-red-400">
                        ❌ {item.competitor}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Don't Let Competitors Get Ahead
            </h3>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Every day you wait is money lost and opportunities missed. Join the professionals who've already made the smart switch.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button variant="gradient" size="xl" className="text-xl px-16 py-6 group">
                Start Free Trial Now
                <RocketLaunchIcon className="ml-3 w-6 h-6 group-hover:translate-y-[-2px] transition-transform" />
              </Button>
              <Button variant="ghost-dark" size="xl" className="text-xl px-16 py-6">
                Schedule Demo
              </Button>
            </div>

            <div className="text-sm text-gray-400 max-w-md mx-auto">
              No credit card required • Cancel anytime • 10 free images to start
              <br />
              <span className="text-green-400 font-medium">
                ⚡ Setup takes less than 30 seconds
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}