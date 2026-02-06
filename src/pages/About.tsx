import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

const technologies = [
  { name: 'React 18', description: 'UI Framework', url: 'https://react.dev' },
  { name: 'TypeScript', description: 'Type Safety', url: 'https://www.typescriptlang.org' },
  { name: 'Three.js', description: '3D Rendering', url: 'https://threejs.org' },
  { name: '@react-three/fiber', description: 'React Three.js', url: 'https://docs.pmnd.rs/react-three-fiber' },
  { name: 'Tailwind CSS', description: 'Styling', url: 'https://tailwindcss.com' },
  { name: 'Vite', description: 'Build Tool', url: 'https://vitejs.dev' },
  { name: 'fflate', description: 'Decompression', url: 'https://github.com/101arrowz/fflate' },
  { name: 'Supabase', description: 'Backend', url: 'https://supabase.com' },
];

const features = [
  {
    title: 'Multi-Format Support',
    description: 'Load FBX, OBJ, and GLTF/GLB 3D models with automatic format detection and optimized parsing.',
  },
  {
    title: 'Real-time Visualization',
    description: 'Toggle between surface, wireframe, edges, and topology views with smooth transitions.',
  },
  {
    title: 'HDR Environment',
    description: 'Realistic lighting with rotatable HDR environment maps and adjustable exposure.',
  },
  {
    title: 'Animation Playback',
    description: 'Play and control animations with timeline scrubbing and speed adjustment.',
  },
  {
    title: 'Topology Analysis',
    description: 'Analyze mesh topology with quad/tri/ngon breakdowns and edge statistics.',
  },
  {
    title: 'GPU Statistics',
    description: 'Real-time vertex, triangle, object, material, and texture counts.',
  },
];

const SlideIndicators = ({ current, total }: { current: number; total: number }) => (
  <div className="flex justify-center gap-2 py-4">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-2 h-2 rounded-full transition-colors",
          i === current ? "bg-primary" : "bg-muted-foreground/30"
        )}
      />
    ))}
  </div>
);

export default function About() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="glass-panel border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Viewer
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-stat-materials bg-clip-text text-transparent">
              3D Model Viewer
            </h1>
          </div>
        </div>
      </header>

      <main className="relative">
        <Carousel
          setApi={setApi}
          className="w-full h-[calc(100vh-80px)]"
          opts={{ loop: false }}
        >
          <CarouselContent>
            {/* Slide 1: Hero */}
            <CarouselItem>
              <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4">
                <section className="text-center space-y-4 max-w-3xl mx-auto">
                  <h2 className="text-4xl font-bold">
                    How It Works
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    A modern web-based 3D model viewer built with React and Three.js.
                    Drag and drop your models to explore them with powerful visualization tools.
                  </p>
                </section>
              </div>
            </CarouselItem>

            {/* Slide 2: Architecture Diagram */}
            <CarouselItem>
              <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4 py-8 overflow-y-auto">
                <section className="space-y-6 max-w-6xl mx-auto w-full">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold mb-2">Architecture</h3>
                    <p className="text-muted-foreground">
                      Hover over each component to learn more about its role
                    </p>
                  </div>
                  <Card className="glass-panel overflow-hidden">
                    <CardContent className="p-6">
                      <ArchitectureDiagram />
                    </CardContent>
                  </Card>
                </section>
              </div>
            </CarouselItem>

            {/* Slide 3: Features Grid */}
            <CarouselItem>
              <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4 py-8 overflow-y-auto">
                <section className="space-y-6 max-w-6xl mx-auto w-full">
                  <h3 className="text-2xl font-semibold text-center">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature) => (
                      <Card key={feature.title} className="glass-panel hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{feature.description}</CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              </div>
            </CarouselItem>

            {/* Slide 4: Technology Stack + CTA */}
            <CarouselItem>
              <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4 py-8 overflow-y-auto">
                <section className="space-y-8 max-w-4xl mx-auto w-full">
                  <h3 className="text-2xl font-semibold text-center">Technology Stack</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {technologies.map((tech) => (
                      <a
                        key={tech.name}
                        href={tech.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                      >
                        <Badge
                          variant="secondary"
                          className="px-4 py-2 text-sm gap-2 hover:bg-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
                        >
                          {tech.name}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Badge>
                      </a>
                    ))}
                  </div>
                  <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
                    Built with modern web technologies for optimal performance and developer experience.
                  </p>

                  {/* CTA */}
                  <div className="text-center py-8">
                    <Link to="/">
                      <Button size="lg" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Try the Viewer
                      </Button>
                    </Link>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-sm text-muted-foreground pt-8">
                    <p>3D Model Viewer • Built with ❤️ using React & Three.js</p>
                  </div>
                </section>
              </div>
            </CarouselItem>
          </CarouselContent>

          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        <SlideIndicators current={current} total={4} />
      </main>
    </div>
  );
}
