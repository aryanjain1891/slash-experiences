"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Sparkles, Loader2, ArrowLeft, MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  initSession,
  submitAnswer,
  getNextQuestion,
  getSuggestions,
  goBack,
  askFollowup,
  resetSession,
} from "@/lib/ai-personalizer";
import ExperienceCard from "@/components/ExperienceCard";
import { useWishlist } from "@/contexts/WishlistContext";

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Suggestion {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  price: string;
  location?: string;
  duration?: string;
  category?: string;
  [key: string]: unknown;
}

type WizardPhase = "loading" | "questions" | "generating" | "results";

export default function GiftPersonalizerPage() {
  const [phase, setPhase] = useState<WizardPhase>("loading");
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(5);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [followupInput, setFollowupInput] = useState("");
  const [isFollowingUp, setIsFollowingUp] = useState(false);
  const [showFollowup, setShowFollowup] = useState(false);
  const [followupResponse, setFollowupResponse] = useState("");
  const hasInitialized = useRef(false);
  const { toggleWishlist, isWishlisted } = useWishlist();

  const initialize = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    try {
      setPhase("loading");
      const res = await initSession();
      setSessionId(res.sessionId);
      setCurrentQuestion(res.question);
      setStepIndex(0);
      setPhase("questions");
    } catch (err) {
      setError("Failed to start the personalizer. Please try again.");
      hasInitialized.current = false;
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleOptionClick = async (option: string) => {
    if (!sessionId || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      const submitRes = await submitAnswer(sessionId, option);

      if (submitRes.nextQuestion) {
        setCurrentQuestion(submitRes.nextQuestion);
        setStepIndex((s) => s + 1);
        setIsProcessing(false);
        return;
      }

      const nextRes = await getNextQuestion(sessionId);

      if (nextRes.done || !nextRes.question) {
        setPhase("generating");
        setStepIndex((s) => s + 1);
        const suggestionsRes = await getSuggestions(sessionId);
        setSuggestions(suggestionsRes.suggestions as Suggestion[]);
        setPhase("results");
      } else {
        setCurrentQuestion(nextRes.question);
        setStepIndex(nextRes.currentStep);
        setTotalSteps(Math.max(totalSteps, nextRes.currentStep + 2));
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = async () => {
    if (!sessionId || isProcessing || stepIndex === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await goBack(sessionId);
      setCurrentQuestion(res.question);
      setStepIndex((s) => Math.max(0, s - 1));
    } catch {
      setError("Couldn't go back. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFollowup = async () => {
    if (!followupInput.trim() || !sessionId || isFollowingUp) return;
    setIsFollowingUp(true);
    try {
      const res = await askFollowup(sessionId, followupInput.trim());
      setFollowupResponse(res.response);
      setFollowupInput("");

      const suggestionsRes = await getSuggestions(sessionId);
      setSuggestions(suggestionsRes.suggestions as Suggestion[]);
    } catch {
      setFollowupResponse("Sorry, I couldn't process that. Try again.");
    } finally {
      setIsFollowingUp(false);
    }
  };

  const handleStartOver = async () => {
    hasInitialized.current = false;
    setPhase("loading");
    setStepIndex(0);
    setCurrentQuestion(null);
    setSuggestions([]);
    setError(null);
    setShowFollowup(false);
    setFollowupResponse("");
    setFollowupInput("");

    try {
      if (sessionId) await resetSession(sessionId);
    } catch {
      /* ignore */
    }

    await initialize();
  };

  const progressPercent =
    phase === "results"
      ? 100
      : phase === "generating"
        ? 90
        : totalSteps > 0
          ? Math.round((stepIndex / totalSteps) * 100)
          : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Wand2 className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI Gift Personalizer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Let our AI help you find the perfect experience gift
          </p>
        </motion.div>

        {/* Progress */}
        {phase !== "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 max-w-md mx-auto"
          >
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground text-center mt-2">
              {phase === "results"
                ? "Complete!"
                : phase === "generating"
                  ? "Generating recommendations..."
                  : `Step ${stepIndex + 1}`}
            </p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Loading phase */}
        {phase === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Starting your session...</p>
          </motion.div>
        )}

        {/* Questions phase */}
        <AnimatePresence mode="wait">
          {phase === "questions" && currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl md:text-2xl">
                    {currentQuestion.text}
                  </CardTitle>
                  <CardDescription>
                    Choose the option that best fits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {currentQuestion.options.map((option) => (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleOptionClick(option)}
                        disabled={isProcessing}
                        className={cn(
                          "px-4 py-3 rounded-xl border-2 text-sm md:text-base font-medium transition-all",
                          "bg-white hover:bg-primary/5 hover:border-primary hover:text-primary",
                          "border-gray-200 text-gray-700",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>

                  {stepIndex > 0 && (
                    <div className="flex justify-start mt-6">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={isProcessing}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex justify-center mt-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generating phase */}
        {phase === "generating" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Sparkles className="h-12 w-12 text-primary mb-4 animate-pulse" />
            <p className="text-lg font-medium mb-2">
              Finding the perfect experiences...
            </p>
            <p className="text-muted-foreground text-sm">
              Our AI is analyzing your preferences
            </p>
          </motion.div>
        )}

        {/* Results phase */}
        {phase === "results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-medium">
                  Your Personalized Recommendations
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFollowup((v) => !v)}
                className="flex items-center gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                Not satisfied?
              </Button>
            </div>

            {/* Follow-up chat */}
            <AnimatePresence>
              {showFollowup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="mb-4">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <span className="font-medium">
                          Tell us what you&apos;d like different
                        </span>
                      </div>
                      {followupResponse && (
                        <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg mb-3">
                          {followupResponse}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <input
                          className="flex-1 border rounded-lg px-3 py-2 text-sm"
                          value={followupInput}
                          onChange={(e) => setFollowupInput(e.target.value)}
                          placeholder="e.g., something more adventurous, under ₹5000..."
                          disabled={isFollowingUp}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleFollowup();
                          }}
                        />
                        <Button
                          onClick={handleFollowup}
                          disabled={isFollowingUp || !followupInput.trim()}
                          size="sm"
                        >
                          {isFollowingUp ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Send"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions grid */}
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
                <CardDescription>
                  Curated just for you based on your preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {suggestions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestions.map((s) => (
                      <ExperienceCard
                        key={s.id}
                        id={s.id}
                        title={s.title}
                        image_url={s.image_url}
                        price={s.price}
                        location={s.location}
                        duration={s.duration}
                        category={s.category}
                        isWishlisted={isWishlisted(s.id)}
                        onToggleWishlist={toggleWishlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No suggestions available at the moment.
                    </p>
                  </div>
                )}

                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleStartOver}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start Over
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
