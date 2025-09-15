'use client'

import { motion } from 'framer-motion'
import { 
  CloudArrowUpIcon, 
  SparklesIcon, 
  ArrowDownTrayIcon,
  CpuChipIcon,
  LightBulbIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

const steps = [
  {
    id: 1,
    title: "Smart Upload",
    description: "Drag, drop, or paste your images. Our intelligent system analyzes each image and suggests the best AI models for optimal results.",
    icon: CloudArrowUpIcon,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Multi-format support (PNG, JPG, WEBP, HEIC)",
      "Batch upload up to 1000 images",
      "Auto-quality detection",
      "Smart size optimization"
    ],
    time: "< 1 second"
  },
  {
    id: 2,
    title: "AI Model Selection",
    description: "Choose from 10+ transparent AI models or let our system automatically select the best one based on your image type and desired outcome.",
    icon: CpuChipIcon,
    color: "from-purple-500 to-pink-500",
    features: [
      "10+ specialized AI models",
      "Real-time model comparison",
      "Custom model training",
      "Hybrid processing options"
    ],
    time: "Auto-selected"
  },
  {
    id: 3,
    title: "Lightning Processing",
    description: "Our optimized infrastructure processes images 3x faster than competitors using advanced queue management and parallel processing.",
    icon: SparklesIcon,
    color: "from-emerald-500 to-teal-500",
    features: [
      "Parallel GPU processing",
      "Smart queue management",
      "Real-time progress tracking",
      "Priority processing tiers"
    ],
    time: "2-5 seconds"
  },
  {
    id: 4,
    title: "Quality Enhancement",
    description: "Advanced post-processing ensures perfect results with automatic edge refinement, color optimization, and quality validation.",
    icon: LightBulbIcon,
    color: "from-orange-500 to-red-500",
    features: [
      "Edge refinement algorithms",
      "Color space optimization",
      "Automatic quality validation",
      "Smart artifact removal"
    ],
    time: "Built-in"
  },
  {
    id: 5,
    title: "Perfect Results",
    description: "Download your enhanced images in multiple formats and resolutions, or continue editing with our advanced tools.",
    icon: ArrowDownTrayIcon,
    color: "from-green-500 to-emerald-500",
    features: [
      "Multiple export formats",
      "Batch download options",
      "Cloud storage integration",
      "Version history tracking"
    ],
    time: "Instant"
  },
  {
    id: 6,
    title: "Continuous Improvement",
    description: "Our AI learns from every image to deliver better results over time, plus get detailed analytics on processing efficiency.",
    icon: CheckBadgeIcon,
    color: "from-indigo-500 to-purple-500",
    features: [
      "Machine learning optimization",
      "Performance analytics",
      "Success rate tracking",
      "Automated A/B testing"
    ],
    time: "Always learning"
  }
]

const processFlow = [
  { step: "Upload", description: "Smart detection" },
  { step: "Analyze", description: "AI model selection" },
  { step: "Process", description: "Lightning fast" },
  { step: "Enhance", description: "Quality refinement" },
  { step: "Download", description: "Perfect results" }
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-5"></div>
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
      
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
            <SparklesIcon className="w-5 h-5 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              3x Faster Than Pixelcut.ai
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            How Our <span className="text-gradient">Superior Process</span>
            <br />Delivers Amazing Results
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            While competitors use basic, slow processing, we've engineered an intelligent system that delivers professional results in seconds, not minutes.
          </p>
        </motion.div>

        {/* Process flow overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center mb-20"
        >
          <div className="flex items-center space-x-2 md:space-x-8 overflow-x-auto pb-4">
            {processFlow.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center flex-shrink-0"
              >
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold text-sm md:text-base mb-2">
                    {index + 1}
                  </div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                    {item.step}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.description}
                  </div>
                </div>
                {index < processFlow.length - 1 && (
                  <div className="mx-2 md:mx-4">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Detailed steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="card h-full p-8 hover:scale-105 transition-all duration-300">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} p-4 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-full h-full text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    {step.id}
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Processing time */}
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Processing Time:
                  </span>
                  <span className="text-sm font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
                    {step.time}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {step.features.map((feature) => (
                    <div key={feature} className="flex items-start text-sm">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 md:p-12 text-center"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Why Our Process Beats Pixelcut.ai
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">3x</div>
              <div className="text-gray-900 dark:text-white font-semibold mb-1">Faster Processing</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">2-5 seconds vs 5-10 seconds</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">10+</div>
              <div className="text-gray-900 dark:text-white font-semibold mb-1">AI Models</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Transparent selection vs hidden</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">85%</div>
              <div className="text-gray-900 dark:text-white font-semibold mb-1">Cost Savings</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Better results, lower prices</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}