"use client";

import { useEditorStore } from "@/store";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import {
  CheckCircle,
  Clock,
  Crown,
  Loader2,
  Palette,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { createPaypalOrder } from "@/services/subscription-service";
import { useState } from "react";

function SubscriptionModal({ isOpen, onClose }) {
  const { userSubscription } = useEditorStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    const response = await createPaypalOrder();

    if (response.success) {
      window.location.href = response.data.approvalLink;
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={"sm:max-w-[900px] p-0 gap-0 overflow-hidden"}>
        <div className="flex flex-col md:flex-row">
          <div className="p-6 flex-1">
            {userSubscription?.isPremium ? (
              <>
                <DialogTitle
                  className={"text-2xl font-bold mb-4 flex items-center"}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
                  You're a Premium Member!
                </DialogTitle>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700 font-medium">
                      Premium active since{" "}
                      {new Date(
                        userSubscription?.premiumSince
                      ).toLocaleDateString() || "recently"}
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-6">
                  Enjoy all premium features and benefits!
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <Crown className="h-5 w-5 text-primary mr-0.5" />
                    <div>
                      <p className="font-medium">Premium Content</p>
                      <p className="text-sm text-muted-foreground">
                        {" "}
                        Access to all premium templates and assets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <Palette className="h-5 w-5 text-primary mr-0.5" />
                    <div>
                      <p className="font-medium">Brand Tools</p>
                      <p className="text-sm text-muted-foreground">
                        {" "}
                        Create and maintain consistent brand identity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <Clock className="h-5 w-5 text-primary mr-0.5" />
                    <div>
                      <p className="font-medium">Advanced Editing</p>
                      <p className="text-sm text-muted-foreground">
                        {" "}
                        Time-saving tools for professional designs
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <DialogTitle
                  className={"text-2xl font-bold mb-4 flex items-center"}
                >
                  Upgrade To Canva Premium
                </DialogTitle>
                <p className="text-sm mb-4">
                  Upgrade to{" "}
                  <span className="font-semibold">Canva Premium</span> and
                  create quality design together
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <Crown className="h-5 w-5 text-primary mr-0.5" />
                    <div>
                      <p className="font-medium">Premium Content</p>
                      <p className="text-sm text-muted-foreground">
                        {" "}
                        Access to all premium templates and assets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <Palette className="h-5 w-5 text-primary mr-0.5" />
                    <div>
                      <p className="font-medium">Brand Tools</p>
                      <p className="text-sm text-muted-foreground">
                        {" "}
                        Create and maintain consistent brand identity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <Clock className="h-5 w-5 text-primary mr-0.5" />
                    <div>
                      <p className="font-medium">Advanced Editing</p>
                      <p className="text-sm text-muted-foreground">
                        {" "}
                        Time-saving tools for professional designs
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Button
                    className={"w-full bg-purple-600 hover:bg-purple-700"}
                    onClick={handleUpgrade}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Upgrade"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="hidden md:block md:w-[450px]">
            <img
              src="https://media-hosting.imagekit.io/646b543ce33543f9/78697aa1-1660-42f3-9399-2b85512e9582.webp?Expires=1838412179&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=huLeTKW-cVpZp3udrMna5UfAj1yFd2FrHVHQDxAWxyMZ6Yw2OX~0Xo2VFO0dRxWAfJat2o0FpDQj63pN5Qn1VnmHAP3YYtMcYcDkpXkfVSAf2Nk8djoXKQuQxRWw99N6kKIZ8-I8P9iU~34Z4qWVd19uIhTKaAqmzwwxq4if-SXd10vK9vrgXvee27A1voxnfrHoWG72a6IFfuWIQy7FZX-QHImn-37gb2bGLsNNozxbihJNGI7WLdojWKJvOv5oX2vJr5Ig~F7z1DQydJVCm3yVTnez~5bSOJlb9Y11jb0VoTZsZJi9D3RdL-n-qksuvzFEhm4roFJlgealdiEbRQ__"
              alt="Team Collaboration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionModal;
