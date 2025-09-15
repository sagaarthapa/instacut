'use client'

import { motion } from 'framer-motion'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'

const plans = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for trying out our superior platform",
    features: [
      "10 images per month",
      "Background removal",
      "2x image upscaling",
      "Basic editing tools",
      "Community support",
      "Standard processing queue"
    ],
    notIncluded: [
      "Advanced AI models",
      "Batch processing",
      "Priority support",
      "Team collaboration",
      "API access",
      "Custom integrations"
    ],
    color: "from-gray-600 to-gray-700",
    popular: false,
    cta: "Start Free"
  },
  {
    name: "Pro",
    price: 9.99,
    period: "month",
    description: "For professionals who demand the best",
    features: [
      "Unlimited images",
      "All AI models available",
      "Up to 8x upscaling",
      "Advanced editing suite",
      "Batch processing (100 images)",
      "Priority processing queue",
      "Email support",
      "Export presets",
      "Usage analytics"
    ],
    notIncluded: [
      "Team collaboration",
      "API access",
      "Custom integrations",
      "White-label options"
    ],
    color: "from-primary-600 to-secondary-600",
    popular: true,
    cta: "Start Pro Trial"
  },
  {
    name: "Team",
    price: 29.99,
    period: "month",
    description: "Perfect for creative teams and agencies",
    features: [
      "Everything in Pro",
      "Team workspaces (10 users)",
      "Unlimited batch processing",
      "Real-time collaboration",
      "Advanced analytics",
      "Priority support",
      "API access (10K calls/month)",
      "Custom workflows",
      "Brand templates"
    ],
    notIncluded: [
      "White-label options",
      "Custom integrations",
      "Dedicated support"
    ],
    color: "from-purple-600 to-pink-600",
    popular: false,
    cta: "Start Team Trial"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations needing full control",
    features: [
      "Everything in Team",
      "Unlimited users",
      "Self-hosted deployment",
      "Custom AI model training",
      "White-label solution",
      "Custom integrations",
      "Dedicated support manager",
      "SLA guarantees",
      "Advanced security",
      "Custom contract terms"
    ],
    notIncluded: [],
    color: "from-emerald-600 to-teal-600",
    popular: false,
    cta: "Contact Sales"
  }
]

const comparison = [
  { feature: "Processing Speed", us: "2-5 seconds", pixelcut: "5-10 seconds" },
  { feature: "AI Models Available", us: "10+ transparent models", pixelcut: "2-3 hidden models" },
  { feature: "Cost Transparency", us: "Real-time tracking", pixelcut: "Hidden pricing" },
  { feature: "Batch Processing", us: "Advanced queue system", pixelcut: "Basic only" },
  { feature: "Self-hosting Option", us: "Full control", pixelcut: "Not available" },
  { feature: "API Access", us: "Comprehensive API", pixelcut: "Limited/expensive" },
  { feature: "Team Collaboration", us: "Real-time editing", pixelcut: "Basic sharing" },
  { feature: "Custom Models", us: "Train your own", pixelcut: "Not available" }
]

export default function Pricing() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-5"></div>
      
      <div className="container-responsive relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 mb-8 glass rounded-full"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              💰 85% Cheaper Than Competitors
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="text-gradient">Fair</span> Pricing,
            <br />Superior Value
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Why pay Pixelcut's premium prices for inferior features? Get more for less with transparent pricing and no hidden fees.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'lg:-mt-8 lg:scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`card pricing-card h-full p-8 ${plan.popular ? 'border-2 border-primary-500 shadow-2xl' : ''}`}>
                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 plan-name">
                    {plan.name}
                  </h3>
                  <div className="mb-4 price-container">
                    {typeof plan.price === 'number' ? (
                      <div>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white price-amount">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 price-period">
                          /{plan.period}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white price-amount">
                          {plan.price}
                        </span>
                        <div className="text-gray-500 dark:text-gray-400 price-period">
                          {plan.period}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                  
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-start opacity-50">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-400">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <Button
                  variant={plan.popular ? "gradient" : "primary"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Why We're Superior to Pixelcut.ai
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 text-gray-900 dark:text-white font-semibold">
                    Feature
                  </th>
                  <th className="text-center py-4 px-6">
                    <div className="text-gradient font-bold text-lg">
                      AI Image Studio
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-gray-600 dark:text-gray-400 font-semibold">
                    Pixelcut.ai
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
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                      {item.feature}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ✅ {item.us}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-red-500 dark:text-red-400">
                        ❌ {item.pixelcut}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Save 85% While Getting Better Results?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Join thousands who've made the smart switch from overpriced competitors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="xl" className="text-lg px-8 py-4">
                Start Free Trial - No Credit Card
              </Button>
              <Button variant="ghost" size="xl" className="text-lg px-8 py-4">
                See Live Demo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}