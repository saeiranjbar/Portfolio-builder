'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePortfolioStore } from '@/lib/store';
import { PortfolioData, PortfolioSection, Theme } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Send, Sparkles, Loader2, X, Wand2 } from 'lucide-react';
import { Confetti } from './effects/Confetti';


interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIWebsiteChatProps {
  onClose: () => void;
}

export function AIWebsiteChat({ onClose }: AIWebsiteChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI website assistant. Tell me about the website you'd like to create. For example: \"I need a website for my restaurant called Bella Vista\" or \"Create a portfolio for a freelance photographer\".",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const { setPortfolio } = usePortfolioStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
        return;
      }

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

      // If website was generated, apply it
      if (data.type === 'generate' && data.portfolio) {
        setIsGenerating(true);

        // Simulate a brief delay for UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { portfolio } = data;

        // Build the full portfolio data
        const newPortfolio: PortfolioData = {
          id: Math.random().toString(36).substr(2, 9),
          name: portfolio.navbar?.logo || 'My Website',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sections: portfolio.sections as PortfolioSection[],
          theme: {
            ...portfolio.theme,
            id: 'ai-generated',
            name: 'AI Generated',
          } as Theme,
          metadata: {
            title: portfolio.navbar?.logo || 'My Website',
            description: 'AI generated website',
          },
          navbar: {
            enabled: true,
            logo: portfolio.navbar?.logo || 'Your Business',
            logoType: 'text',
            showCTAButton: true,
            ctaButtonText: portfolio.navbar?.ctaButtonText || 'Get Started',
            ctaButtonLink: portfolio.navbar?.ctaButtonLink || '#contact',
            sticky: true,
            transparentOnTop: true,
            style: 'transparent',
          },
          availability: { enabled: false, text: 'Available for work', color: '#10b981' },
          darkMode: { enabled: false, active: false },
          customCSS: '',
          layoutMode: 'flexible',
          simpleLayout: {
            showSidebar: true,
            sidebarPosition: 'left',
            profileImage: '',
            profileName: portfolio.navbar?.logo || 'Your Name',
            profileTitle: '',
            profileLocation: '',
            availableForWork: true,
            availabilityText: 'Available for work',
            showStats: true,
            projectViews: 0,
            appreciations: 0,
            followers: 0,
            following: 0,
            sidebarSocialLinks: [],
            sidebarExperiences: [],
            sidebarAbout: '',
          },
        };

        setPortfolio(newPortfolio);

        // Trigger confetti celebration
        setShowConfetti(true);

        // Add summary message
        setMessages(prev => [...prev, { role: 'assistant', content: portfolio.aiSummary }]);

        // Close chat after a brief delay
        setTimeout(() => {
          setIsGenerating(false);
          onClose();
        }, 2500);

      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestionPrompts = [
    "I need a website for my restaurant called Bella Vista",
    "Create a portfolio for a freelance photographer",
    "I want a website for my marketing agency called GrowthLab",
    "Build a site for my fitness coaching business",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Website Builder</h2>
              <p className="text-xs text-white/80">Describe your website and I'll create it for you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                )}
              >
                {msg.role === 'assistant' && idx === 0 && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-blue-600">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">AI Assistant</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-500">
                    {isGenerating ? 'Building your website...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-200" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                  <Wand2 className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Creating your website...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion prompts (only show on first message) */}
        {messages.length === 1 && !isLoading && (
          <div className="px-6 py-3 border-t border-gray-100 bg-white">
            <p className="text-xs text-gray-400 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {suggestionPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the website you want to create..."
              disabled={isLoading || isGenerating}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isGenerating}
              className={cn(
                'p-3 rounded-xl transition-all',
                input.trim() && !isLoading && !isGenerating
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confetti celebration when website is generated */}
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
}


