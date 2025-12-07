import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Download, Send, Shield, Zap, Globe, Smartphone } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Transfer files across{' '}
              <span className="text-primary">any device</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              No apps. No accounts. No limits. Just scan and share — works everywhere.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link to="/receive">
                  <Download className="w-5 h-5 mr-2" />
                  Receive Files
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg">
                <Link to="/send">
                  <Send className="w-5 h-5 mr-2" />
                  Send Files
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              How it works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-4 p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold text-lg">Create a Room</h3>
                <p className="text-muted-foreground">
                  Click "Receive Files" on your desktop to generate a QR code and room code.
                </p>
              </div>
              
              <div className="text-center space-y-4 p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold text-lg">Scan & Connect</h3>
                <p className="text-muted-foreground">
                  Use your phone camera to scan the QR code, or enter the room code manually.
                </p>
              </div>
              
              <div className="text-center space-y-4 p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-lg">Transfer Files</h3>
                <p className="text-muted-foreground">
                  Select files to send. They'll transfer directly to the other device instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Built for privacy
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="p-6 rounded-xl bg-card border border-border">
                <Shield className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">100% P2P</h3>
                <p className="text-sm text-muted-foreground">
                  Files transfer directly between devices. Never touch our servers.
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border">
                <Zap className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Direct connections mean maximum transfer speeds.
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border">
                <Globe className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Cross-Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Works on any device with a browser. iPhone to Windows, Android to Mac.
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border">
                <Smartphone className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">No App Required</h3>
                <p className="text-sm text-muted-foreground">
                  Just open your browser and start transferring. Zero installation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Web-Drop — Secure, private file transfers</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
