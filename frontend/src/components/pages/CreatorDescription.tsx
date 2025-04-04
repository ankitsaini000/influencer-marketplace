'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export const CreatorDescription = () => {
  const router = useRouter();
  const [formData, setFormData] = useLocalStorage("creator-description", {
    description: "",
    faqs: [{ question: "", answer: "", isConfirmed: false }],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/requirements");
  };

  const addFAQ = () => {
    setFormData({
      ...formData,
      faqs: [
        ...formData.faqs,
        { question: "", answer: "", isConfirmed: false },
      ],
    });
  };

  const insertFormatting = (
    text: string,
    selectionStart: number,
    selectionEnd: number,
    format: string
  ) => {
    const prefix = text.substring(0, selectionStart);
    const selectedText = text.substring(selectionStart, selectionEnd) || "text";
    const suffix = text.substring(selectionEnd);

    switch (format) {
      case "bold":
        return `${prefix}**${selectedText}**${suffix}`;
      case "italic":
        return `${prefix}_${selectedText}_${suffix}`;
      case "bullet":
        const lines = selectedText.split("\n");
        const bulletList = lines.map((line) => `• ${line.trim()}`).join("\n");
        return `${prefix}\n${bulletList}\n${suffix}`;
      case "number":
        const numberedLines = selectedText.split("\n");
        const numberedList = numberedLines
          .map((line, i) => `${i + 1}. ${line.trim()}`)
          .join("\n");
        return `${prefix}\n${numberedList}\n${suffix}`;
      default:
        return text;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Progress Bar */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-20">
            <div className="flex items-center space-x-8 flex-1">
              {[
                { label: "Overview", step: 1, status: "completed" },
                { label: "Pricing", step: 2, status: "completed" },
                { label: "Description", step: 3, status: "current" },
                { label: "Requirements", step: 4, status: "upcoming" },
                { label: "Gallery", step: 5, status: "upcoming" },
                { label: "Linking", step: 6, status: "upcoming" },
                { label: "Publish", step: 7, status: "upcoming" },
              ].map((step) => (
                <div key={step.label} className="flex items-center space-x-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-sm
                    ${
                      step.status === "completed"
                        ? "bg-[#1dbf73] text-white"
                        : step.status === "current"
                        ? "bg-[#1dbf73] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.status === "completed" ? "✓" : step.step}
                  </div>
                  <span
                    className={
                      step.status === "current"
                        ? "text-gray-900 font-medium"
                        : step.status === "completed"
                        ? "text-gray-600"
                        : "text-gray-400"
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Save Options */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors rounded-md hover:bg-gray-50"
                type="button"
              >
                Save
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <button
                onClick={() => {
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors rounded-md hover:bg-gray-50 whitespace-nowrap"
                type="button"
              >
                Save & Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Description Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-black">Description</h2>
          <div className="border rounded-lg p-4">
            <div className="flex gap-4 mb-4">
              {/* Formatting Buttons */}
              <button
                type="button"
                className="p-2 text-black hover:bg-gray-100 rounded"
                title="Bold"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
                </svg>
              </button>

              {/* Italic Button */}
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById(
                    "description"
                  ) as HTMLTextAreaElement;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const newText = insertFormatting(
                    formData.description,
                    start,
                    end,
                    "italic"
                  );
                  setFormData({ ...formData, description: newText });
                  textarea.focus();
                  textarea.setSelectionRange(start + 1, end + 1);
                }}
                className="p-2 hover:bg-gray-100 rounded"
                title="Italic"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
                </svg>
              </button>

              {/* Bullet List Button */}
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById(
                    "description"
                  ) as HTMLTextAreaElement;
                  const { selectionStart, selectionEnd } = textarea;
                  const newText = insertFormatting(
                    formData.description,
                    selectionStart,
                    selectionEnd,
                    "bullet"
                  );
                  setFormData({ ...formData, description: newText });
                }}
                className="p-2 hover:bg-gray-100 rounded"
                title="Bullet List"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                </svg>
              </button>

              {/* Numbered List Button */}
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById(
                    "description"
                  ) as HTMLTextAreaElement;
                  const { selectionStart, selectionEnd } = textarea;
                  const newText = insertFormatting(
                    formData.description,
                    selectionStart,
                    selectionEnd,
                    "number"
                  );
                  setFormData({ ...formData, description: newText });
                }}
                className="p-2 hover:bg-gray-100 rounded"
                title="Numbered List"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
                </svg>
              </button>
            </div>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full min-h-[200px] border-0 focus:ring-0 resize-none"
              placeholder="Briefly Describe Your Gig"
            />
            <div className="text-right text-sm text-gray-500">
              {formData.description.length}/1200 Characters
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">
              Frequently Asked Questions
            </h2>
            <button
              onClick={addFAQ}
              className="text-black hover:text-gray-700"
            >
              + Add FAQ
            </button>
          </div>

          <div className="space-y-6">
            {formData.faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-4">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index].question = e.target.value;
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      placeholder="Add a Question"
                      className="w-full border-b border-dashed focus:ring-0 px-0"
                      disabled={faq.isConfirmed}
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index].answer = e.target.value;
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      placeholder="Add an Answer"
                      className="w-full min-h-[100px] border-b border-dashed focus:ring-0 px-0 resize-none"
                      disabled={faq.isConfirmed}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {!faq.isConfirmed ? (
                      <button
                        onClick={() => {
                          const newFaqs = [...formData.faqs];
                          newFaqs[index].isConfirmed = true;
                          setFormData({ ...formData, faqs: newFaqs });
                        }}
                        className="self-start p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="Confirm FAQ"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            const newFaqs = [...formData.faqs];
                            newFaqs[index].isConfirmed = false;
                            setFormData({ ...formData, faqs: newFaqs });
                          }}
                          className="self-start p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit FAQ"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            const newFaqs = formData.faqs.filter(
                              (_, i) => i !== index
                            );
                            setFormData({ ...formData, faqs: newFaqs });
                          }}
                          className="self-start p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Remove FAQ"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          // Update back button navigation
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-600 hover:text-gray-900"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#1dbf73] text-white rounded-md font-medium hover:bg-[#19a463] transition-colors"
          >
            Save & Continue
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};
