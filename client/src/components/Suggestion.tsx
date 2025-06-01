import React from "react";
import ReactMarkdown from "react-markdown";

interface SuggestionProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  suggestions: string;
  suggestionLoading: boolean;
}

export const Suggestion = ({
  isOpen,
  setIsOpen,
  suggestions,
  suggestionLoading,
}: SuggestionProps) => {
  return (
    isOpen && (
      <>
        <div className="fixed z-50 inset-0 flex items-center justify-center text-center shadow-md rounded">
          <div className="bg-white p-6 rounded shadow-lg w-1/2 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">AI Suggestion</h3>
            {suggestionLoading ? (
              <div className="z-50 flex justify-center items-center min-h-[200px]">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="max-h-90 overflow-y-auto custom-scrollbar">
                {/* {!suggestions && (
              <button className="pt-[25%]" onClick={handleSuggestion}>
                <SparklesIcon className="w-6 h-6 text-yellow-400 cursor-pointer" />
              </button>
            )} */}
                <div className="text-left">
                  <ReactMarkdown>{suggestions}</ReactMarkdown>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 ">
              <button
                className="text-gray-700 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </>
    )
  );
};
