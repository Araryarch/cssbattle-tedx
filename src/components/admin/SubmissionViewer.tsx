import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { X, Code, Eye, Target, Send, MessageSquare, Reply, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCommentsAction, postCommentAction } from "@/lib/comment-actions";
import { useUser } from "@/components/UserProvider";
import { toast } from "sonner";

interface Submission {
  id: string;
  userName: string | null;
  challengeTitle: string | null;
  challengeTarget: string | null;
  challengeImage: string | null;
  code: string;
  score: string;
  accuracy: string;
  duration: number | null;
  chars: number | null;
  createdAt: Date;
}

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    userId: string;
    userName: string | null;
    userImage: string | null;
    parentId: string | null;
}

interface SubmissionViewerProps {
  submission: Submission;
  onClose: () => void;
}

export default function SubmissionViewer({
  submission,
  onClose,
}: SubmissionViewerProps) {
  const { user } = useUser();
  const [showTarget, setShowTarget] = useState(false);
  
  // Comment State
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
     loadComments();
  }, [submission.id]);

  const loadComments = () => {
    getCommentsAction(submission.id).then(res => {
        setComments(res);
        setLoadingComments(false);
    });
  };

  const handlePostComment = async (parentId?: string) => {
      const content = parentId ? replyContent : newComment;
      if (!content.trim()) return;
      
      if (!user) {
          toast.error("Please login to comment");
          return;
      }
      
      setPosting(true);
      const res = await postCommentAction(submission.id, content, parentId);
      if (res.success) {
          if (parentId) {
              setReplyContent("");
              setReplyingTo(null);
          } else {
              setNewComment("");
          }
          loadComments();
          toast.success("Comment posted");
      } else {
          toast.error(res.error || "Failed to post");
      }
      setPosting(false);
  };

  const previewSrc = `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style></head><body>${submission.code}</body></html>`;
  
  const targetSrc = (() => {
      if (submission.challengeImage && !submission.challengeTarget) {
         return `<!DOCTYPE html><html><body style="margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:url('${submission.challengeImage}') no-repeat center/cover;"></body></html>`;
      }
      return `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style></head><body>${submission.challengeTarget || ""}</body></html>`;
  })();

  const formatTime = (seconds?: number | null) => {
    if (seconds === undefined || seconds === null) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Group comments
  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const CommentNode = ({ comment }: { comment: Comment }) => {
    const replies = getReplies(comment.id);
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 group">
        <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0 mt-1 ring-2 ring-black">
                 {comment.userImage ? (
                    <img src={comment.userImage} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                        {comment.userName?.charAt(0)}
                    </div>
                 )}
            </div>
            <div className="flex-1 max-w-3xl">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white/90">{comment.userName || "Anonymous"}</span>
                    <span className="text-[10px] text-zinc-600 font-mono">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="text-sm text-zinc-300 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 relative group-hover:bg-white/10 transition-colors">
                   {comment.content}
                </div>
                
                <div className="flex items-center gap-4 mt-2 ml-1">
                    <button 
                        onClick={() => {
                            setReplyingTo(replyingTo === comment.id ? null : comment.id);
                            if (replyingTo !== comment.id) setTimeout(() => document.getElementById(`reply-input-${comment.id}`)?.focus(), 0);
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <Reply className="w-3 h-3" /> Reply
                    </button>
                </div>

                {/* Nested Content (Replies + Input) */}
                {(replies.length > 0 || replyingTo === comment.id) && (
                     <div className="pl-6 mt-3 space-y-3 relative before:absolute before:left-2 before:top-0 before:bottom-0 before:w-px before:bg-white/10">
                        {replies.map(r => <CommentNode key={r.id} comment={r} />)}
                        
                        {replyingTo === comment.id && (
                             <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-1">
                                 <CornerDownRight className="w-4 h-4 text-zinc-600 absolute -left-6 top-2" />
                                <input 
                                    id={`reply-input-${comment.id}`}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment(comment.id)}
                                    placeholder={`Reply to ${comment.userName}...`}
                                    className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                                />
                                <button 
                                    onClick={() => handlePostComment(comment.id)}
                                    disabled={posting || !replyContent.trim()}
                                    className="p-1.5 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-3 h-3" />
                                </button>
                             </div>
                        )}
                     </div>
                )}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass border border-white/10 w-full max-w-7xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 shrink-0 h-16">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-zinc-400 font-normal">Submission by</span> {submission.userName || "Unknown"}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-xs text-zinc-400">
               <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                 <Target className="w-3 h-3"/> {submission.challengeTitle || "Challenge"}
              </span>
              <span>Score: <b className="text-white">{submission.score}</b></span>
              <span>Accuracy: <b className="text-white">{submission.accuracy}%</b></span>
              <span>Chars: <b className="text-white">{submission.chars ?? submission.code.length}</b></span>
              <span>Time: <b className="text-white">{formatTime(submission.duration)}</b></span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
            {/* Top Section: Code & Preview (60% height) */}
            <div className="h-[60%] flex border-b border-white/5">
                {/* Left: Code Editor */}
                <div className="flex-1 border-r border-white/5 relative bg-[#1e1e1e] flex flex-col">
                    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-[#1e1e1e] shrink-0">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Code className="w-4 h-4" /> Source Code
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">{submission.code.length} chars</span>
                    </div>
                    <div className="flex-1 relative">
                         <Editor
                            height="100%"
                            defaultLanguage="html"
                            theme="vs-dark"
                            value={submission.code}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', monospace",
                                wordWrap: "on",
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                padding: { top: 16, bottom: 16 },
                            }}
                        />
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="w-[500px] bg-[#0a0a0c] flex flex-col shrink-0 overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-[#0a0a0c] shrink-0">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Output
                        </span>
                        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                            <button
                                onClick={() => setShowTarget(false)}
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-all",
                                    !showTarget ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                Output
                            </button>
                            <button
                                onClick={() => setShowTarget(true)}
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-all",
                                    showTarget ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                Target
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:16px_16px] overflow-hidden">
                         <div className="relative group shrink-0 shadow-2xl scale-125 md:scale-100">
                             <div className="w-[400px] h-[300px] bg-white ring-1 ring-white/10 relative overflow-hidden">
                                 {showTarget ? (
                                    <>
                                        {submission.challengeImage && !submission.challengeTarget ? (
                                            <img src={submission.challengeImage} className="w-full h-full object-cover" alt="Target" />
                                        ) : (
                                            <iframe title="target" srcDoc={targetSrc} className="w-full h-full border-none pointer-events-none" />
                                        )}
                                    </>
                                 ) : (
                                    <iframe title="preview" srcDoc={previewSrc} className="w-full h-full border-none pointer-events-none bg-white" />
                                 )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Discussion (40% height) */}
            <div className="h-[40%] flex flex-col bg-[#0f0f12]">
                <div className="px-4 py-2 border-b border-white/5 bg-[#0f0f12] flex items-center gap-2 shrink-0">
                    <MessageSquare className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Discussion</span>
                     <span className="text-[10px] bg-white/10 px-1.5 rounded-full text-zinc-400">{comments.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loadingComments ? (
                        <p className="text-center text-xs text-zinc-600 mt-4">Loading comments...</p>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-zinc-600 text-sm italic">No comments yet.</p>
                            <p className="text-zinc-700 text-xs">Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        rootComments.map(comment => <CommentNode key={comment.id} comment={comment} />)
                    )}
                </div>

                {/* Main Input Area */}
                <div className="p-4 border-t border-white/5 bg-[#0f0f12] shrink-0">
                     <div className="relative max-w-4xl mx-auto">
                        <input 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                            placeholder={user ? "Write a new comment..." : "Login to comment"}
                            disabled={!user || posting}
                             className={cn(
                                "w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 shadow-inner",
                                replyingTo && "opacity-50 pointer-events-none cursor-not-allowed placeholder:text-zinc-600"
                            )}
                        />
                         {/* Hint if replying (but here we block main input if replying) */}
                         {replyingTo && (
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 bg-[#050505] px-2 flex items-center gap-2">
                                <span className="animate-pulse">Replying in thread...</span>
                                <button onClick={() => setReplyingTo(null)} className="underline hover:text-white">Cancel</button>
                             </div>
                         )}

                        <button 
                            onClick={() => handlePostComment()}
                            disabled={!user || !newComment.trim() || posting || !!replyingTo}
                            className="absolute right-2 top-2 p-2 bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white rounded-lg transition-all disabled:opacity-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
