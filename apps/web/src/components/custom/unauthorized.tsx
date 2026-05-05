import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Background Decorative Elements */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        
        <Card className="relative overflow-hidden border-2 shadow-2xl backdrop-blur-sm bg-background/95">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
          
          <CardHeader className="pt-10 pb-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
              <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Access Denied</CardTitle>
            <CardDescription className="text-base mt-2 px-4">
              You don't have the necessary permissions to access this module.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center px-8 pb-8">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This area is restricted to authorized personnel only. If you believe this is an error, please contact your department administrator to request access.
            </p>
          </CardContent>

          <CardFooter className="bg-muted/30 p-6 border-t">
            <Button 
              variant="outline" 
              className="w-full gap-2 h-11"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
