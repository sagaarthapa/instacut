'use client'

import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  BoltIcon, 
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  RocketLaunchIcon,
  BeakerIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: SparklesIcon,
    title: "AI-Powered Everything",
    description: "Remove backgrounds, upscale images, and generate stunning visuals with cutting-edge AI models that surpass industry standards.",
    color: "from-blue-500 to-purple-600",
    delay: 0.1
  },
  {
    icon: BoltIcon,
    title: "Lightning Fast Processing", 
    description: "Real-time previews and 3x faster processing than Pixelcut. Our optimized pipeline delivers results in seconds, not minutes.",
    color: "from-yellow-500 to-orange-600",
    delay: 0.2
  },
  {
    icon: CpuChipIcon,
    title: "Multiple AI Models",
    description: "Choose from 10+ specialized AI models. Unlike competitors, you see exactly which model processes your image and can switch anytime.",
    color: "from-green-500 to-teal-600",
    delay: 0.3
  },
  {
    icon: CloudIcon,
    title: "Hybrid Cloud Architecture",
    description: "Smart routing between self-hosted and commercial APIs ensures 99.9% uptime while optimizing costs automatically.",
    color: "from-indigo-500 to-blue-600",
    delay: 0.4
  },
  {
    icon: ShieldCheckIcon,
    title: "Enterprise Security",
    description: "Your images never leave your control. Optional self-hosting means complete data privacy and security compliance.",
    color: "from-purple-500 to-pink-600",
    delay: 0.5
  },
  {
    icon: CurrencyDollarIcon,
    title: "85% Cost Savings",
    description: "Transparent pricing with massive savings. Self-hosting option eliminates per-image fees entirely for unlimited processing.",
    color: "from-emerald-500 to-green-600",
    delay: 0.6
  },
  {
    icon: RocketLaunchIcon,
    title: "Batch Processing",
    description: "Process hundreds of images simultaneously with our advanced queue system. Perfect for agencies and bulk workflows.",
    color: "from-red-500 to-orange-600",
    delay: 0.7
  },
  {
    icon: BeakerIcon,
    title: "Advanced Editing Tools",
    description: "Professional-grade editing suite with real-time adjustments, custom presets, and workflow automation.",
    color: "from-cyan-500 to-blue-600",
    delay: 0.8
  },
  {
    icon: ChartBarIcon,
    title: "Real-time Analytics",
    description: "Track usage, costs, performance metrics, and ROI. Complete transparency that competitors don't offer.",
    color: "from-violet-500 to-purple-600",
    delay: 0.9
  },
  {
    icon: CogIcon,
    title: "Admin Configuration",
    description: "Full control over AI models, routing rules, and cost thresholds. Configure everything from a powerful admin dashboard.",
    color: "from-slate-500 to-gray-600",
    delay: 1.0
  },
  {
    icon: UserGroupIcon,
    title: "Team Collaboration",
    description: "Shared workspaces, real-time collaboration, and project management tools designed for creative teams.",
    color: "from-pink-500 to-rose-600",
    delay: 1.1
  },
  {
    icon: DevicePhoneMobileIcon,
    title: "Mobile Optimized",
    description: "Perfect experience across all devices. Touch-optimized interface that works beautifully on phones, tablets, and desktops.",
    color: "from-amber-500 to-yellow-600",
    delay: 1.2
  }
]

export default function Features() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dots opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-secondary-400/20 to-accent-400/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      
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
            <SparklesIcon className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Superior Features
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Why We're 
            <span className="text-gradient"> Better</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Every feature designed to surpass Pixelcut.ai and deliver the ultimate image editing experience. 
            See why professionals are making the switch.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="feature-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay, duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="card-hover p-8 h-full">
                {/* Icon with gradient background */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-xl`}></div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="glass p-8 rounded-3xl max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Experience the Difference
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Join thousands of professionals who've upgraded from Pixelcut to our superior platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gradient text-lg px-8 py-4"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-ghost text-lg px-8 py-4"
              >
                Compare with Pixelcut
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}