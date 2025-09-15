'use client'

import { motion } from 'framer-motion'
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Creative Director",
    company: "Digital Studios Inc.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    content: "Switched from Pixelcut to AI Image Studio and never looked back. The results are noticeably better and we're saving over $2,000/month. The batch processing alone has transformed our workflow.",
    rating: 5,
    stats: {
      timesSaved: "15 hours/week",
      costSaved: "$2,400/month",
      qualityImprovement: "40% better"
    },
    beforeAfter: {
      before: "Pixelcut: 8-12 seconds per image",
      after: "AI Studio: 2-4 seconds per image"
    },
    verified: true
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "E-commerce Manager",
    company: "TrendMart",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    content: "We process 500+ product images daily. AI Studio's transparent pricing saved us 85% compared to other services, and the quality is outstanding. The team collaboration features are game-changing.",
    rating: 5,
    stats: {
      timesSaved: "25 hours/week",
      costSaved: "$4,200/month",
      qualityImprovement: "Superior edges"
    },
    beforeAfter: {
      before: "Previous tool: $0.15 per image",
      after: "AI Studio: $0.02 per image"
    },
    verified: true
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Social Media Manager",
    company: "Brand Boost Agency",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    content: "The AI model transparency is incredible. I can see exactly which model works best for each client's style. Results are consistently better than what we got with expensive alternatives.",
    rating: 5,
    stats: {
      timesSaved: "12 hours/week",
      costSaved: "$1,800/month",
      qualityImprovement: "60% fewer revisions"
    },
    beforeAfter: {
      before: "Multiple tools needed",
      after: "One platform for everything"
    },
    verified: true
  },
  {
    id: 4,
    name: "David Kim",
    role: "Photography Studio Owner",
    company: "Elite Photography",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    content: "As a professional photographer, quality is everything. AI Studio delivers results that rival manual editing but in seconds. My clients are amazed by the turnaround time.",
    rating: 5,
    stats: {
      timesSaved: "30 hours/week",
      costSaved: "$3,600/month",
      qualityImprovement: "Professional grade"
    },
    beforeAfter: {
      before: "Manual editing: 10-15 min/image",
      after: "AI Studio: 30 seconds/image"
    },
    verified: true
  },
  {
    id: 5,
    name: "Lisa Park",
    role: "Startup Founder",
    company: "TechStart Co.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    content: "Budget was tight as a startup. AI Studio's pricing let us access professional-grade image processing without breaking the bank. The free tier alone handled our initial needs perfectly.",
    rating: 5,
    stats: {
      timesSaved: "8 hours/week",
      costSaved: "$1,200/month",
      qualityImprovement: "Enterprise level"
    },
    beforeAfter: {
      before: "Couldn't afford premium tools",
      after: "Professional results within budget"
    },
    verified: true
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Marketing Director",
    company: "Global Corp",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    content: "The analytics dashboard gives us insights we never had before. We can optimize our image processing strategy based on real data. ROI tracking shows 300% improvement in efficiency.",
    rating: 5,
    stats: {
      timesSaved: "40 hours/week",
      costSaved: "$5,000/month",
      qualityImprovement: "300% ROI"
    },
    beforeAfter: {
      before: "No processing insights",
      after: "Full analytics & optimization"
    },
    verified: true
  }
]

const companyLogos = [
  { name: "Digital Studios Inc.", logo: "DS" },
  { name: "TrendMart", logo: "TM" },
  { name: "Brand Boost Agency", logo: "BB" },
  { name: "Elite Photography", logo: "EP" },
  { name: "TechStart Co.", logo: "TC" },
  { name: "Global Corp", logo: "GC" }
]

const stats = [
  { number: "10,000+", label: "Happy customers" },
  { number: "50M+", label: "Images processed" },
  { number: "4.9/5", label: "Average rating" },
  { number: "85%", label: "Cost savings" }
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-5"></div>
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-secondary-500/5 rounded-full blur-3xl"></div>
      
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
            <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loved by 10,000+ Professionals
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Why Teams Choose Us Over
            <br /><span className="text-gradient">Pixelcut.ai</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. See how professionals are saving time, money, and getting better results with our superior platform.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="card h-full p-8 hover:scale-105 transition-all duration-300">
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center overflow-hidden">
                      <span className="text-xl font-bold text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {testimonial.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckBadgeIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-primary-600 font-medium">
                      {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    {testimonial.rating}.0
                  </span>
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Time Saved:</span>
                    <span className="font-semibold text-green-600">{testimonial.stats.timesSaved}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Cost Saved:</span>
                    <span className="font-semibold text-green-600">{testimonial.stats.costSaved}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Quality:</span>
                    <span className="font-semibold text-blue-600">{testimonial.stats.qualityImprovement}</span>
                  </div>
                </div>

                {/* Before/After */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Before: {testimonial.beforeAfter.before}
                  </div>
                  <div className="text-xs text-green-600">
                    After: {testimonial.beforeAfter.after}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companyLogos.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center space-x-2"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                    {company.logo}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">
                  {company.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}