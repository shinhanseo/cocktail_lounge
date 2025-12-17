import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pencil, Trash } from "lucide-react";
import CommonModal from "@/components/CommonModal";
import api from "@/lib/api";

export default function Comment({ postId }) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 5);

  const [comments, setComments] = useState([]);
  const [subcommentsMap, setSubcommentsMap] = useState({});
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit,
    pageCount: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postComment, setPostComment] = useState("");

  const [editCommentId, setEditCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  const [editSubId, setEditSubId] = useState(null);
  const [editSubText, setEditSubText] = useState("");

  const [replyCommentId, setReplyCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/api/comment/${postId}`, {
        params: { page, limit },
      });

      const commentsData = Array.isArray(res.data?.comments)
        ? res.data.comments
        : [];
      setComments(commentsData);
      setMeta(res.data?.meta ?? meta);

      const subMap = {};
      await Promise.all(
        commentsData.map(async (comment) => {
          const subRes = await api.get(`/api/comment/subcomment/${comment.id}`);
          subMap[comment.id] = Array.isArray(subRes.data?.subcomments)
            ? subRes.data.subcomments
            : [];
        })
      );
      setSubcommentsMap(subMap);
    } catch (err) {
      console.error(err);
      setError("댓글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, page, limit]);

  const goPage = (p) =>
    setSearchParams({ page: String(p), limit: String(limit) });

  const handleComment = async () => {
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      return;
    }
    if (!postComment.trim()) {
      setInfoMsg("댓글을 입력하세요!");
      setOpenInfoModal(true);
      return;
    }
    try {
      const res = await api.post("/api/comment", {
        postId,
        body: postComment.trim(),
      });
      if (res.status === 201) {
        setPostComment("");
        goPage(1);
        await fetchComments();
      }
    } catch (err) {
      console.error(err);
      setInfoMsg("댓글 등록 중 오류가 발생했습니다.");
      setOpenInfoModal(true);
    }
  };

  const handleEdit = (comment) => {
    setEditCommentId(comment.id);
    setEditText(comment.body);
  };

  const handleSave = async (commentId) => {
    if (!editText.trim()) {
      setInfoMsg("내용을 입력해주세요.");
      setOpenInfoModal(true);
      return;
    }
    try {
      await api.put(`/api/comment/${commentId}`, { body: editText });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, body: editText } : c))
      );
      setEditCommentId(null);
    } catch (err) {
      console.error(err);
      setInfoMsg("댓글 수정 중 오류가 발생했습니다.");
      setOpenInfoModal(true);
    }
  };

  const handleDelete = async (commentId) => {
    setDeleteTarget({ type: "comment", commentId });
    setOpenDeleteConfirm(true);
  };

  const handleReply = (commentId) => {
    if (replyCommentId === commentId) {
      setReplyCommentId(null);
      setReplyText("");
    } else {
      setReplyCommentId(commentId);
      setReplyText("");
    }
  };

  const handlePostReply = async (commentId) => {
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      return;
    }
    if (!replyText.trim()) {
      setInfoMsg("답글을 입력해주세요.");
      setOpenInfoModal(true);
      return;
    }
    try {
      await api.post("/api/comment/subcomment", {
        postId,
        body: replyText.trim(),
        commentId,
      });
      setReplyCommentId(null);
      setReplyText("");
      await fetchComments();
    } catch (err) {
      console.error(err);
      setInfoMsg("답글 등록 중 오류가 발생했습니다.");
      setOpenInfoModal(true);
    }
  };

  const handleEditSub = (sub) => {
    setEditSubId(sub.id);
    setEditSubText(sub.body);
  };

  const handleSaveSub = async (subId, parentId) => {
    if (!editSubText.trim()) {
      setInfoMsg("내용을 입력해주세요.");
      setOpenInfoModal(true);
      return;
    }
    try {
      await api.put(`/api/comment/subcomment/${subId}`, { body: editSubText });
      setSubcommentsMap((prev) => ({
        ...prev,
        [parentId]: prev[parentId].map((s) =>
          s.id === subId ? { ...s, body: editSubText } : s
        ),
      }));
      setEditSubId(null);
    } catch (err) {
      console.error(err);
      setInfoMsg("대댓글 수정 중 오류가 발생했습니다.");
      setOpenInfoModal(true);
    }
  };

  const handleDeleteSub = async (subId, parentId) => {
    setDeleteTarget({ type: "sub", subId, parentId });
    setOpenDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "comment") {
        const commentId = deleteTarget.commentId;
        await api.delete(`/api/comment/${commentId}`);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        const { subId, parentId } = deleteTarget;
        await api.delete(`/api/comment/subcomment/${subId}`);
        setSubcommentsMap((prev) => ({
          ...prev,
          [parentId]: prev[parentId].filter((s) => s.id !== subId),
        }));
      }
    } catch (err) {
      console.error(err);
      setInfoMsg("삭제 도중 오류가 발생했습니다.");
      setOpenInfoModal(true);
    } finally {
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  return (
    <section className="mt-10 text-white bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">
        댓글
      </h3>

      <div className="mb-6">
        <textarea
          placeholder="댓글을 입력하세요..."
          className="w-full bg-white/10 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={2}
          value={postComment}
          onChange={(e) => setPostComment(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <button
            className="bg-button hover:bg-button-hover text-white px-4 py-2 rounded-lg font-medium transition"
            onClick={handleComment}
          >
            등록
          </button>
        </div>
      </div>

      {loading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400">댓글이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="border-b border-white/10 pb-3 flex flex-col gap-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{comment.author}</span>
                <span className="text-sm text-gray-400">{comment.date}</span>
              </div>

              {editCommentId === comment.id ? (
                <div>
                  <textarea
                    className="w-full bg-white/10 rounded-lg p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      className="bg-button hover:bg-button-hover px-2 py-1 rounded-lg text-white text-sm hover:cursor-pointer"
                      onClick={() => handleSave(comment.id)}
                    >
                      저장
                    </button>
                    <button
                      className="bg-white/50 hover:bg-white/30 px-2 py-1 rounded-lg text-white text-sm hover:cursor-pointer"
                      onClick={() => setEditCommentId(null)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-200 whitespace-pre-line">
                    {comment.body}
                  </p>
                  <div className="flex justify-between items-center">
                    <button
                      className="text-button hover:text-button-hover text-sm hover:cursor-pointer"
                      onClick={() => handleReply(comment.id)}
                    >
                      답글쓰기
                    </button>
                    {user?.login_id === comment.author && (
                      <div className="flex gap-2">
                        <button
                          className="bg-button hover:bg-button-hover px-2 py-1 rounded-lg text-white text-sm hover:cursor-pointer"
                          onClick={() => handleEdit(comment)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="bg-white/50 hover:bg-white/30 px-2 py-1 rounded-lg text-white text-sm hover:cursor-pointer"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {subcommentsMap[comment.id]?.map((sub) => (
                <div key={sub.id} className="ml-6 mt-2">
                  {editSubId === sub.id ? (
                    <div>
                      <textarea
                        className="w-full bg-white/10 rounded-lg p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={2}
                        value={editSubText}
                        onChange={(e) => setEditSubText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          className="bg-button hover:bg-button-hover px-2 py-1 rounded-lg text-white text-sm hover:cursor-pointer"
                          onClick={() => handleSaveSub(sub.id, comment.id)}
                        >
                          저장
                        </button>
                        <button
                          className="bg-white/50 hover:bg-white/30 px-2 py-1 rounded-lg text-white text-sm hover:cursor-pointer"
                          onClick={() => setEditSubId(null)}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-gray-300">
                      <span>
                        <strong>{sub.author}</strong>: {sub.body}
                      </span>
                      <div className="flex gap-2">
                        {user?.login_id === sub.author && (
                          <>
                            <button
                              className="bg-button hover:bg-button-hover px-2 py-1 rounded-lg text-white text-sm hover:cursor-pointer"
                              onClick={() => handleEditSub(sub)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="bg-white/50 hover:bg-white/30 px-2 py-1 rounded-lg text-white text-sm hover:cursor-pointer"
                              onClick={() =>
                                handleDeleteSub(sub.id, comment.id)
                              }
                            >
                              <Trash size={16} />
                            </button>
                          </>
                        )}
                        <span className="text-xs text-gray-400">
                          {sub.date}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {replyCommentId === comment.id && (
                <div className="mt-2">
                  <textarea
                    className="w-full bg-white/10 rounded-lg p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={2}
                    placeholder="답글을 입력하세요..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      className="bg-button hover:bg-button-hover px-2 py-1 rounded-lg text-white text-sm"
                      onClick={() => handlePostReply(comment.id)}
                    >
                      등록
                    </button>
                    <button
                      className="bg-white/50 hover:bg-white/30 px-2 py-1 rounded-lg text-white text-sm"
                      onClick={() => setReplyCommentId(null)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}

          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => goPage(meta.page - 1)}
              disabled={!meta.hasPrev}
              className={`px-3 py-1 rounded-lg border border-white/10 text-sm text-white/80
                            disabled:opacity-40 hover:bg-white/10 transition
                            ${
                              meta.hasPrev ? "cursor-pointer" : "cursor-default"
                            }`}
            >
              ← 이전
            </button>
            <span className="text-sm text-white/70">
              {meta.page} / {meta.pageCount}
            </span>
            <button
              onClick={() => goPage(meta.page + 1)}
              disabled={!meta.hasNext}
              className={`px-3 py-1 rounded-lg border border-white/10 text-sm text-white/80
                            disabled:opacity-40 hover:bg-white/10 transition
                            ${
                              meta.hasNext ? "cursor-pointer" : "cursor-default"
                            }`}
            >
              다음 →
            </button>
          </div>
        </ul>
      )}

      <CommonModal
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
        title="로그인이 필요합니다"
        message="댓글/답글 작성은 로그인한 사용자만 이용할 수 있어요."
        cancelText="닫기"
        confirmText="로그인 하러가기"
        onConfirm={() => {
          setOpenLoginModal(false);
          navigate("/login");
        }}
      />

      <CommonModal
        open={openInfoModal}
        onClose={() => setOpenInfoModal(false)}
        title="알림"
        message={infoMsg}
        cancelText="확인"
      />

      <CommonModal
        open={openDeleteConfirm}
        onClose={() => {
          setOpenDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        title="삭제하시겠습니까?"
        message="삭제하면 되돌릴 수 없습니다."
        cancelText="취소"
        confirmText="삭제"
        confirmVariant="danger"
        onConfirm={confirmDelete}
      />
    </section>
  );
}
