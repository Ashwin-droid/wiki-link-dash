
import React, { useState, useEffect } from "react";
import { useGameContext } from "@/contexts/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameCreationFormProps {
  onGoBack: () => void;
  onGameCreated: (gameId: string) => void;
}

interface WikipediaArticleSuggestion {
  title: string;
  url: string;
}

const GameCreationForm: React.FC<GameCreationFormProps> = ({ onGoBack, onGameCreated }) => {
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [timeLimit, setTimeLimit] = useState(300); // 5 minutes default
  const [isCreating, setIsCreating] = useState(false);
  const [startPageOpen, setStartPageOpen] = useState(false);
  const [endPageOpen, setEndPageOpen] = useState(false);
  const [startSuggestions, setStartSuggestions] = useState<WikipediaArticleSuggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<WikipediaArticleSuggestion[]>([]);
  const [isLoadingStartSuggestions, setIsLoadingStartSuggestions] = useState(false);
  const [isLoadingEndSuggestions, setIsLoadingEndSuggestions] = useState(false);
  const { createGame } = useGameContext();
  const { toast } = useToast();

  // Fetch Wikipedia suggestions for start page
  useEffect(() => {
    const fetchStartSuggestions = async () => {
      if (!startPage.trim() || startPage.startsWith("/wiki/")) return;
      
      setIsLoadingStartSuggestions(true);
      try {
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(startPage)}&limit=10&namespace=0&origin=*&format=json`
        );
        const data = await response.json();
        
        // Format the suggestions
        const titles = data[1] || [];
        const urls = data[3] || [];
        
        const suggestions: WikipediaArticleSuggestion[] = titles.map((title: string, index: number) => ({
          title,
          url: urls[index],
        }));
        
        setStartSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching Wikipedia suggestions:", error);
      } finally {
        setIsLoadingStartSuggestions(false);
      }
    };
    
    const debounceTimer = setTimeout(fetchStartSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [startPage]);

  // Fetch Wikipedia suggestions for end page
  useEffect(() => {
    const fetchEndSuggestions = async () => {
      if (!endPage.trim() || endPage.startsWith("/wiki/")) return;
      
      setIsLoadingEndSuggestions(true);
      try {
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(endPage)}&limit=10&namespace=0&origin=*&format=json`
        );
        const data = await response.json();
        
        // Format the suggestions
        const titles = data[1] || [];
        const urls = data[3] || [];
        
        const suggestions: WikipediaArticleSuggestion[] = titles.map((title: string, index: number) => ({
          title,
          url: urls[index],
        }));
        
        setEndSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching Wikipedia suggestions:", error);
      } finally {
        setIsLoadingEndSuggestions(false);
      }
    };
    
    const debounceTimer = setTimeout(fetchEndSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [endPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startPage || !endPage) {
      toast({
        title: "Missing information",
        description: "Please select both start and end pages",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // In a real implementation, we would validate that these are actual Wikipedia pages
      const formattedStartPage = formatWikiUrl(startPage);
      const formattedEndPage = formatWikiUrl(endPage);
      
      const gameId = createGame(formattedStartPage, formattedEndPage, timeLimit);
      // Instead of testing the return value, we'll just call onGameCreated
      onGameCreated(formattedStartPage);
    } catch (error) {
      toast({
        title: "Failed to create game",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Helper function to format Wikipedia URLs consistently
  const formatWikiUrl = (input: string): string => {
    // Basic formatting - in a real app, we'd use the Wikipedia API
    let page = input.trim();
    
    // If it's a full URL, extract the page name
    if (page.includes("wikipedia.org/wiki/")) {
      page = page.split("/wiki/")[1];
    }
    
    // Replace spaces with underscores for Wikipedia format
    page = page.replace(/\s+/g, "_");
    
    return "/wiki/" + page;
  };

  const handleSelectStartPage = (suggestion: WikipediaArticleSuggestion) => {
    setStartPage(suggestion.title);
    setStartPageOpen(false);
  };

  const handleSelectEndPage = (suggestion: WikipediaArticleSuggestion) => {
    setEndPage(suggestion.title);
    setEndPageOpen(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create a New Game</CardTitle>
        <CardDescription>Set up your Hyperlink Hustle challenge</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="startPage" className="text-sm font-medium">
              Start Wikipedia Page
            </label>
            <Popover open={startPageOpen} onOpenChange={setStartPageOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={startPageOpen}
                  className="w-full justify-between"
                >
                  {startPage ? startPage : "Select start page..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search Wikipedia..." 
                    value={startPage}
                    onValueChange={setStartPage}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isLoadingStartSuggestions ? "Loading..." : "No articles found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {startSuggestions.map((suggestion) => (
                        <CommandItem
                          key={suggestion.url}
                          value={suggestion.title}
                          onSelect={() => handleSelectStartPage(suggestion)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              startPage === suggestion.title ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {suggestion.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="endPage" className="text-sm font-medium">
              End Wikipedia Page
            </label>
            <Popover open={endPageOpen} onOpenChange={setEndPageOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={endPageOpen}
                  className="w-full justify-between"
                >
                  {endPage ? endPage : "Select end page..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search Wikipedia..." 
                    value={endPage}
                    onValueChange={setEndPage}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isLoadingEndSuggestions ? "Loading..." : "No articles found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {endSuggestions.map((suggestion) => (
                        <CommandItem
                          key={suggestion.url}
                          value={suggestion.title}
                          onSelect={() => handleSelectEndPage(suggestion)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              endPage === suggestion.title ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {suggestion.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="timeLimit" className="text-sm font-medium">
              Time Limit: {timeLimit} seconds
            </label>
            <Slider
              id="timeLimit"
              min={60}
              max={3600}
              step={30}
              value={[timeLimit]}
              onValueChange={(values) => setTimeLimit(values[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 minute</span>
              <span>60 minutes</span>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onGoBack}>
              Back
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Game"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GameCreationForm;
