import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReconstructionResultProps {
  resultImage: string | null;
  analysisData: any;
  isProcessing: boolean;
  onReset: () => void;
}

export const ReconstructionResult = ({
  resultImage,
  analysisData,
  isProcessing,
  onReset,
}: ReconstructionResultProps) => {
  const downloadImage = () => {
    if (!resultImage) return;

    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `face-reconstruction-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-card rounded-lg border border-border">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Processing X-ray data...</p>
          <p className="text-xs text-muted-foreground">AI reconstruction in progress</p>
        </div>
      </div>
    );
  }

  if (!resultImage && !analysisData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-muted/30 rounded-lg border-2 border-dashed border-border">
        <div className="p-4 rounded-full bg-muted">
          <RefreshCw className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">No reconstruction yet</p>
          <p className="text-xs text-muted-foreground">Upload X-rays and process to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {resultImage && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Reconstructed Face</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative flex justify-center bg-muted/10 rounded-lg p-6">
              <img 
                src={resultImage} 
                alt="Reconstructed face" 
                className="max-w-md rounded-lg shadow-lg"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={downloadImage}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="outline" 
                onClick={onReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisData && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Facial Reconstruction Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="bg-muted/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Basic Profile</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Face Shape:</span> {analysisData.faceShape}</p>
                    <p><span className="font-semibold">Estimated Age:</span> {analysisData.estimatedAge}</p>
                    <p><span className="font-semibold">Sex:</span> {analysisData.sex}</p>
                    <p><span className="font-semibold">Ancestry:</span> {analysisData.ancestry}</p>
                  </div>
                </div>

                <div className="bg-muted/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Soft Tissue Depth</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Forehead:</span> {analysisData.softTissueDepth?.forehead}</p>
                    <p><span className="font-semibold">Cheeks:</span> {analysisData.softTissueDepth?.cheeks}</p>
                    <p><span className="font-semibold">Chin:</span> {analysisData.softTissueDepth?.chin}</p>
                  </div>
                </div>
              </div>

              {/* Facial Features */}
              <div className="space-y-4">
                <div className="bg-muted/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Facial Features</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Forehead:</span> {analysisData.facialFeatures?.foreheadShape}</p>
                    <p><span className="font-semibold">Eyes:</span> {analysisData.facialFeatures?.eyeShape}</p>
                    <p><span className="font-semibold">Nose:</span> {analysisData.facialFeatures?.noseShape}</p>
                    <p><span className="font-semibold">Mouth:</span> {analysisData.facialFeatures?.mouthShape}</p>
                    <p><span className="font-semibold">Jawline:</span> {analysisData.facialFeatures?.jawline}</p>
                    <p><span className="font-semibold">Cheekbones:</span> {analysisData.facialFeatures?.cheekbones}</p>
                    <p><span className="font-semibold">Skin Tone:</span> {analysisData.facialFeatures?.skinTone}</p>
                    <p><span className="font-semibold">Hair:</span> {analysisData.facialFeatures?.hairType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reconstruction Notes */}
            {analysisData.reconstructionNotes && (
              <div className="bg-muted/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-primary">Reconstruction Notes</h3>
                <p className="text-sm leading-relaxed">{analysisData.reconstructionNotes}</p>
              </div>
            )}

            {/* Detailed Description */}
            {analysisData.detailedDescription && (
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                <h3 className="text-lg font-semibold mb-2 text-primary">Complete Description</h3>
                <p className="text-sm leading-relaxed">{analysisData.detailedDescription}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
