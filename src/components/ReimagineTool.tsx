import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReimaginedContent {
  territory: string;
  content: string;
  timestamp: Date;
}

export function ReimagineTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [territory, setTerritory] = useState("");
  const [customTerritory, setCustomTerritory] = useState("");
  const [reimaginedContent, setReimaginedContent] = useState<ReimaginedContent | null>(null);
  const { toast } = useToast();

  const predefinedTerritories = [
    "Mars 2040",
    "Underwater City 2035", 
    "Space Station Alpha",
    "Cyberpunk Tokyo 2077",
    "Medieval Fantasy Realm",
    "Steampunk London 1890",
    "Post-Apocalyptic Earth 2150",
    "Ancient Egypt 3000 BC",
    "Custom"
  ];

  const convertToMarkdown = (): string => {
    // Get the main content from the page
    const content = document.querySelector('main') || document.body;
    
    // Simple markdown conversion
    let markdown = "# Website Content\n\n";
    
    // Extract text content and structure
    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const paragraphs = content.querySelectorAll('p');
    const buttons = content.querySelectorAll('button');
    const links = content.querySelectorAll('a');
    
    if (headings.length > 0) {
      markdown += "## Headings\n";
      headings.forEach(h => {
        const level = h.tagName.toLowerCase();
        const prefix = '#'.repeat(parseInt(level.charAt(1)));
        markdown += `${prefix} ${h.textContent?.trim()}\n`;
      });
      markdown += "\n";
    }
    
    if (paragraphs.length > 0) {
      markdown += "## Content\n";
      paragraphs.forEach(p => {
        if (p.textContent?.trim()) {
          markdown += `${p.textContent.trim()}\n\n`;
        }
      });
    }
    
    if (buttons.length > 0) {
      markdown += "## Interactive Elements\n";
      buttons.forEach(btn => {
        if (btn.textContent?.trim()) {
          markdown += `- Button: ${btn.textContent.trim()}\n`;
        }
      });
      markdown += "\n";
    }
    
    return markdown;
  };

  const generateReimaginedContent = async (originalMarkdown: string, targetTerritory: string): Promise<string> => {
    // Simulate AI reimagining - in a real implementation, this would call an AI API
    const prompt = `Transform this website content for ${targetTerritory}. Keep the same structure and functionality but adapt the language, styling, and concepts to fit this new setting:\n\n${originalMarkdown}`;
    
    // Mock response based on territory
    const mockResponses = {
      "Mars 2040": `# Martian Web Interface 2040\n\n## Navigation Hub\n### Red Planet Central Command\n\nWelcome to the Martian digital ecosystem. Our quantum-encrypted communication network connects all dome cities across the red planet.\n\n## Atmospheric Data\nCurrent oxygen levels: 21.3% (Optimal)\nDust storm probability: Low\nSolar panel efficiency: 94%\n\n## Interactive Elements\n- Button: Connect Neural Interface\n- Button: Access Colony Resources\n- Button: Interplanetary Communication`,
      
      "Underwater City 2035": `# Aquatic Digital Network 2035\n\n## Deep Sea Navigation\n### Oceanic Command Center\n\nDive into our bio-luminescent interface system. Connected through hydro-fiber networks spanning the ocean floor.\n\n## Environmental Status\nWater pressure: Optimal\nOxygen recycling: 98.7% efficiency\nKelp forest cultivation: Thriving\n\n## Interactive Elements\n- Button: Activate Submersible Mode\n- Button: Marine Resource Management\n- Button: Surface Communication Link`,
      
      "Space Station Alpha": `# Orbital Interface Alpha\n\n## Zero-G Navigation\n### Space Command Module\n\nFloating through our weightless digital environment. Anti-gravity interface designed for optimal space operations.\n\n## Station Metrics\nOrbital velocity: 7.66 km/s\nLife support: Green\nSolar array output: 100%\n\n## Interactive Elements\n- Button: Activate Magnetic Boots\n- Button: Cargo Bay Access\n- Button: Earth Communication Array`
    };
    
    return mockResponses[targetTerritory as keyof typeof mockResponses] || 
           `# ${targetTerritory} Interface\n\nTransformed content for ${targetTerritory} environment with adapted terminology and context while maintaining original functionality.`;
  };

  const handleReimagine = async () => {
    const selectedTerritory = territory === "Custom" ? customTerritory : territory;
    
    if (!selectedTerritory) {
      toast({
        title: "Territory Required",
        description: "Please select or enter a territory/time period",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert current page to markdown
      const markdown = convertToMarkdown();
      
      // Generate reimagined content
      const reimagined = await generateReimaginedContent(markdown, selectedTerritory);
      
      setReimaginedContent({
        territory: selectedTerritory,
        content: reimagined,
        timestamp: new Date()
      });

      toast({
        title: "Content Reimagined",
        description: `Successfully reimagined website for ${selectedTerritory}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reimagine content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!reimaginedContent) return;
    
    const blob = new Blob([reimaginedContent.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reimagined-${reimaginedContent.territory.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:from-purple-500/20 hover:to-pink-500/20"
        >
          <Sparkles className="h-4 w-4" />
          Re-imagine
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Re-imagine Website
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Territory Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Territory/Time Period</label>
            <Select value={territory} onValueChange={setTerritory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a territory or time period..." />
              </SelectTrigger>
              <SelectContent>
                {predefinedTerritories.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {territory === "Custom" && (
              <Input
                placeholder="Enter custom territory (e.g., 'Steampunk London 1890', 'Floating City 2099')"
                value={customTerritory}
                onChange={(e) => setCustomTerritory(e.target.value)}
              />
            )}
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleReimagine} 
            disabled={isLoading || (!territory || (territory === "Custom" && !customTerritory))}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Reimagining...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Reimagine Website
              </>
            )}
          </Button>

          {/* Results */}
          {reimaginedContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Reimagined for: {reimaginedContent.territory}
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadMarkdown}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              
              <Textarea
                value={reimaginedContent.content}
                readOnly
                className="h-64 font-mono text-sm"
                placeholder="Reimagined content will appear here..."
              />
              
              <p className="text-xs text-muted-foreground">
                Generated on {reimaginedContent.timestamp.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}