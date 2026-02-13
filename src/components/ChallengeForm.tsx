"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Challenge } from "@/lib/challenges";
import { createChallengeAction, updateChallengeAction, uploadChallengeImageAction } from "@/lib/actions";
import { ArrowLeft, Save, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ChallengeFormStep1 from "./admin/ChallengeFormStep1";
import ChallengeFormStep2 from "./admin/ChallengeFormStep2";
import ChallengeFormStep3 from "./admin/ChallengeFormStep3";

interface ChallengeFormProps {
  initialData?: Challenge;
  mode: "create" | "edit";
}

export default function ChallengeForm({
  initialData,
  mode,
}: ChallengeFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Challenge>(
    initialData || {
      id: crypto.randomUUID(),
      title: "",
      difficulty: "Easy",
      colors: ["#ffffff"],
      defaultCode: `<div></div>
<style>
  div {
    width: 100px;
    height: 100px;
    background: #dd6b4d;
  }
</style>

<!-- OBJECTIVE -->
<!-- Write HTML/CSS in this editor and replicate the given target image in the least code possible. What you write here, renders as it is -->

<!-- SCORING -->
<!-- The score is calculated based on the number of characters you use (this comment included :P) and how close you replicate the image. -->

<!-- IMPORTANT: remove the comments before submitting -->`,
      targetCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 400px;
      height: 300px;
      background: #191919;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    div {
      width: 100px;
      height: 100px;
      background: #4F77FF;
    }
  </style>
</head>
<body>
  <div></div>
</body>
</html>`,
      imageUrl: "",
    },
  );

  const [colorInput, setColorInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Color Helpers ---
  const handleAddColor = () => {
    if (colorInput && /^#[0-9A-F]{6}$/i.test(colorInput)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...(prev.colors || []), colorInput.toUpperCase()],
      }));
      setColorInput("");
    }
  };

  const removeColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  // --- File Upload ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("File must be an image");
        e.target.value = "";
        return;
      }

      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadChallengeImageAction(fd);
        if (result.error) throw new Error(result.error);
        if (result.publicUrl) {
          setFormData((prev) => ({ ...prev, imageUrl: result.publicUrl }));
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        e.target.value = "";
      } finally {
        setIsUploading(false);
      }
    }
  };

  // --- Navigation ---
  const handleNextStep = () => {
    if (step === 1 && (!formData.id || !formData.title)) {
      alert("Please fill in ID and Title before proceeding.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  // --- Submit (called programmatically, NOT via <form>) ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createChallengeAction(formData);
      } else {
        await updateChallengeAction(formData);
      }
      router.push("/admin/challenges");
      router.refresh();
    } catch (err) {
      console.error("Failed to save challenge", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Using <div> instead of <form> to prevent Monaco editor keypresses
    // from accidentally triggering form submission (the auto-submit bug).
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md py-4 border-b border-white/5">
        <Link
          href="/admin/challenges"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-wider text-xs"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black rounded-xl glow hover:scale-105 transition-all uppercase tracking-wider text-xs"
            >
              <Save className="w-4 h-4" />{" "}
              {isSubmitting
                ? "SAVING..."
                : mode === "create"
                  ? "CREATE CHALLENGE"
                  : "SAVE CHANGES"}
            </button>
          )}

          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((prev) => prev - 1)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white font-black rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-wider text-xs order-first"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className={cn("flex flex-col gap-1 transition-colors", step === 1 ? "text-primary" : "text-white/40")}>
          <span className="text-[10px] uppercase font-black tracking-widest">Step 01</span>
          <span className="text-xl font-bold">General</span>
        </div>
        <div className="h-px w-12 bg-white/10" />
        <div className={cn("flex flex-col gap-1 transition-colors", step === 2 ? "text-primary" : "text-white/40")}>
          <span className="text-[10px] uppercase font-black tracking-widest">Step 02</span>
          <span className="text-xl font-bold">Target</span>
        </div>
        <div className="h-px w-12 bg-white/10" />
        <div className={cn("flex flex-col gap-1 transition-colors", step === 3 ? "text-primary" : "text-white/40")}>
          <span className="text-[10px] uppercase font-black tracking-widest">Step 03</span>
          <span className="text-xl font-bold">Initial</span>
        </div>
      </div>

      {/* Steps */}
      <div className="min-h-[600px]">
        {step === 1 && (
          <ChallengeFormStep1
            formData={formData}
            setFormData={setFormData}
            colorInput={colorInput}
            setColorInput={setColorInput}
            onAddColor={handleAddColor}
            onRemoveColor={removeColor}
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
          />
        )}
        {step === 2 && (
          <ChallengeFormStep2 formData={formData} setFormData={setFormData} />
        )}
        {step === 3 && (
          <ChallengeFormStep3 formData={formData} setFormData={setFormData} />
        )}
      </div>
    </div>
  );
}
