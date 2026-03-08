import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send, Loader2, Search, X, Plus, ArrowLeft,
  MessageSquare, Users, Trash2, AlertCircle,
} from "lucide-react";
import { io } from "socket.io-client";
import { chatAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

function getMyId() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]))._id;
  } catch { return null; }
}

function getChatDisplayName(chat, myId) {
  if (chat.isGroupChat) return chat.chatName;
  const other = chat.users?.find((u) => u._id !== myId);
  return other?.fullname || other?.username || chat.chatName;
}

function getChatAvatar(chat, myId) {
  if (chat.isGroupChat) return null;
  const other = chat.users?.find((u) => u._id !== myId);
  return other?.fullname?.[0]?.toUpperCase() || "?";
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// Simple toast
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
      type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
    }`}>
      {type === "error" && <AlertCircle size={15} />}
      {message}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X size={13} /></button>
    </div>
  );
}

export default function ChatPage() {
  const [chats, setChats]                 = useState([]);
  const [selectedChat, setSelectedChat]   = useState(null);
  const [messages, setMessages]           = useState([]);
  const [newMessage, setNewMessage]       = useState("");
  const [loading, setLoading]             = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [unread, setUnread]               = useState({});
  const [toast, setToast]                 = useState(null); // { message, type }

  // DM search
  const [showSearch, setShowSearch]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);
  const [startingChat, setStartingChat]   = useState(null);

  // Group modal
  const [showGroupModal, setShowGroupModal]         = useState(false);
  const [groupName, setGroupName]                   = useState("");
  const [groupSearch, setGroupSearch]               = useState("");
  const [groupSearchRes, setGroupSearchRes]         = useState([]);
  const [groupSearching, setGroupSearching]         = useState(false);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [creatingGroup, setCreatingGroup]           = useState(false);
  const [groupError, setGroupError]                 = useState("");

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  const selectedChatRef  = useRef(null);
  const socketRef        = useRef(null);
  const messagesEndRef   = useRef(null);
  const searchTimeoutRef = useRef(null);
  const groupSearchRef   = useRef(null);

  const myId    = getMyId();
  const token   = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const showToast = (message, type = "error") => setToast({ message, type });

  // ── Socket ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { auth: { token }, reconnectionAttempts: 5 });
    socketRef.current.on("connect", () => console.log("✅ Socket connected"));

    socketRef.current.on("message received", (msg) => {
      const activeChatId   = selectedChatRef.current?._id;
      const incomingChatId = msg.chat._id;
      setChats((prev) =>
        prev.map((c) => c._id === incomingChatId ? { ...c, latestMessage: msg } : c)
      );
      if (activeChatId === incomingChatId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      } else {
        setUnread((prev) => ({ ...prev, [incomingChatId]: (prev[incomingChatId] || 0) + 1 }));
      }
    });

    return () => socketRef.current?.disconnect();
  }, []);

  // ── Load chats ───────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await chatAPI.fetchChats();
        const data = res.data?.data ?? res.data;
        setChats(Array.isArray(data) ? data : []);
      } catch (err) {
        showToast("Failed to load chats");
        console.error(err);
      } finally { setLoading(false); }
    })();
  }, []);

  // ── Select chat ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedChat) return;
    selectedChatRef.current = selectedChat;
    socketRef.current?.emit("join chat", selectedChat._id);
    setUnread((prev) => { const n = { ...prev }; delete n[selectedChat._id]; return n; });

    (async () => {
      setLoadingMsgs(true);
      try {
        const res  = await chatAPI.getMessages(selectedChat._id);
        const data = res.data?.data ?? res.data;
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
      finally { setLoadingMsgs(false); }
    })();
  }, [selectedChat]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── DM search ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res  = await chatAPI.searchUsers(searchQuery);
        const data = res.data?.data ?? res.data;
        setSearchResults((Array.isArray(data) ? data : []).filter((u) => u._id !== myId));
      } catch (err) { console.error(err); }
      finally { setSearching(false); }
    }, 350);
  }, [searchQuery]);

  // ── Group user search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!groupSearch.trim()) { setGroupSearchRes([]); return; }
    clearTimeout(groupSearchRef.current);
    groupSearchRef.current = setTimeout(async () => {
      setGroupSearching(true);
      try {
        const res  = await chatAPI.searchUsers(groupSearch);
        const data = res.data?.data ?? res.data;
        setGroupSearchRes(
          (Array.isArray(data) ? data : []).filter(
            (u) => u._id !== myId && !selectedGroupUsers.some((s) => s._id === u._id)
          )
        );
      } catch (err) { console.error(err); }
      finally { setGroupSearching(false); }
    }, 350);
  }, [groupSearch, selectedGroupUsers]);

  // ── Start DM ─────────────────────────────────────────────────────────────────
  const startChat = async (userId) => {
    setStartingChat(userId);
    try {
      const res  = await chatAPI.accessChat(userId);
      const chat = res.data?.data ?? res.data;
      setChats((prev) => prev.some((c) => c._id === chat._id) ? prev : [chat, ...prev]);
      setSelectedChat(chat);
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      showToast("Failed to open chat");
      console.error(err);
    } finally { setStartingChat(null); }
  };

  // ── Create group ──────────────────────────────────────────────────────────────
  const createGroup = async () => {
    setGroupError("");
    if (!groupName.trim()) { setGroupError("Please enter a group name"); return; }
    if (selectedGroupUsers.length < 2) { setGroupError("Add at least 2 members"); return; }

    setCreatingGroup(true);
    try {
      const userIds = selectedGroupUsers.map((u) => u._id);
      console.log("Creating group:", groupName.trim(), userIds); // debug

      const res  = await chatAPI.createGroupChat(groupName.trim(), userIds);
      const chat = res.data?.data ?? res.data;

      console.log("Group created:", chat); // debug

      if (!chat?._id) throw new Error("Invalid response from server");

      setChats((prev) => [chat, ...prev]);
      setSelectedChat(chat);
      setShowGroupModal(false);
      setGroupName("");
      setGroupSearch("");
      setSelectedGroupUsers([]);
      showToast("Group created!", "success");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to create group";
      setGroupError(msg);
      console.error("Group creation error:", err.response?.data || err);
    } finally { setCreatingGroup(false); }
  };

  // ── Delete chat ───────────────────────────────────────────────────────────────
  const deleteChat = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await chatAPI.deleteChat(confirmDelete._id);
      setChats((prev) => prev.filter((c) => c._id !== confirmDelete._id));
      if (selectedChat?._id === confirmDelete._id) { setSelectedChat(null); setMessages([]); }
      setConfirmDelete(null);
      showToast("Chat deleted", "success");
    } catch (err) {
      showToast("Failed to delete chat");
      console.error(err);
    } finally { setDeleting(false); }
  };

  // ── Send message ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const content = newMessage.trim();
    if (!content || !selectedChat) return;
    setNewMessage("");
    try {
      const res = await chatAPI.sendMessage({ chatId: selectedChat._id, content });
      const msg = res.data?.data ?? res.data;
      setMessages((prev) => prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]);
      setChats((prev) =>
        prev.map((c) => c._id === selectedChat._id ? { ...c, latestMessage: msg } : c)
      );
    } catch (err) { console.error(err); }
  }, [newMessage, selectedChat]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════════ */}
      <div className="w-80 flex flex-col border-r border-white/10 bg-gray-900 shrink-0">

        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft size={17} className="text-gray-400" />
            </button>
            <MessageSquare size={19} className="text-indigo-400" />
            <h1 className="text-base font-semibold">Messages</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setShowGroupModal(true); setGroupError(""); }}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              title="New group"
            >
              <Users size={14} />
            </button>
            <button
              onClick={() => { setShowSearch(true); setSearchQuery(""); setSearchResults([]); }}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
              title="New message"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* DM Search */}
        {showSearch && (
          <div className="border-b border-white/10 bg-gray-800/60">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or username..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}>
                <X size={15} className="text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {searching && <div className="flex justify-center py-4"><Loader2 size={17} className="animate-spin text-indigo-400" /></div>}
              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No users found</p>
              )}
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => startChat(user._id)}
                  disabled={!!startingChat}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {user.fullname?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.fullname}</p>
                    <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                  </div>
                  {startingChat === user._id && <Loader2 size={13} className="animate-spin text-indigo-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-400" /></div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-10 text-center">
              <MessageSquare size={28} className="text-gray-600" />
              <p className="text-gray-400 text-sm">No conversations yet</p>
              <button onClick={() => setShowSearch(true)} className="text-indigo-400 text-sm hover:text-indigo-300">+ Start a new chat</button>
            </div>
          ) : (
            chats.map((chat) => {
              const name        = getChatDisplayName(chat, myId);
              const avatar      = getChatAvatar(chat, myId);
              const isActive    = selectedChat?._id === chat._id;
              const unreadCount = unread[chat._id] || 0;

              return (
                <div
                  key={chat._id}
                  className={`group flex items-center gap-3 px-4 py-3.5 border-b border-white/5 transition-colors cursor-pointer ${
                    isActive ? "bg-indigo-600/20 border-l-2 border-l-indigo-500" : "hover:bg-white/5"
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isActive ? "bg-indigo-500" : chat.isGroupChat ? "bg-emerald-700" : "bg-gray-700"
                  }`}>
                    {chat.isGroupChat ? <Users size={16} /> : avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm truncate ${unreadCount > 0 ? "font-bold text-white" : "font-medium"}`}>{name}</p>
                      {chat.isGroupChat && (
                        <span className="text-[10px] bg-emerald-700/50 text-emerald-300 px-1.5 py-0.5 rounded-full shrink-0">group</span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${unreadCount > 0 ? "text-gray-200" : "text-gray-400"}`}>
                      {chat.latestMessage?.content || "No messages yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {unreadCount > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(chat); }}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                      title="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══ MESSAGE AREA ═════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
        {selectedChat ? (
          <>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-gray-900">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                selectedChat.isGroupChat ? "bg-emerald-700" : "bg-indigo-700"
              }`}>
                {selectedChat.isGroupChat ? <Users size={15} /> : getChatAvatar(selectedChat, myId)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm">{getChatDisplayName(selectedChat, myId)}</h2>
                <p className="text-xs text-gray-400">
                  {selectedChat.isGroupChat ? `${selectedChat.users?.length} members` : "Direct message"}
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(selectedChat)}
                className="p-2 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors"
                title="Delete chat"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-400" /></div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-600 text-sm">No messages yet — say hi! 👋</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender?._id === myId;
                  return (
                    <div key={msg._id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {msg.sender?.fullname?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className={`flex flex-col gap-0.5 max-w-xs md:max-w-md lg:max-w-lg ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && <span className="text-xs text-gray-400 px-1">{msg.sender?.fullname}</span>}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-800 text-gray-100 rounded-bl-sm"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-gray-900">
              <div className="flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-2.5 border border-white/10 focus-within:border-indigo-500/50 transition-colors">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl transition-colors shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-gray-500">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <MessageSquare size={28} className="text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-gray-400">Your Messages</p>
              <p className="text-sm mt-1">Select a chat or start a new one</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSearch(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors flex items-center gap-2">
                <Plus size={15} /> New message
              </button>
              <button onClick={() => { setShowGroupModal(true); setGroupError(""); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-xl transition-colors flex items-center gap-2">
                <Users size={15} /> New group
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ CREATE GROUP MODAL ═══════════════════════════════════════════════════ */}
      {showGroupModal && (
        <Modal title="Create Group Chat" onClose={() => { setShowGroupModal(false); setGroupName(""); setSelectedGroupUsers([]); setGroupSearch(""); setGroupError(""); }}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Group Name</label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Study Group"
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Add Members <span className="text-gray-500">(min 2)</span>
              </label>
              <div className="flex items-center gap-2 bg-gray-800 border border-white/10 rounded-xl px-3 py-2 focus-within:border-indigo-500/60 transition-colors">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                />
                {groupSearching && <Loader2 size={13} className="animate-spin text-indigo-400 shrink-0" />}
              </div>

              {groupSearchRes.length > 0 && (
                <div className="mt-1 max-h-40 overflow-y-auto bg-gray-800 border border-white/10 rounded-xl">
                  {groupSearchRes.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => { setSelectedGroupUsers((p) => [...p, user]); setGroupSearch(""); setGroupSearchRes([]); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {user.fullname?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm truncate">{user.fullname}</p>
                        <p className="text-xs text-gray-400">@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected user chips */}
            {selectedGroupUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedGroupUsers.map((u) => (
                  <span key={u._id} className="flex items-center gap-1.5 bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs px-2.5 py-1 rounded-full">
                    {u.fullname}
                    <button onClick={() => setSelectedGroupUsers((p) => p.filter((x) => x._id !== u._id))}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Error */}
            {groupError && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle size={13} />
                {groupError}
              </div>
            )}

            <button
              onClick={createGroup}
              disabled={creatingGroup}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {creatingGroup ? <Loader2 size={15} className="animate-spin" /> : <Users size={15} />}
              {creatingGroup ? "Creating..." : "Create Group"}
            </button>
          </div>
        </Modal>
      )}

      {/* ══ DELETE CONFIRM ═══════════════════════════════════════════════════════ */}
      {confirmDelete && (
        <Modal title="Delete Chat" onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Delete <span className="font-semibold text-white">{getChatDisplayName(confirmDelete, myId)}</span>?
              This permanently removes all messages.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-xl transition-colors">Cancel</button>
              <button onClick={deleteChat} disabled={deleting} className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ TOAST ════════════════════════════════════════════════════════════════ */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}