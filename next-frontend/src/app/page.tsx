import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  Network, 
  Lock, 
  Zap, 
  CheckCircle2, 
  Search, 
  Building2 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-hidden">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              B_Area
            </span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
            <Link href="#trust" className="hover:text-primary transition-colors">Trust & Safety</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8 animate__animated animate__fadeInDown">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
            The Premier Network for Verified Businesses
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-tight animate__animated animate__fadeInUp">
            Connect, Negotiate, and Close <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">B2B Deals</span> Faster.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate__animated animate__fadeInUp animate__delay-1s">
            List your company, showcase products, and connect directly with verified B2B providers. Zero hassle, intelligent discovery, and absolutely no internal data harvesting.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate__animated animate__fadeInUp animate__delay-2s">
            <Link 
              href="/register" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25"
            >
              Get Started for Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/search" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card text-foreground border border-border px-8 py-4 rounded-lg font-semibold hover:bg-muted hover:border-primary/50 transition-all duration-300"
            >
              <Search className="h-5 w-5 text-muted-foreground" /> Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Verification Banner */}
      <section className="border-y border-border/50 bg-muted/30 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span>Verified Business Profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent" />
              <span>Zero Data Selling</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <span>Direct Negotiations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <span>Secure Transactions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything You Need to Scale</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Replace scattered emails and spreadsheets with a unified ecosystem designed exclusively for B2B procurement and sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="b2b-card p-8 group hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">List Your Company</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create a rich, verified business profile. Showcase your capabilities, team, and operational locations to attract top-tier partners.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="b2b-card p-8 group hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Network className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect to Providers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access a global directory of verified suppliers, manufacturers, and service agencies. Skip the cold outreach and connect directly.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="b2b-card p-8 group hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">List Products & Services</h3>
              <p className="text-muted-foreground leading-relaxed">
                Publish your catalog with pricing, MOQs, and specifications. Let AI match your offerings with businesses actively searching for them.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="b2b-card p-8 group hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No More Hassle</h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage inquiries, chat in real-time, generate professional quotations, and track deal statuses from one centralized dashboard.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="b2b-card p-8 group hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Your Data is Yours</h3>
              <p className="text-muted-foreground leading-relaxed">
                We act as a bridge, not a data broker. Your proprietary conversations, product metrics, and deal flows are never sold or stored unnecessarily.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="b2b-card p-8 group hover:-translate-y-2 bg-gradient-to-br from-card to-primary/5">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                Built on Trust <span className="badge-verified">Verified Only</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Join a secure ecosystem where every business identity is authenticated, drastically reducing fraud and procurement risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your B2B Operations?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of verified businesses already closing deals, sourcing products, and expanding their network on B2B_Area.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="bg-background text-foreground px-8 py-4 rounded-lg font-bold hover:bg-muted hover:scale-105 transition-all shadow-xl"
            >
              Create Your Free Account
            </Link>
            <span className="text-primary-foreground/60 text-sm">Takes less than 2 minutes</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-foreground">
            <Building2 className="h-5 w-5" />
            <span className="font-bold">B2B_Area</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} B2B_Area. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}