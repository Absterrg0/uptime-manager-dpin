import { Activity, Shield, Globe, Zap, ArrowRight } from "lucide-react";
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 dark:opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-blue-500/10 w-fit mx-auto rounded-full p-2 mb-8">
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6">
              Decentralized Infrastructure Monitoring
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Monitor your web3 infrastructure with a network of independent validators. 
              Get real-time insights without single points of failure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center">
                Start Monitoring <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 dark:hover:bg-white/20 text-slate-900 dark:text-white px-8 py-4 rounded-lg font-semibold backdrop-blur-sm">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose DePin Monitor?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Our decentralized monitoring solution provides unparalleled reliability and transparency 
            for your web3 infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Decentralized Security",
              description: "No single point of failure. Our network of validators ensures reliable and tamper-proof monitoring."
            },
            {
              icon: Zap,
              title: "Real-Time Alerts",
              description: "Instant notifications when issues are detected. Stay ahead of problems before they affect your users."
            },
            {
              icon: Globe,
              title: "Global Coverage",
              description: "Validators distributed worldwide ensure accurate monitoring from multiple geographic locations."
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-xl p-8 hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
              <div className="bg-blue-500/10 w-fit rounded-lg p-3 mb-6">
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "99.99%", label: "Monitoring Uptime" },
              { value: "1000+", label: "Active Validators" },
              { value: "5s", label: "Alert Time" },
              { value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.value}</div>
                <div className="text-slate-600 dark:text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to secure your infrastructure?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the network of decentralized validators and start monitoring your infrastructure today.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Get Started Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-slate-900 dark:text-white mb-4 md:mb-0">
              <Activity className="w-6 h-6 mr-2" />
              <span className="font-bold">DePin Monitor</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm">
              © 2025 DePin Monitor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}