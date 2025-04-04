import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { useMessageStore, Message } from "../../store/messageStore";
import { formatDistanceToNow } from "date-fns";
import { Send, Search } from "lucide-react";

export const MessagePage = () => {
  const { messages, addMessage } = useMessageStore();
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(
    null
  );

  // Group messages by creator
  const chatsByCreator = useMemo(() => {
    const chats = new Map();

    messages.forEach((message: Message) => {
      const creatorId = message.creatorId;
      if (!chats.has(creatorId)) {
        chats.set(creatorId, {
          id: creatorId,
          name: message.creatorName,
          avatar: message.creatorAvatar,
          messages: [],
          lastMessage: null,
        });
      }
      chats.get(creatorId).messages.push(message);

      // Update last message
      if (
        !chats.get(creatorId).lastMessage ||
        message.timestamp > chats.get(creatorId).lastMessage.timestamp
      ) {
        chats.get(creatorId).lastMessage = message;
      }
    });

    return Array.from(chats.values())
      .filter(
        (chat) =>
          chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.messages.some(
            (msg: Message) =>
              msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
              msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
      .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  }, [messages, searchTerm]);

  // Set first chat as selected by default
  useEffect(() => {
    if (!selectedCreatorId && chatsByCreator.length > 0) {
      setSelectedCreatorId(chatsByCreator[0].id);
    }
  }, [chatsByCreator, selectedCreatorId]);

  const selectedChat = useMemo(
    () => chatsByCreator.find((chat) => chat.id === selectedCreatorId),
    [chatsByCreator, selectedCreatorId]
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCreatorId) return;

    addMessage({
      creatorId: selectedCreatorId,
      creatorName: selectedChat?.name || "",
      creatorAvatar: selectedChat?.avatar || "",
      content: newMessage,
      subject: "",
      senderType: "user",
    });

    setNewMessage("");
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-2rem)] m-4">
        {/* Chats List */}
        <div className="w-80 bg-white rounded-l-xl border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..."
                className="w-full px-4 py-2 pl-10 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {chatsByCreator.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedCreatorId(chat.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
                  selectedCreatorId === chat.id ? "bg-purple-50" : ""
                }`}
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{chat.name}</h3>
                    {chat.lastMessage?.subject && (
                      <p className="text-sm font-medium text-gray-600 truncate">
                        {chat.lastMessage.subject}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage?.content}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(
                        chat.lastMessage?.timestamp || Date.now(),
                        {
                          addSuffix: true,
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div className="flex-1 bg-white rounded-r-xl flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <img
                  src={selectedChat.avatar}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{selectedChat.name}</h3>
                  <span className="text-sm text-green-500">Online</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderType === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.senderType === "creator" && (
                    <img
                      src={message.creatorAvatar}
                      alt={message.creatorName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderType === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {message.subject && (
                      <p className="font-medium mb-1">{message.subject}</p>
                    )}
                    <p>{message.content}</p>
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(message.timestamp, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-r-xl flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
