import { useState } from "react";
import { Skull, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { XRayUploader } from "@/components/XRayUploader";
import { ReconstructionResult } from "@/components/ReconstructionResult";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [frontalImage, setFrontalImage] = useState<string | null>(null);
  const [lateralImage, setLateralImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (file: File, view: "frontal" | "lateral") => {
    if (!file) {
      if (view === "frontal") setFrontalImage(null);
      else setLateralImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (view === "frontal") {
        setFrontalImage(reader.result as string);
      } else {
        setLateralImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const processReconstruction = async () => {
    if (!frontalImage || !lateralImage) {
      toast({
        title: "Missing X-rays",
        description: "Please upload both frontal and lateral X-ray images.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResultImage(null);
    setAnalysisData(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reconstruct-face`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            frontalImage,
            lateralImage,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reconstruct face");
      }

      const data = await response.json();
      setResultImage(data.reconstructedImage);
      setAnalysisData(data.analysisData);
      
      toast({
        title: "Reconstruction complete",
        description: "Face reconstruction has been successfully generated.",
      });
    } catch (error) {
      console.error("Reconstruction error:", error);
      toast({
        title: "Reconstruction failed",
        description: error instanceof Error ? error.message : "Failed to process images",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetReconstruction = () => {
    setFrontalImage(null);
    setLateralImage(null);
    setResultImage(null);
    setAnalysisData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Skull className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            AI Face Reconstruction
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced craniofacial reconstruction using artificial intelligence. Upload frontal and
            lateral skull X-rays to generate facial reconstruction.
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border shadow-medical">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                <h2 className="text-xl font-semibold">X-ray Input</h2>
              </div>
              
              <div className="space-y-6">
                <XRayUploader
                  label="Frontal View"
                  view="frontal"
                  onImageUpload={(file) => handleImageUpload(file, "frontal")}
                  uploadedImage={frontalImage}
                />
                
                <XRayUploader
                  label="Lateral View"
                  view="lateral"
                  onImageUpload={(file) => handleImageUpload(file, "lateral")}
                  uploadedImage={lateralImage}
                />
              </div>

              <Button
                onClick={processReconstruction}
                disabled={!frontalImage || !lateralImage || isProcessing}
                className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                size="lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {isProcessing ? "Processing..." : "Reconstruct Face"}
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> This is a demonstration interface. In production, connect
                to your specialized craniofacial reconstruction AI model for accurate results.
              </p>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border shadow-medical">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-accent to-secondary rounded-full" />
                <h2 className="text-xl font-semibold">Reconstruction Result</h2>
              </div>
              
          <ReconstructionResult 
            resultImage={resultImage}
            analysisData={analysisData}
            isProcessing={isProcessing}
            onReset={resetReconstruction}
          />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="font-semibold mb-2 text-primary">Medical Grade</h3>
            <p className="text-sm text-muted-foreground">
              Designed for clinical environments with DICOM compatibility
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="font-semibold mb-2 text-accent">AI Powered</h3>
            <p className="text-sm text-muted-foreground">
              Deep learning models trained on craniofacial data
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="font-semibold mb-2 text-secondary">Embeddable</h3>
            <p className="text-sm text-muted-foreground">
              Ready to integrate into your existing medical platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
